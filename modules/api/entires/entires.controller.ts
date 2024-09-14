import type { NextFunction, Request, Response } from "express";
import mongoose, { Schema } from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { rNextTypeMapping, type RNextCollectionSchema } from "../../../types/collection.types";
import { getModelForCollection } from "../../../utils/collection.utils";

const entriesController = {
    find: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const collectionName = req.params.collection_name;
            const populateFields = req.query.populate ? (req.query.populate as string).split(',') : [];
            const limit = parseInt(req.query.limit as string) || 10;

            const modelDef = await getModelForCollection(collectionName);

            if(!modelDef) {
                return res.status(404).json({ message: `Collection '${collectionName}' not found.` });
            }

            const query = modelDef.find().limit(limit);

            if (populateFields.length > 0) {
                populateFields.forEach(field => {
                    query.populate(field);
                });
            }

            const entries = await query.exec();

            res.status(200).json({ collection: collectionName, entries });
        } catch (err) {
            console.error('Error fetching entries:', err);
            next(err);
        }
    },
    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const incomingEntry = req.body;
            const collectionName = req.params.collection_name;

            const cmsDirectory = process.env.CMS_DIRECTORY as string;
            const schemaFilePath = path.join(cmsDirectory, 'collections', collectionName, 'schema.json');

            try {
                await fs.access(schemaFilePath);
            } catch (err) {
                return res.status(404).json({ message: `Schema file for collection '${collectionName}' not found.` });
            }

            const modelDef = await getModelForCollection(collectionName);

            if(!modelDef) {
                return res.status(404).json({ message: `Collection '${collectionName}' not found.` });
            }

            const newEntry = new modelDef(incomingEntry);
            const result = await newEntry.save();

            res.status(201).json({ message: `Entry added to the ${collectionName} collection`, data: result });
        } catch (err) {
            console.error('Error inserting entry:', err);
            next(err);
        }
    }
};

export default entriesController;
