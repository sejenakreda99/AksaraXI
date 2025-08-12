
'use server';
/**
 * @fileOverview A utility flow to set custom claims (roles) for a Firebase user.
 * 
 * - setUserRole - A server-side function to assign a role to a user.
 * - SetUserRoleInput - The input type for the setUserRole function.
 * - SetUserRoleOutput - The return type for the setUserRole function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminAuth } from '@/lib/firebase/server';

const SetUserRoleInputSchema = z.object({
  email: z.string().email(),
  role: z.enum(['Guru', 'Siswa']),
});
export type SetUserRoleInput = z.infer<typeof SetUserRoleInputSchema>;

const SetUserRoleOutputSchema = z.object({
  message: z.string(),
});
export type SetUserRoleOutput = z.infer<typeof SetUserRoleOutputSchema>;

// This is an exported function that can be called from other server-side code.
export async function setUserRole(input: SetUserRoleInput): Promise<SetUserRoleOutput> {
  return setUserRoleFlow(input);
}

const setUserRoleFlow = ai.defineFlow(
  {
    name: 'setUserRoleFlow',
    inputSchema: SetUserRoleInputSchema,
    outputSchema: SetUserRoleOutputSchema,
    // Note: This flow should ideally be protected to only be run by other admins/flows.
    // For now, it's a utility flow called by createStudentFlow.
  },
  async ({ email, role }) => {
    try {
      // Get the user by email
      const user = await adminAuth.getUserByEmail(email);
      
      // Set the custom claim. This will overwrite any existing claims.
      await adminAuth.setCustomUserClaims(user.uid, { role: role });
      
      return {
        message: `Successfully set role '${role}' for user ${email}.`,
      };
    } catch (error: any) {
      console.error(`Failed to set custom claim for ${email}:`, error);
      throw new Error(`Could not set role for user: ${error.message}`);
    }
  }
);

/**
 * UTILITY FLOW TO MAKE YOUR ACCOUNT A TEACHER
 * To run this, you can temporarily call it from a test page or use the Genkit developer UI.
 * This is a one-time setup for your admin account.
 */
ai.defineFlow(
    { name: 'makeTeacherAdmin' },
    async () => {
        try {
            const result = await setUserRole({
                email: 'admin@demo.com', // <<! RPLACE THIS WITH YOUR TEACHER/ADMIN EMAIL
                role: 'Guru'
            });
            console.log(result.message);
            return result;
        } catch (e: any) {
            console.error(e.message);
            return { error: e.message };
        }
    }
);
