import { Request, Response } from "express";
import { container } from "tsyringe";
import { z } from "zod";
import { UsersService } from "../../services/UsersService";

export async function getUserHandler(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Access Denied' });
        return;
    }

    try {
        const userService = container.resolve<UsersService>(UsersService);
        const userData = await userService.getUser(authHeader);
        res.status(200).json({ data: userData });
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
