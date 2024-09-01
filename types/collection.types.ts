
export interface RNextCollection {
    _id: string;
    name: string;
    slug: string;
    schema: RNextCollectionSchema[]
}

export interface RNextCollectionSchema {
    _id: string;
    key: string;
    type: RNextCollectionSchemaType;
    required: boolean;
    unique: boolean;
    default: Record<string, any> | number | string | boolean | null;
    // ref: Ref; mongoDB Document reference
}

export enum RNextCollectionSchemaType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    DATE = 'date',
    OBJECT = 'object',
    ARRAY = 'array',
    GEO = 'geo',
    FILE = 'file',
    REFERENCE = 'reference',
    RELATION = 'relation',
    ENUM = 'enum',
    JSON = 'json'
}
