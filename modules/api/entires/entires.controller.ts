import type { NextFunction, Request, Response } from "express";
import { rNextDB } from "../../../config/db.config";
import rNextQuery from "../../../core/entries-query";

const entriesController = {
    find: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const collectionName = req.params.collection_name;
            const populateFields = req.query.populate ? (req.query.populate as string).split(',') : [];
            const limit = parseInt(req.query.limit as string) || 10;
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * limit;

            if (!rNextDB.connection) {
                throw new Error('Database connection not established');
            }

            let queryResult = await new rNextQuery(collectionName).find({
                populateFields,
                skip,
                limit,
                page
            });

            res.status(200).json(queryResult);
        } catch (err) {
            console.error('Error fetching entries:', err);
            next(err);
        }
    },
    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const incomingEntry = req.body;
            const collectionName = req.params.collection_name?.toLocaleLowerCase()?.trim();

            const newEntry = await new rNextQuery(collectionName).create(incomingEntry);

            res.status(201).json(newEntry);
        } catch (err) {
            console.error('Error inserting entry:', err);
            //@ts-ignore
            if (err.name === 'ValidationError') {
                //@ts-ignore
                const validationErrors = Object.values(err.errors).map((error: any) => ({
                    field: error.path,
                    message: error.message
                }));
                return res.status(400).json({
                    message: 'Validation error',
                    errors: validationErrors
                });
            }
            next(err);
        }
    },
    findOne: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const collectionName = req.params.collection_name;
            const entryId = req.params.entry_id;
            const populateFields = req.query.populate ? (req.query.populate as string).split(',') : [];

            if (!rNextDB.connection) {
                throw new Error('Database connection not established');
            }

            let queryResult = await new rNextQuery(collectionName).findOne({ id: entryId, populateFields });

            res.status(200).json(queryResult);
        } catch (err) {
            console.error('Error fetching entry:', err);
            next(err);
        }
    }
};

export default entriesController;
