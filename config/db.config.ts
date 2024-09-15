import mongoose from 'mongoose';

class Database {
    private static instance: Database;
    private _connection: mongoose.Connection | null = null;

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(uri: string): Promise<void> {
        if (this._connection) {
            return;
        }

        try {
            await mongoose.connect(uri);
            this._connection = mongoose.connection;
            console.log('✅ Connected to MongoDB \n');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    public get connection(): mongoose.Connection | null {
        return this._connection;
    }
}

export const rNextDB = Database.getInstance();