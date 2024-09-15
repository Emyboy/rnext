import type { RNextCollection } from "../../../types/collection.types";

const adminUserSchema: RNextCollection = {
    _id: 'r_admin_user',
    name: 'Admin User',
    slug: 'r_admin_user',
    schema: [
        {
            key: 'email',
            type: 'string',
            required: true,
            unique: true,
            default: null,
            select: true
        },
        {
            key: 'password',
            type: 'string',
            required: true,
            unique: false,
            default: null,
            select: false
        },
        {
            key: 'name',
            type: 'string',
            required: true,
            unique: false,
            default: null,
            select: true
        },
        {
            key: 'role',
            type: 'enum',
            required: true,
            unique: false,
            default: 'user',
            select: true
        }
    ]
}

export default adminUserSchema;