import express from 'express';
import collectionRoutes from './collections/collections.route';
import entiresRoutes from './entires/entries.route';

const apiRoutes = express.Router();

apiRoutes.use('/collections', collectionRoutes);
apiRoutes.use('/entires', entiresRoutes);

export default apiRoutes;

