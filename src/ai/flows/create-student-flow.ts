
'use server';

/**
 * @fileOverview A flow for creating student user accounts securely.
 *
 * - createStudent - A server-side function to create a new Firebase user.
 * - CreateStudentInput - The input type for the createStudent function.
 * - CreateStudentOutput - The return type for the createStudent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { setUserRole } from './set-user-role-flow';


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
        displayName: 'Siswa', // Default display name
      });

      // 2. Set custom claim for the user role to 'Siswa'
      await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'Siswa' });

      // 3. Optional: Save basic user info to Firestore if needed later
      await adminDb.collection('users').doc(userRecord.uid).set({
        email: input.email,
        role: 'Siswa',
        createdAt: new Date().toISOString(),
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email || input.email,
        message: 'Student account created successfully.',
      };
    } catch (error: any) {
        // Log the error for debugging on the server
        console.error('Error in createStudentFlow:', error);

        let errorMessage = 'Gagal membuat akun siswa di server.';

        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter.';
        }

        // Throw an error that will be caught by the client-side form
        throw new Error(errorMessage);
    }
  }
);
