
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
    // ======================================================================
    // TEMPORARY SOLUTION: Set Teacher Role
    // This will run when you click "Tambah Siswa"
    // ======================================================================
    try {
        const teacherEmail = 'guruindonesia@gmail.com';
        const user = await adminAuth.getUserByEmail(teacherEmail);
        await adminAuth.setCustomUserClaims(user.uid, { role: 'Guru' });
        
        console.log(`Successfully set role 'Guru' for user ${teacherEmail}.`);

        // Return a dummy response as the form expects one.
        return {
            uid: user.uid,
            email: user.email!,
            message: `Successfully set role 'Guru' for user ${teacherEmail}. You can now log out and log back in.`
        };

    } catch (error: any) {
        console.error('Error in temporary teacher role setup:', error);
        throw new Error(`Could not set teacher role: ${error.message}`);
    }
  }
);
