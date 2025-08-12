
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
        emailVerified: true, // Mark email as verified
        disabled: false,
      });

      // 2. Set the custom claim 'Siswa' for role-based access control
      await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'Siswa' });

      // 3. Create a corresponding user document in Firestore
      const userDocRef = adminDb.collection('users').doc(userRecord.uid);
      await userDocRef.set({
        email: input.email,
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

        // Provide a more user-friendly error message
        if (error.code === 'auth/email-already-exists') {
            throw new Error('Alamat email ini sudah terdaftar. Silakan gunakan email lain.');
        }

        throw new Error(`Gagal membuat akun siswa: ${error.message}`);
    }
  }
);
