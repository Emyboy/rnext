import express from 'express';
import collectionController from './collections.controller';


const collectionRoutes = express.Router();
const { create } = collectionController;

collectionRoutes.post('', create);

export default collectionRoutes;
