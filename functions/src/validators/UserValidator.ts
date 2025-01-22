import 'reflect-metadata';

import { injectable } from "tsyringe";
import { z } from 'zod';
import { UserBase } from '../models/user.model';

@injectable()
export class UserValidator {
    static readonly BaseSchema = z.object({
        firstName: z.string().min(3, 'firstName is mandatory'),
        lastName: z.string().min(3, 'lastName is mandatory'),
        email: z.string().email('email is not valid'),
        password: z.string().min(6, 'password is mandatory')
    });

    parseCreation(request: UserBase) {
        return UserValidator.BaseSchema.strict().strip().parse(request);
    }
}
