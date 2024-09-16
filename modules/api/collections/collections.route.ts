import express from 'express';
import collectionController from './collections.controller';
import { validateCollectionCreation } from './collection.middleware';

const collectionRoutes = express.Router();
const { create } = collectionController;

collectionRoutes.post('/', validateCollectionCreation, create);

export default collectionRoutes;
