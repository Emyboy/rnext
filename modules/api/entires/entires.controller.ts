import type { NextFunction, Request, Response } from "express";
import fs from 'fs/promises';
import path from 'path';
import { getModelForCollection, getModel } from "../../../utils/collection.utils";
import { db } from "../../../config/db.config";

const entriesController = {
    find: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const collectionName = req.params.collection_name;
            const populateFields = req.query.populate ? (req.query.populate as string).split(',') : [];
            const limit = parseInt(req.query.limit as string) || 10;
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * limit;

            if (!db.connection) {
                throw new Error('Database connection not established');
            }

            const Model = getModel(collectionName);

            if (!Model) {
                return res.status(404).json({ error: `Collection '${collectionName}' not found` });
            }

            let query = Model.find();

            populateFields.forEach(field => {
                query = query.populate(field.toLocaleLowerCase().trim(), { strictPopulate: false });
            });

            query = query.skip(skip).limit(limit);

            const results = await query.exec();

            const totalCount = await Model.countDocuments();

            res.status(200).json({
                data: results,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: limit
                }
            });
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
