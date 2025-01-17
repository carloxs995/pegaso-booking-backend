import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import app from './app';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}
export const dbFirestore = admin.firestore();

export const api = functions.https.onRequest(app);
