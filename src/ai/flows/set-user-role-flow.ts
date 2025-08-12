'use server';
/**
 * @fileOverview A utility flow to set a custom role on a Firebase user.
 *
 * - setUserRole - A server-side function to assign a 'Guru' or 'Siswa' role to a user.
 */

import { ai } from '@/ai/genkit';
import { adminAuth } from '@/lib/firebase/server';
import { z } from 'zod';

// Define the schema and type inside the function or locally if not exported.
const SetUserRoleInputSchema = z.object({
  email: z.string().email().describe('The email address of the user.'),
  role: z.enum(['Guru', 'Siswa']).describe("The role to assign to the user."),
});

// Export the type separately if needed elsewhere, but it seems it's only used here.
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
            email: input.email, // Ensure email is also set/updated
            role: input.role
        }, { merge: true });
        console.log(`Successfully updated Firestore role for ${input.email}`);
        
        return { success: true, message: `Role ${input.role} assigned to ${input.email}` };
    } catch (error: any) {
        console.error(`Failed to set role for ${input.email}:`, error);
        // Throw the error so the client can handle it
        throw new Error(`Failed to set role for ${input.email}: ${error.message}`);
    }
}

ai.defineFlow(
  {
    name: 'setUserRoleFlow',
    inputSchema: SetUserRoleInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  setUserRole // Directly use the async function
);
