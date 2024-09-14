import express, { type Express } from 'express';
import path from 'path';
import mongoose from 'mongoose';
import type { RNextConfig } from '../types/app.types';
import { createCMSDirectory } from '../utils/app.utils';
import apiRoutes from '../modules/api/api.routes';

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

export class RNextApp {
    private route: string;
    private app: Express;
    public directory: string;
    private port: number;
    public dbConnection: mongoose.Connection | null = null;
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
        try {
            await mongoose.connect(this.dbUri);
            this.dbConnection = mongoose.connection;
            console.log(`Connected to MongoDB database`);
        } catch (error) {
            console.error('Failed to connect to MongoDB', error);
            throw error;
        }
    }

    private initializeMiddleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(): void {
        this.app.use('/api', apiRoutes);
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.dbConnection) {
                reject(new Error('Database connection not established. Call initialize() first.'));
                return;
            }

            this.app.listen(this.port, () => {
                console.log(`rNext CMS is running on port ${this.port}`);
                resolve();
            });
        });
    }
}