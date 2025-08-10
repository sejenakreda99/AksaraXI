'use server';

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';

const CreateGroupSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z
    .string()
    .min(8, { message: 'Kata sandi minimal 8 karakter.' }),
  className: z.string().min(1, { message: 'Kelas harus dipilih.' }),
  groupName: z.string().min(1, { message: 'Nama kelompok harus dipilih.' }),
});

let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

const auth = getAuth(adminApp);

export async function createGroup(prevState: any, formData: FormData) {
  const validatedFields = CreateGroupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    // Extracting all errors into a single string for better display.
    const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).map(e => e.join(', ')).join('; ');
    return {
      type: 'error',
      message: errorMessages || "Terjadi kesalahan pada validasi. Silakan periksa kembali isian Anda.",
    };
  }

  const { email, password, className, groupName } = validatedFields.data;
  // This displayName is used by the login form to redirect to the correct dashboard.
  const displayName = "Siswa";

  try {
    await auth.createUser({
      email,
      password,
      displayName: displayName, 
    });
    // Here you could also save the group info (className, groupName) to Firestore
    // under the user's UID if you need to retrieve it later. For example, to a 'groups' collection.

    return {
      type: 'success',
      message: `Kelompok ${groupName} di kelas ${className} dengan email ${email} berhasil dibuat.`,
    };
  } catch (error: any) {
    let message = 'Terjadi kesalahan yang tidak diketahui.';
    if (error.code === 'auth/email-already-exists') {
      message = 'Email ini sudah terdaftar. Silakan gunakan email lain.';
    }
    console.error('Error creating user:', error);
    return {
      type: 'error',
      message,
    };
  }
}