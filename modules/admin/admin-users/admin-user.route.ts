import express from 'express';
import adminUserController from './admin-user.controller';

const adminUserRoute = express.Router();
const { inviteUser, login, register, } = adminUserController;

adminUserRoute.post('/register', register);
adminUserRoute.post('/invite', inviteUser);
adminUserRoute.post('/login', login);

export default adminUserRoute;
