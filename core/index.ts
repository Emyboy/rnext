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
 *   directory: './rnext',
 *   port: 1337,
 *   route: '/cms',
 *   dbConnection: `mongodb://localhost:27017/cms_app`,
 * };
 */


import express, { type Express } from 'express';
import path from 'path';
import type { RNextConfig } from '../types/app.types';
import { createCMSDirectory } from '../utils/app.utils';
import apiRoutes from '../modules/api/api.routes';
import { db } from '../config/db.config';
import fs from 'fs/promises'
import type { RNextCollection } from '../types/collection.types';
import { syncCollectionSchema } from '../utils/collection.utils';

export class RNextApp {
    private route: string;
    private app: Express;
    public directory: string;
    private port: number;
    private dbUri: string;

    constructor({ directory, port, route, dbConnection }: RNextConfig) {
        this.app = express();
        this.directory = path.resolve(directory || './rnext');
        this.port = port || 1337;
        this.route = route || '/rnext';
        this.dbUri = dbConnection;

        process.env.CMS_DIRECTORY = this.directory;
    }

    public async initialize(): Promise<void> {
        await this.prepareCMSApp();
        await this.initializeDatabase();
        this.initializeMiddleware();
        this.initializeRoutes();
    }

    private async prepareCMSApp(): Promise<void> {
        await createCMSDirectory(this.directory);
    }

    private async initializeDatabase(): Promise<void> {
        await db.connect(this.dbUri);
        await this.syncSchemas();
    }

    private initializeMiddleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(): void {
        this.app.use('/api', apiRoutes);
    }

    private async syncSchemas(): Promise<void> {
        const collectionsDir = path.join(this.directory, 'collections');

        try {
            const collections = await fs.readdir(collectionsDir);

            for (const collectionName of collections) {
                const schemaPath = path.join(collectionsDir, collectionName, 'schema.json');

                try {
                    const schemaContent = await fs.readFile(schemaPath, 'utf-8');
                    const collection: RNextCollection = JSON.parse(schemaContent);

                    await syncCollectionSchema(collection);
                    console.log(`✅ Synced schema for collection: ${collectionName}`);
                } catch (error) {
                    console.error(`Error syncing schema for collection ${collectionName}:`, error);
                }
            }

            console.log('☁️  All schemas synced successfully \n');
        } catch (error) {
            //@ts-ignore
            if (error?.code === 'ENOENT') {
                console.log('No collections directory found. Skipping schema sync.');
            } else {
                console.error('Error syncing schemas:', error);
            }
        }
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!db.connection) {
                reject(new Error('Database connection not established. Call initialize() first.'));
                return;
            }

            this.app.listen(this.port, () => {
                console.log(`🚀 server is running on >> http://localhost:${this.port}`);
                resolve();
            });
        });
    }
}