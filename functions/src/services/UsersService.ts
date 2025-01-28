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

    /**
     * Imposta l'UID dell'utente e il ruolo negli header della richiesta.
     * @param {Request} request - La richiesta HTTP.
     * @param {string} uid - L'UID dell'utente.
     * @param {UserRole} role - Il ruolo dell'utente.
     * @returns {Request} - La richiesta HTTP modificata.
     */
    setUserUIDOnRequestHeader = (request: Request, uid: string, role: UserRole): Request => {
        request.headers['x-firebase-user-uid'] = uid;
        request.headers['x-firebase-user-role'] = role.toString();
        return request;
    }

    /**
     * Ottiene l'UID dell'utente dagli header della richiesta.
     * @param {Request} request - La richiesta HTTP.
     * @returns {string} - L'UID dell'utente.
     */
    getUserUIDdByHeader = (request: Request): string => (request.headers['x-firebase-user-uid'] ?? '') as string;

    /**
     * Ottiene il ruolo dell'utente dagli header della richiesta.
     * @param {Request} request - La richiesta HTTP.
     * @returns {UserRole} - Il ruolo dell'utente.
     */
    getUserRoledByHeader = (request: Request): UserRole => Number(request.headers['x-firebase-user-role']) ?? UserRole.GUEST;

    /**
     * Verifica il token di autenticazione e restituisce il token decodificato.
     * @param {string} bearerToken - Il token di autenticazione.
     * @returns {Promise<admin.auth.DecodedIdToken>} - Il token decodificato.
     * @throws {Error} - Se il token non è valido.
     */
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

    /**
     * Crea un nuovo utente con i dati forniti.
     * @param {UserBase} userData - I dati dell'utente.
     * @returns {Promise<admin.auth.UserRecord>} - Il record dell'utente creato.
     * @throws {Error} - Se la creazione dell'utente fallisce.
     */
    async createUser(userData: UserBase): Promise<admin.auth.UserRecord> {
        try {
            const userRecord = await admin.auth().createUser({
                email: userData.email,
                password: userData.password,
                emailVerified: false,
                disabled: false,
            });

            // Imposta i custom claims per l'utente creato
            await admin.auth().setCustomUserClaims(
                userRecord.uid,
                this._getCustomClaims(userData)
            );

            return userRecord;
        } catch (e: any) {
            throw new Error(`User creation error: ${e?.message}`)
        }
    }

    /**
     * Ottiene i dettagli dell'utente utilizzando il token di autenticazione.
     * @param {string} bearerToken - Il token di autenticazione.
     * @returns {Promise<UserBaseDetails>} - I dettagli dell'utente.
     * @throws {Error} - Se il token non è valido o se non è possibile ottenere i dettagli dell'utente.
     */
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

    /**
     * Restituisce i custom claims per l'utente.
     * @param {UserBase} userData - I dati dell'utente.
     * @returns {UserCustomClaims} - I custom claims dell'utente.
     */
    private _getCustomClaims(userData: UserBase): UserCustomClaims {
        return {
            role: UsersService.USER_ROLE,
            firstName: userData.firstName,
            lastName: userData.lastName
        }
    }

    /**
     * Ottiene una lista di utenti con paginazione.
     * @param {number} pageSize - Il numero di utenti per pagina.
     * @param {string} [pageToken] - Il token per la pagina successiva.
     * @returns {Promise<{ items: UserBaseDetails[], pageToken: string | undefined }>} - La lista degli utenti e il token per la pagina successiva.
     */
    async getUsersList(pageSize: number, pageToken?: string): Promise<{ items: UserBaseDetails[], pageToken: string | undefined }> {
        if (!pageToken) { //TODO: check it
            pageToken = undefined;
        }

        const listUsersResult = await admin.auth().listUsers(pageSize);

        console.timeLog('listUserResult', listUsersResult);

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
