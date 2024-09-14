import express from 'express';
import entriesController from './entires.controller';

const entiresRoutes = express.Router();
const { create, find } = entriesController;

entiresRoutes.post('/:collection_name', create);
entiresRoutes.get('/:collection_name', find);

export default entiresRoutes;
