import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { rNextTypeMapping, type RNextCollectionSchema } from '../types/collection.types';

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
