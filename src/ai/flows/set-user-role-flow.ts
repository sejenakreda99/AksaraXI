'use server';
/**
 * @fileOverview A utility flow to set a custom role on a Firebase user.
 *
 * - setUserRole - A server-side function to assign a 'Guru' or 'Siswa' role to a user.
 */

import { ai } from '@/ai/genkit';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { z } from 'zod';

export async function setUserRole(input: {
  email: string;
  role: 'Guru' | 'Siswa';
}) {
    // Define the schema inside the function to avoid exporting it
    const SetUserRoleInputSchema = z.object({
      email: z.string().email().describe('The email address of the user.'),
      role: z.enum(['Guru', 'Siswa']).describe("The role to assign to the user."),
    });

    // Validate input
    const validatedInput = SetUserRoleInputSchema.parse(input);

    console.log(`Attempting to set role '${validatedInput.role}' for user '${validatedInput.email}'`);
    try {
        const user = await adminAuth.getUserByEmail(validatedInput.email);
        await adminAuth.setCustomUserClaims(user.uid, { role: validatedInput.role });
        console.log(`Successfully set custom claim for ${validatedInput.email} to { role: '${validatedInput.role}' }`);

        // Also update the role in Firestore for consistency
        // This helps in querying users by role from the client
        const userDocRef = adminDb.collection('users').doc(user.uid);
        await userDocRef.set({
            email: validatedInput.email, // Ensure email is also set/updated
            role: validatedInput.role,
            createdAt: new Date().toISOString(),
        }, { merge: true });
        console.log(`Successfully updated Firestore role for ${validatedInput.email}`);
        
        return { success: true, message: `Role ${validatedInput.role} assigned to ${validatedInput.email}` };
    } catch (error: any) {
        console.error(`Failed to set role for ${validatedInput.email}:`, error);
        // Throw the error so the client can handle it
        throw new Error(`Failed to set role for ${validatedInput.email}: ${error.message}`);
    }
}

ai.defineFlow(
  {
    name: 'setUserRoleFlow',
    inputSchema: z.object({
      email: z.string().email().describe('The email address of the user.'),
      role: z.enum(['Guru', 'Siswa']).describe("The role to assign to the user."),
    }),
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    return setUserRole(input);
  }
);
