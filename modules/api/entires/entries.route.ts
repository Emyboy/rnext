import express from 'express';
import entriesController from './entires.controller';

const entiresRoutes = express.Router();
const { create, find, findOne } = entriesController;

entiresRoutes.post('/:collection_name', create);
entiresRoutes.get('/:collection_name', find);
entiresRoutes.get('/:collection_name/:entry_id', findOne);

export default entiresRoutes;
