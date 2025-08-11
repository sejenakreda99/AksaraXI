import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert, getApp as getAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import getConfig from 'next/config';

// Make sure that the variables are only accessed on the server.
const { serverRuntimeConfig } = getConfig() || {};

const serviceAccount = {
    project_id: serverRuntimeConfig.firebaseProjectId,
    private_key: serverRuntimeConfig.firebasePrivateKey?.replace(/\\n/g, '\n'),
    client_email: serverRuntimeConfig.firebaseClientEmail,
};

// Initialize Firebase Admin SDK
const adminApp = !getAdminApps().length ? initializeAdminApp({
    credential: cert(serviceAccount)
}) : getAdminApp();


const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
