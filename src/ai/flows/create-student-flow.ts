
'use server';

/**
 * @fileOverview A flow for creating student user accounts securely.
 *
 * - createStudent - A server-side function to create a new Firebase user and assign them the 'Siswa' role.
 * - CreateStudentInput - The input type for the createStudent function.
 * - CreateStudentOutput - The return type for the createStudent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/server';

const CreateStudentInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(10),
});
export type CreateStudentInput = z.infer<typeof CreateStudentInputSchema>;

const CreateStudentOutputSchema = z.object({
  uid: z.string(),
  email: z.string(),
  message: z.string(),
});
export type CreateStudentOutput = z.infer<typeof CreateStudentOutputSchema>;

export async function createStudent(input: CreateStudentInput): Promise<CreateStudentOutput> {
   return createStudentFlow(input);
}

const createStudentFlow = ai.defineFlow(
  {
    name: 'createStudentFlow',
    inputSchema: CreateStudentInputSchema,
    outputSchema: CreateStudentOutputSchema,
  },
  async (input) => {
    try {
      // 1. Create the user in Firebase Authentication
      const userRecord = await adminAuth.createUser({
        email: input.email,
        password: input.password,
        phoneNumber: `+62${input.phone.substring(1)}`, // Assuming Indonesian country code
        emailVerified: true, 
        disabled: false,
      });

      // 2. Set the custom claim 'Siswa' for role-based access control
      await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'Siswa' });

      // 3. Create a corresponding user document in Firestore
      const userDocRef = adminDb.collection('users').doc(userRecord.uid);
      await userDocRef.set({
        email: input.email,
        phone: input.phone,
        role: 'Siswa',
        createdAt: new Date().toISOString(),
      });
      
      console.log(`Successfully created student ${input.email} and set role.`);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        message: `Akun siswa untuk ${userRecord.email} berhasil dibuat.`,
      };

    } catch (error: any) {
        console.error('Error in createStudentFlow:', error);

        if (error.code === 'auth/email-already-exists') {
            throw new Error('Alamat email ini sudah terdaftar. Silakan gunakan email lain.');
        }
         if (error.code === 'auth/phone-number-already-exists') {
            throw new Error('Nomor telepon ini sudah terdaftar. Silakan gunakan nomor lain.');
        }

        throw new Error(`Gagal membuat akun siswa: ${error.message}`);
    }
  }
);
