
'use server';

/**
 * @fileOverview A flow for creating student user accounts securely.
 *
 * - createStudent - A server-side function to create a new Firebase user and save their group details.
 * - CreateStudentInput - The input type for the createStudent function.
 * - CreateStudentOutput - The return type for the createStudent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  // IMPORTANT: In a real production environment, you would use service account credentials
  // stored securely (e.g., in environment variables or a secret manager), not hardcoded.
  // The 'GOOGLE_APPLICATION_CREDENTIALS' environment variable is the standard way.
  // For this context, we will assume it's configured in the deployment environment.
  initializeApp();
}

const CreateStudentInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  className: z.string(),
  groupName: z.string(),
  members: z.array(z.string()),
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
      const userRecord = await getAuth().createUser({
        email: input.email,
        password: input.password,
        displayName: 'Siswa', // Set role
      });

      // 2. Save the group information to Firestore
      await getFirestore().collection('groups').doc(userRecord.uid).set({
        email: input.email,
        className: input.className,
        groupName: input.groupName,
        members: input.members,
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email || input.email,
        message: 'Student account created successfully.',
      };
    } catch (error: any) {
        // Log the error for debugging on the server
        console.error('Error in createStudentFlow:', error);
        
        // Throw a new, user-friendly error to be caught by the client
        // This prevents leaking sensitive implementation details.
        if (error.code === 'auth/email-already-exists') {
            throw new Error('Email ini sudah terdaftar. Silakan gunakan email lain.');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('Kata sandi terlalu lemah. Gunakan minimal 8 karakter.');
        }
        throw new Error('Gagal membuat akun siswa di server.');
    }
  }
);
