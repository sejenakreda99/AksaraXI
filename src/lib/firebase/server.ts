
import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert, getApp as getAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Directly use process.env, which is secure on the server-side.
// This avoids issues with Next.js build process and serverRuntimeConfig.
const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

// Check if all required service account properties are available
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Firebase Admin SDK service account credentials are not fully set in environment variables.');
}

// Initialize Firebase Admin SDK
const adminApp = !getAdminApps().length ? initializeAdminApp({
    // Type assertion to satisfy the cert function's expectation
    credential: cert(serviceAccount as any)
}) : getAdminApp();

const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
