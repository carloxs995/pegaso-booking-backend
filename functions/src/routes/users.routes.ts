import { Router } from "express";
import { createUserHandler } from "../handlers/users/createUserHandler";
import { authenticateFirebaseToken } from "../middlewares/authenticationMiddleware";
import { UserRole } from "../models/user.model";
import { getUserHandler } from "../handlers/users/getUserHandler";

const usersRouter = Router();

usersRouter.post(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.GUEST),
    createUserHandler
);

usersRouter.post(
    '/me',
    (...args) => authenticateFirebaseToken(...args, UserRole.USER),
    getUserHandler
);

export default usersRouter;
