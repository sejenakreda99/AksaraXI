
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
 * ALUR UTILITAS UNTUK MENJADIKAN AKUN ANDA SEORANG GURU
 * ===================================================================================
 * Ini adalah flow penyiapan satu kali untuk akun admin/guru Anda.
 * Anda HARUS menjalankan flow ini agar akun Anda mendapatkan izin 'Guru'.
 *
 * CARA MENJALANKAN:
 * 1. Pastikan email di bawah (`guruindonesia@gmail.com`) SESUAI dengan email yang Anda
 *    gunakan untuk login sebagai guru. Jika berbeda, gantilah. Jika sudah sama,
 *    Anda TIDAK PERLU mengubahnya.
 * 2. Mulai Genkit developer UI (jalankan `npm run genkit:watch` di terminal Anda).
 * 3. Buka browser Anda ke http://localhost:4000.
 * 4. Temukan 'makeTeacherAdmin' di daftar flow dan klik tombol 'Run'.
 *
 * Setelah menjalankan ini, akun Anda akan memiliki peran 'Guru' dan dapat login.
 * ===================================================================================
 */
ai.defineFlow(
    { name: 'makeTeacherAdmin' },
    async () => {
        try {
            const result = await setUserRole({
                // PASTIKAN EMAIL INI ADALAH EMAIL GURU ANDA
                email: 'guruindonesia@gmail.com', 
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
