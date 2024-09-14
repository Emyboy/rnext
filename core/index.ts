import express, { type Express } from 'express';
import path from 'path';
import mongoose, { Schema } from 'mongoose';
import { textUserCollection } from '../__mock__/user.mock';
import { rNextTypeMapping, type RNextCollectionSchema } from '../types/collection.types';
import type { RNextConfig } from '../types/app.types';
import collectionRoutes from '../modules/api/collections/collections.route';
import { createCMSDirectory } from '../utils/app.utils';

/**
 * RNextApp class is the main class for the rNext CMS application
 * @class RNextApp 
 * @param {RNextConfig} config - The configuration object for the rNext CMS application
 * @param {string} config.dbName - The name of the MongoDB database
 * @param {string} config.directory - The directory where the CMS files are stored
 * @param {number} config.port - The port number for the CMS application
 * @param {string} config.route - The route for the CMS application
 * @returns {void}
 * @example 
 * const config: RNextConfig = {
 *    dbName: 'cms_app',
 *    directory: './cms',
 *    port: 1337,
 *    route: '/cms',
 * };
 */
export class RNextApp {
    private app: Express;
    private dbName: string;
    public directory: string;
    private port: number;
    private route: string;

    constructor({ dbName, directory, port, route }: RNextConfig) {
        this.app = express();
        this.dbName = dbName as string;
        this.directory = path.resolve(directory || './rnext');
        this.port = port || 1337;
        this.route = route || '/rnext';

        process.env.CMS_DIRECTORY = this.directory;

        this.prepareCMSApp();
        this.initializeMiddleware();
        this.initializeDatabase();
        this.initializeRoutes();
    }

    private async initializeMiddleware(){
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private async prepareCMSApp() {
        await createCMSDirectory(this.directory);
    }

    private async initializeDatabase() {
        try {
            await mongoose.connect(`mongodb://localhost:27017/${this.dbName}`);
            console.log(`Connected to MongoDB database: ${this.dbName}`);
        } catch (error) {
            console.error('Failed to connect to MongoDB', error);
            process.exit(1);
        }
    }

    private initializeRoutes() {
        // this.app.use(this.route, express.static(this.directory));

        this.app.use('/api/collections', collectionRoutes)

        this.app.get('/add/:collection_name', async (req, res) => {
            try {
                const collectionName = req.params.collection_name;
                const schemaDef: Schema = new Schema(
                    {
                        ...textUserCollection.schema.reduce((acc, schema: RNextCollectionSchema) => {
                            //@ts-ignore
                            acc[schema.key] = {
                                type: rNextTypeMapping[schema.type] || Schema.Types.Mixed,
                                required: schema.required,
                                unique: schema.unique,
                                default: schema.default,
                            };
                            return acc;
                        }, {}),
                    },
                    {
                        timestamps: true,
                    }
                );
                const modelDef = mongoose.model(collectionName, schemaDef);

                const dummyUser = {
                    name: 'John Doe',
                    email: 'john2.doe@example.com',
                    password: 'password123',
                };

                const newEntry = new modelDef(dummyUser);
                const result = await newEntry.save();

                res.send(`Added to the ${collectionName} collection` + result._id);
            } catch (err) {
                console.error('Error inserting user:', err);
                res.status(500).json({ error: 'Error inserting user', data: err });
            }
        });
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`rNext CMS is running on port ${this.port}`);
        });
    }
}
