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

    setUserUIDOnRequestHeader = (request: Request, uid: string, role: UserRole): Request => {
        request.headers['x-firebase-user-uid'] = uid;
        request.headers['x-firebase-user-role'] = role.toString();
        return request;
    }

    getUserUIDdByHeader = (request: Request): string => (request.headers['x-firebase-user-uid'] ?? '') as string;
    getUserRoledByHeader = (request: Request): UserRole => Number(request.headers['x-firebase-user-role']) ?? UserRole.GUEST;

    private async _verifyToken(bearerToken: string): Promise<admin.auth.DecodedIdToken> {
        try {
            const token = bearerToken.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            // if (!decodedToken.email_verified) { //TODO: SI POTREBBE INTRODURRE LA VERIFICA DELL'EMAIL
            //     throw new Error('Email not verified');
            // }

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
                id: userData.uid,
                email: userData.email!,
                emailVerified: userData.emailVerified,
                disabled: userData.disabled,
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

    async getUsersList(pageSize: number, pageToken?: string): Promise<{ items: UserBaseDetails[], pageToken: string | undefined }> {
        if (!pageToken) { //TODO: check it
            pageToken = undefined;
        }

        const listUsersResult = await admin.auth().listUsers(pageSize, pageToken);

        const usersListsRemapped = listUsersResult.users.map(
            user => ({
                id: user.uid,
                email: user.email!,
                emailVerified: user.emailVerified,
                disabled: user.disabled,
                role: user.customClaims?.role,
                firstName: user.customClaims?.firstName,
                lastName: user.customClaims?.lastName,
            }) satisfies UserBaseDetails
        );

        return {
            items: usersListsRemapped,
            pageToken: listUsersResult.pageToken
        };
    }
}
