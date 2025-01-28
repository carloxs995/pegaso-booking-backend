import 'reflect-metadata';

import { z } from 'zod';
import { injectable } from 'tsyringe';
import { UserBase, UserLogin } from '../models/user.model';

@injectable()
export class UserValidator {
    static readonly BaseSchema = z.object({
        firstName: z.string().min(3, 'firstName is mandatory'),
        lastName: z.string().min(3, 'lastName is mandatory'),
        email: z.string().email('email is not valid'),
        password: z.string().min(6, 'password is mandatory')
    })

    parseCreation(request: UserBase): UserBase {
        return UserValidator.BaseSchema.strict().strip().parse(request);
    }

    parseLogin(request: UserLogin): UserLogin {
        return UserValidator.BaseSchema.omit({ firstName: true, lastName: true }).strict().strip().parse(request);
    }
}
