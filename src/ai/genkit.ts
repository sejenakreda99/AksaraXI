import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase/plugin';
import { nextjs } from '@genkit-ai/next';
 
export const ai = genkit({
  plugins: [
    nextjs(),
    firebase(),
    googleAI(),
  ],
 
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
