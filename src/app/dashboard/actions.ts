'use server';

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';

const CreateGroupSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z
    .string()
    .min(8, { message: 'Kata sandi minimal 8 karakter.' }),
  className: z.string().min(1, { message: 'Kelas harus dipilih.' }),
  groupName: z.string().min(1, { message: 'Nama kelompok harus dipilih.' }),
});

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  // Check if service account JSON is provided in environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
     // Fallback for local development if you have GOOGLE_APPLICATION_CREDENTIALS set up
     // or if the code is running in a GCP environment.
    adminApp = initializeApp();
  }
} else {
  adminApp = getApps()[0];
}

const auth = getAuth(adminApp);
const db = getFirestore(adminApp);


export async function createGroup(prevState: any, formData: FormData) {
  const validatedFields = CreateGroupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: "Terjadi kesalahan pada validasi. Silakan periksa kembali isian Anda.",
    };
  }

  const { email, password, className, groupName } = validatedFields.data;
  // This displayName is used by the login form to redirect to the correct dashboard.
  const displayName = "Siswa";

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName,
    });
    
    // Save group info to Firestore
    await db.collection('groups').doc(userRecord.uid).set({
      className,
      groupName,
      email,
    });

    return {
      type: 'success',
      message: `Kelompok ${groupName} di kelas ${className} dengan email ${email} berhasil dibuat.`,
    };
  } catch (error: any) {
    let message = 'Terjadi kesalahan yang tidak diketahui.';
    if (error.code === 'auth/email-already-exists') {
      message = 'Email ini sudah terdaftar. Silakan gunakan email lain.';
    } else if (error.code === 'auth/invalid-password') {
        message = 'Kata sandi tidak valid. Harus minimal 6 karakter.';
    }
    console.error('Error creating user:', error);
    return {
      type: 'error',
      message,
    };
  }
}
