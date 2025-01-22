import { z } from "zod";
import { UserValidator } from "../validators/UserValidator";
import * as admin from 'firebase-admin';

export enum UserRole {
    GUEST = 1,
    USER = 2,
    ADMIN = 3,
}

export interface UserCustomClaims {
    role: UserRole;
    firstName: string;
    lastName: string;
}

export type UserBase = z.infer<typeof UserValidator.BaseSchema>;
export type UserLogin = Pick<UserBase, 'email' | 'password'>;
export type UserBaseDetails = Pick<admin.auth.UserRecord, 'uid' | 'email'> & UserCustomClaims;
