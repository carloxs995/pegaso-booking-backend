import { Router } from "express";
import { createUserHandler } from "../handlers/users/createUserHandler";
import { authenticateFirebaseToken } from "../middlewares/authenticationMiddleware";
import { UserRole } from "../models/user.model";

const usersRouter = Router();

usersRouter.post(
    '/',
    (...args) => authenticateFirebaseToken(...args, UserRole.GUEST),
    createUserHandler
);

export default usersRouter;
