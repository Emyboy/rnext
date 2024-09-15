import { Model, model, Schema } from 'mongoose';
import { rNextTypeMapping, type RNextCollection, type RNextCollectionSchema } from '../types/collection.types';
import { rNextDB } from '../config/db.config';


export function getModel(collectionName: string): Model<any> {
    return model(collectionName.toLocaleLowerCase().trim());
}

export async function syncCollectionSchema(collection: RNextCollection) {
    if (!rNextDB.connection) {
        throw new Error('Database connection not established');
    }

    const schemaDefinition: Record<string, any> = {};

    collection.schema.forEach((field: RNextCollectionSchema) => {
        const schemaField: any = {
            ...field,
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
    const ModelName = collection.slug.toLowerCase().trim()

    try {
        if (rNextDB.connection.models[ModelName]) {
            rNextDB.connection.models[ModelName].schema = schema;
        } else {
            model(ModelName, schema);
        }
    } catch (error) {
        console.error(`Error creating/updating MongoDB schema for '${collection.name}':`, error);
        throw error;
    }
}