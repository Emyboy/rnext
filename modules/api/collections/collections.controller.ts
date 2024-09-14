import type { NextFunction, Request, Response } from "express";
import fs from 'fs/promises';
import path from 'path';
import { type RNextCollection, type RNextCollectionSchema } from "../../../types/collection.types";
import { syncCollectionSchema } from "../../../utils/collection.utils";

const collectionController = {
    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const collection = req.body as RNextCollection;

            const cmsDirectory = process.env.CMS_DIRECTORY as string;
            const collectionsDir = path.join(cmsDirectory, 'collections');
            const collectionDir = path.join(collectionsDir, collection.name.toLowerCase().trim());

            await fs.mkdir(collectionsDir, { recursive: true });
            await fs.mkdir(collectionDir, { recursive: true });

            const schemaFilePath = path.join(collectionDir, 'schema.json');
            await fs.writeFile(schemaFilePath, JSON.stringify(collection, null, 2), 'utf-8');

            await syncCollectionSchema(collection);

            console.log(`➡️  Created '${collection.name}' collection`);
            res.status(200).send(`Collection '${collection.name}' created successfully`);
        } catch (error) {
            console.error('Error creating collection:', error);
            return next(error);
        }
    }
};



export default collectionController;
