import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { firebase } from "@genkit-ai/firebase";
import { next } from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    next(),
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
