import express from 'express';
import adminUserRoute from './admin-users/admin-user.route';
import adminConfigRoute from './admin-config/admin-config.route';

const adminRoutes = express.Router();

adminRoutes.use('/admin', adminUserRoute);
adminRoutes.use('/admin-config', adminConfigRoute);

export default adminRoutes
