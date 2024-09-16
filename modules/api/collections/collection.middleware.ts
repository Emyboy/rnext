import { body, checkSchema, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { rNextTypeMapping } from '../../../types/collection.types';

export const validateCollectionCreation = [
    // body('_id').optional().isString(),
    body('name').notEmpty().withMessage('Name is required').isString(),
    // body('slug').notEmpty().withMessage('Slug is required').isString(),
    body('schema')
        .isArray({ min: 2 })
        .withMessage('Schema must be an array with at least 2 fields'),

    body('schema.*.key')
        .notEmpty().withMessage('Each schema object must have a key')
        .isString(),
    body('schema.*.type')
        .notEmpty().withMessage('Each schema object must have a type')
        .isString()
        .custom(value => {
            if (!Object.keys(rNextTypeMapping).includes(value)) {
                throw new Error(`Invalid type: ${value}`);
            }
            return true;
        }),
    body('schema.*.required').isBoolean().withMessage('Required must be a boolean'),
    body('schema.*.unique').isBoolean().withMessage('Unique must be a boolean'),
    body('schema.*.default').optional(),
    body('schema.*.index').isBoolean(),
    body('schema.*.select').isBoolean().withMessage('Select must be a boolean'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
