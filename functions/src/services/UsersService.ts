import 'reflect-metadata';

import { injectable } from "tsyringe";
import * as admin from 'firebase-admin';
import { UserBase, UserBaseDetails, UserCustomClaims, UserRole } from '../models/user.model';
import { Request } from 'express';

@injectable()
export class UsersService {

    static readonly ADMIN_ROLE: UserRole = UserRole.ADMIN;
    static readonly USER_ROLE: UserRole = UserRole.USER;
    static readonly GUEST_ROLE: UserRole = UserRole.USER;

    constructor() { }

    setUserUIDOnRequestHeader = (request: Request, uid: string): Request => {
        request.headers['firebase-user-uid'] = uid;
        return request;
    }

    getUserUIDdByHeader = (request: Request): string => (request.headers['firebase-user-uid'] ?? '') as string;

    private async _verifyToken(bearerToken: string): Promise<admin.auth.DecodedIdToken> {
        try {
            const token = bearerToken.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            if (!decodedToken.email_verified) {
                throw new Error('Email not verified');
            }

            return decodedToken;
        } catch (e: any) {
            throw new Error(`Verify Token error: ${e?.message}`)
        }
    }

    async createUser(userData: UserBase): Promise<admin.auth.UserRecord> {
        try {
            const userRecord = await admin.auth().createUser({
                email: userData.email,
                password: userData.password,
                emailVerified: false,
                disabled: false,
            });


            await admin.auth().setCustomUserClaims(
                userRecord.uid,
                this._getCustomClaims(userData)
            );

            return userRecord;
        } catch (e: any) {
            throw new Error(`User creation error: ${e?.message}`)
        }
    }

    async getUser(bearerToken: string): Promise<UserBaseDetails> {
        try {
            const { uid } = await this._verifyToken(bearerToken);
            const userData = await admin.auth().getUser(uid);
            return {
                uid: userData.uid,
                email: userData.email,
                firstName: userData.customClaims?.firstName,
                lastName: userData.customClaims?.lastName,
                role: userData.customClaims?.role,
            }
        } catch (e: any) {
            throw new Error(e?.message)
        }
    }

    private _getCustomClaims(userData: UserBase): UserCustomClaims {
        return {
            role: UsersService.USER_ROLE,
            firstName: userData.firstName,
            lastName: userData.lastName
        }
    }
}
