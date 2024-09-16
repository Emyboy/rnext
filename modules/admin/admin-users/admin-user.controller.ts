import type { NextFunction, Request, Response } from "express";

const adminUserController = {
    register: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Code here
        } catch (error) {
            console.log('ADMIN USER REGISTER ERROR:', error);
            next(error);
        }
    },
    login: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Code here
        } catch (error) {
            console.log('ADMIN USER LOGIN ERROR:', error);
            next(error);
        }
    },
    inviteUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Code here
        } catch (error) {
            console.log('ADMIN USER INVITE ERROR:', error);
            next(error);
        }
    }
}

export default adminUserController;
