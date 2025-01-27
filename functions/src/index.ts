import * as functions from 'firebase-functions';
import app from './app';
import './database/firestore';

//Registrazione Firebase Cloud Function /api
export const api = functions.https.onRequest(app);
