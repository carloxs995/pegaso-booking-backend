import 'reflect-metadata';

import { injectable } from "tsyringe";
import * as admin from 'firebase-admin';
import { UserBase, UserRole } from '../models/user.model';

@injectable()
export class UsersService {

    static readonly ADMIN_ROLE: UserRole = UserRole.ADMIN;
    static readonly USER_ROLE: UserRole = UserRole.USER;
    static readonly GUEST_ROLE: UserRole = UserRole.USER;

    constructor() { }

    async createUser(userData: UserBase): Promise<admin.auth.UserRecord> {
        try {
            const userRecord = await admin.auth().createUser({
                email: userData.email,
                password: userData.password,
                emailVerified: false,
                disabled: true,
            });

            await admin.auth().setCustomUserClaims(
                userRecord.uid,
                {
                    role: UsersService.USER_ROLE,
                    firstName: userData.firstName,
                    lastname: userData.lastName
                }
            );

            return userRecord;
        } catch (e: any) {
            throw new Error(`User creation error: ${e?.message}`)
        }
    }
}
