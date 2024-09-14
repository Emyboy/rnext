import { Schema } from 'mongoose'
export interface RNextCollection {
    _id: string;
    name: string;
    slug: string;
    schema: RNextCollectionSchema[]
}

export interface RNextCollectionSchema {
    key: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'geo' | 'file' | 'reference' | 'relation' | 'enum' | 'json';
    required: boolean;
    unique: boolean;
    default: Record<string, any> | number | string | boolean | null;
    ref?: Document | null;
    select: boolean;
}

export const rNextTypeMapping: Record<string, any> = {
    string: String,
    number: Number,
    boolean: Boolean,
    date: Date,
    object: Schema.Types.Mixed,
    array: [Schema.Types.Mixed],
    file: Schema.Types.Mixed, 
    reference: Schema.Types.ObjectId,
    relation: Schema.Types.Mixed, 
    enum: String, 
    json: Schema.Types.Mixed
};

