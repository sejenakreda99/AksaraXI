'use server';
/**
 * @fileOverview A utility flow to set a custom role on a Firebase user.
 *
 * - setUserRole - A server-side function to assign a 'Guru' or 'Siswa' role to a user.
 * - SetUserRoleInput - The input type for the setUserRole function.
 */

import { ai } from '@/ai/genkit';
import { adminAuth } from '@/lib/firebase/server';
import { z } from 'zod';

export const SetUserRoleInputSchema = z.object({
  email: z.string().email().describe('The email address of the user.'),
  role: z.enum(['Guru', 'Siswa']).describe("The role to assign to the user."),
});
export type SetUserRoleInput = z.infer<typeof SetUserRoleInputSchema>;

export async function setUserRole(input: SetUserRoleInput) {
    console.log(`Attempting to set role '${input.role}' for user '${input.email}'`);
    try {
        const user = await adminAuth.getUserByEmail(input.email);
        await adminAuth.setCustomUserClaims(user.uid, { role: input.role });
        console.log(`Successfully set custom claim for ${input.email} to { role: '${input.role}' }`);

        // Also update the role in Firestore for consistency
        // This helps in querying users by role from the client
        const userDocRef = adminAuth.app.firestore().collection('users').doc(user.uid);
        await userDocRef.set({
            role: input.role
        }, { merge: true });
        console.log(`Successfully updated Firestore role for ${input.email}`);
        
        return { success: true, message: `Role ${input.role} assigned to ${input.email}` };
    } catch (error: any) {
        console.error(`Failed to set role for ${input.email}:`, error);
        // Don't throw an error back to the client, just log it.
        // This is especially important if the user already has the role.
        return { success: false, message: error.message };
    }
}

ai.defineFlow(
  {
    name: 'setUserRoleFlow',
    inputSchema: SetUserRoleInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    return setUserRole(input);
  }
);
