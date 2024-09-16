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
    required: boolean | [boolean, string]; 
    unique: boolean;
    default?: Record<string, any> | number | string | boolean | null | (() => any);
    ref?: string;
    select: boolean;
    index: boolean;
    sparse?: boolean;
    min?: number | Date;
    max?: number | Date;
    minlength?: number;
    maxlength?: number;
    match?: RegExp;
    enum?: string[];
    validate?: (value: any) => boolean | Promise<boolean>;
    immutable?: boolean;
    get?: (value: any) => any; // Custom getter and setter functions to manipulate 
    set?: (value: any) => any; //  values when retrieving and saving data.
    alias?: string;
    lowercase?: boolean;
    uppercase?: boolean;
    trim?: boolean;
    expires?: number | string; // when the document expires
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

