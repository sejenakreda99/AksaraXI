'use server';

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z
    .string()
    .min(8, { message: 'Kata sandi minimal 8 karakter.' }),
});

let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

const auth = getAuth(adminApp);

export async function createStudent(prevState: any, formData: FormData) {
  const validatedFields = CreateUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await auth.createUser({
      email,
      password,
      displayName: 'Siswa', // Default display name
    });
    return {
      type: 'success',
      message: `Siswa dengan email ${email} berhasil dibuat.`,
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
