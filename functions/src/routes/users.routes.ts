import { Router } from "express";
import { createUserHandler } from "../handlers/users/createUserHandler";
import { authenticateFirebaseToken } from "../middlewares/authenticationMiddleware";
import { UserRole } from "../models/user.model";
import { getUserHandler } from "../handlers/users/getUserHandler";
import { getAllUsersHandler } from "../handlers/users/getAllUsersHandler";

const usersRouter = Router();

//GET /users
usersRouter.get(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.ADMIN),
    getAllUsersHandler
);

//POST /users
usersRouter.post(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.GUEST),
    createUserHandler
);

//GET /users/me
usersRouter.get(
    '/me',
    (...args) => authenticateFirebaseToken(...args, UserRole.USER),
    getUserHandler
);

export default usersRouter;
