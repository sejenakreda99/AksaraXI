import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert, getApp as getAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK
const adminApp = !getAdminApps().length ? initializeAdminApp({
    credential: cert(serviceAccount)
}) : getAdminApp();


const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
