import express, { type Express } from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';
import type { RNextConfig } from "../types/app.types";

export class RNextApp {
    private app: Express;
    private dbClient: MongoClient;
    private dbName: string;
    private directory: string;
    private port: number;
    private route: string;

    constructor({ dbName = 'rNextDB', directory = './cms', port = 3000, route = '/rnext' }: RNextConfig) {
        this.app = express();
        this.dbClient = new MongoClient(`mongodb://localhost:27017/${dbName}`);
        this.dbName = dbName;
        this.directory = path.resolve(directory);
        this.port = port;
        this.route = route;

        this.initializeDatabase();
        this.initializeRoutes();
    }

    private async initializeDatabase() {
        try {
            await this.dbClient.connect();
            console.log(`Connected to MongoDB database: ${this.dbName}`);
        } catch (error) {
            console.error('Failed to connect to MongoDB', error);
            process.exit(1);
        }
    }

    private initializeRoutes() {
        this.app.use(this.route, express.static(this.directory));

        this.app.get('/', async (req, res) => {
            try {
                const database = this.dbClient.db(this.dbName);
                const usersCollection = database.collection('users');

                const dummyUser = {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    age: 30
                };

                const result = await usersCollection.insertOne(dummyUser);

                res.send('User inserted with ID: ' + result.insertedId);
            } catch (err) {
                console.error('Error inserting user:', err);
                res.status(500).send('Internal Server Error');
            }
        });
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`rNext CMS is running on port ${this.port}`);
        });
    }
}
