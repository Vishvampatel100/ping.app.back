// firebaseAdmin.js
import admin from 'firebase-admin';
import serviceAccount from '../ping-back001.json' assert { type: 'json' };
import dotenv from 'dotenv';
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;
