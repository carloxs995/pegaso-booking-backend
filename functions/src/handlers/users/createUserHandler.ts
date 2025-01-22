import { Request, Response } from "express";
import { container } from "tsyringe";
import { UserValidator } from "../../validators/UserValidator";
import { DITokens } from "../../di-tokens";
import { UsersService } from "../../services/UsersService";
import { z } from "zod";

export async function createUserHandler(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName } = req.body;

    const userValidator = container.resolve<UserValidator>(DITokens.userValidator);
    const userService = container.resolve<UsersService>(DITokens.userService);

    try {
        const userData = userValidator.parseCreation({ email, password, firstName, lastName });
        const userCreated = await userService.createUser(userData);

        res.status(201).json({
            message: 'User registered successfully',
            data: {
                id: userCreated.uid
            }
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: 'Input data not valid',
                errors: error.errors,
            });
        }
        console.error('Error registering user:', error);
        res.status(500).json({ error: error.message });
    }
}
