import mongoose, { model, Schema } from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { rNextTypeMapping, type RNextCollection, type RNextCollectionSchema } from '../types/collection.types';
import { db } from '../config/db.config';


const schemaRegistry = new Map<string, mongoose.Model<any>>();

export const getModelForCollection = async (collectionName: string) => {
    if (schemaRegistry.has(collectionName)) {
        return schemaRegistry.get(collectionName);
    }

    const cmsDirectory = process.env.CMS_DIRECTORY as string;
    const schemaFilePath = path.join(cmsDirectory, 'collections', collectionName, 'schema.json');

    try {
        await fs.access(schemaFilePath);
    } catch (err) {
        throw new Error(`Schema file for collection '${collectionName}' not found.`);
    }

    const schemaData = await fs.readFile(schemaFilePath, 'utf-8');
    const collectionSchema = JSON.parse(schemaData);

    const schemaDef = new mongoose.Schema(
        {
            ...collectionSchema.schema.reduce((acc: any, schema: RNextCollectionSchema) => {
                acc[schema.key] = {
                    ...schema,
                    type: rNextTypeMapping[schema.type] || mongoose.Schema.Types.Mixed,
                    required: schema.required,
                    unique: schema.unique,
                    default: schema.default,
                };
                return acc;
            }, {}),
        },
        {
            timestamps: true
        }
    );

    const modelDef = mongoose.models[collectionName] || mongoose.model(collectionName, schemaDef);
    schemaRegistry.set(collectionName, modelDef);

    return modelDef;
};

export function getModel(collectionName: string) {
    return model(collectionName.toLocaleLowerCase().trim());
}

export async function syncCollectionSchema(collection: RNextCollection) {
    if (!db.connection) {
        throw new Error('Database connection not established');
    }

    const schemaDefinition: Record<string, any> = {};

    collection.schema.forEach((field: RNextCollectionSchema) => {
        const schemaField: any = {
            type: rNextTypeMapping[field.type],
            required: field.required,
            unique: field.unique,
            default: field.default,
            select: field.select,
        };

        if (field.ref) {
            schemaField.ref = field.ref;
        }

        schemaDefinition[field.key] = schemaField;
    });

    const schema = new Schema(schemaDefinition, { timestamps: true });
    // const ModelName = `${collection.name.charAt(0).toUpperCase() + collection.name.slice(1)}`;
    const ModelName = collection.name.toLowerCase().trim()

    try {
        if (db.connection.models[ModelName]) {
            db.connection.models[ModelName].schema = schema;
        } else {
            model(ModelName, schema);
        }
    } catch (error) {
        console.error(`Error creating/updating MongoDB schema for '${collection.name}':`, error);
        throw error;
    }
}