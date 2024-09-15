import path from 'path';
import { getModel } from '../utils/collection.utils';
import type { Model } from 'mongoose';
import fs from 'fs/promises';
import { rNextDB } from '../config/db.config';


export interface rNextEntriesQueryFindOptions {
    populateFields: string[];
    limit: number;
    page: number;
    skip: number;
};

export interface rNextEntiresQueryFindResult {
    data: any[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export default class rNextEntriesQuery {
    private collection: string;
    private cmsDirectory: string;
    private schemaFilePath: string;
    private model: Model<any>;

    constructor(collection: string) {
        this.collection = collection;
        this.cmsDirectory = process.env.CMS_DIRECTORY as string;
        this.schemaFilePath = path.join(this.cmsDirectory, 'collections', this.collection.toLocaleLowerCase().trim(), 'schema.json');
        this.model = getModel(this.collection);

        if (!rNextDB.connection) {
            throw new Error('Database connection not established');
        }
    }

    public async find({ populateFields, skip, limit, page }: rNextEntriesQueryFindOptions): Promise<rNextEntiresQueryFindResult> {
        let query = this.model.find();

        populateFields.forEach(field => {
            query = query.populate(field.toLocaleLowerCase().trim(), { strictPopulate: false });
        });

        query = query.skip(skip).limit(limit);

        const results = await query.exec();

        const totalCount = await this.model.countDocuments();

        return {
            data: results,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit
            }
        };
    }

    public async findOne({ id, populateFields }: { id: string; populateFields: string[] }): Promise<void> {
        await fs.access(this.schemaFilePath);

        let result = await this.model.findById(id);

        populateFields.forEach(field => {
            result = result.populate(field.toLocaleLowerCase().trim(), { strictPopulate: false });
        })

        if (!result) {
            throw new Error(`Entry with ID '${id}' not found in collection '${this.collection}'`);
        }

        return result;
    }

    public async create(data: any): Promise<any> {
        await fs.access(this.schemaFilePath);

        const newEntry = new this.model(data);
        const savedEntry = await newEntry.save();
        return {
            message: `Entry created successfully in collection '${this.collection}'`,
            data: savedEntry
        }
    }
}
