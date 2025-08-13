
'use server';
/**
 * @fileOverview A flow for generating AI-powered feedback on student answers.
 *
 * - generateFeedback - A server-side function to get feedback for a given question and answer.
 * - GenerateFeedbackInput - The input type for the generateFeedback function.
 * - GenerateFeedbackOutput - The return type for the generateFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateFeedbackInputSchema = z.object({
  question: z.string().describe('The question that was asked to the student.'),
  answer: z.string().describe('The student\'s answer to the question.'),
});
export type GenerateFeedbackInput = z.infer<typeof GenerateFeedbackInputSchema>;

const GenerateFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Constructive and encouraging feedback for the student.'),
});
export type GenerateFeedbackOutput = z.infer<typeof GenerateFeedbackOutputSchema>;

export async function generateFeedback(input: GenerateFeedbackInput): Promise<GenerateFeedbackOutput> {
   return generateFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeedbackPrompt',
  input: { schema: GenerateFeedbackInputSchema },
  output: { schema: GenerateFeedbackOutputSchema },
  prompt: `Anda adalah seorang asisten guru Bahasa Indonesia yang ramah dan suportif.
Tugas Anda adalah memberikan umpan balik yang membangun dan memotivasi untuk jawaban siswa.

PERHATIKAN:
- Gunakan bahasa yang positif dan apresiatif.
- Jika jawaban siswa kurang tepat, berikan petunjuk atau arahan yang lembut untuk membantunya berpikir ke arah yang benar. JANGAN memberikan jawaban langsung.
- Jaga agar umpan balik tetap singkat dan mudah dimengerti (2-3 kalimat).
- Selalu panggil siswa dengan sebutan "Anda".

Pertanyaan:
"{{question}}"

Jawaban Siswa:
"{{answer}}"

Berikan umpan balik Anda:`,
});


const generateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateFeedbackFlow',
    inputSchema: GenerateFeedbackInputSchema,
    outputSchema: GenerateFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Gagal menghasilkan umpan balik.');
    }
    return output;
  }
);
