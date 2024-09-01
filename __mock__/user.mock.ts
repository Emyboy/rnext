import type { RNextCollection } from "../types/collection.types";

export const textUserCollection: RNextCollection = {
    _id: '1',
    name: 'users',
    slug: 'users',
    schema: [
        {
            _id: '1',
            key: 'name',
            type: 'string',
            required: true,
            select: true,
            unique: false,
            default: null,
        },
        {
            _id: '2',
            key: 'email',
            type: 'string',
            required: true,
            select: true,
            unique: true,
            default: null,
        },
        {
            _id: '3',
            key: 'password',
            type: 'string',
            required: true,
            select: false,
            unique: false,
            default: null,
        },
    ],
}