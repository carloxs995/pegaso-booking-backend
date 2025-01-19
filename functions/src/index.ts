import * as functions from 'firebase-functions';
import app from './app';
import './database/firestore';

export const api = functions.https.onRequest(app);
