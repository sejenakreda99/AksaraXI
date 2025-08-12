
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
 * ===================================================================================
 * UTILITY FLOW TO MAKE YOUR ACCOUNT A TEACHER
 * ===================================================================================
 * This is a one-time setup flow for your admin/teacher account.
 * You MUST run this flow to give your account 'Guru' permissions.
 *
 * HOW TO RUN:
 * 1. Replace 'admin@demo.com' below with your actual teacher email address.
 * 2. Start the Genkit developer UI (run `npm run genkit:watch` in your terminal).
 * 3. Open your browser to http://localhost:4000.
 * 4. Find 'makeTeacherAdmin' in the list of flows and click the 'Run' button.
 *
 * After running this, your account will have the 'Guru' role and will be able
 * to view the student list.
 * ===================================================================================
 */
ai.defineFlow(
    { name: 'makeTeacherAdmin' },
    async () => {
        try {
            const result = await setUserRole({
                email: 'guruindonesia@gmail.com', // <<! REPLACE THIS WITH YOUR TEACHER/ADMIN EMAIL
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
