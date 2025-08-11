import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { firebase } from "@genkit-ai/firebase/plugin";
import { next } from '@genkit-ai/next/plugin';

export const ai = genkit({
  plugins: [
    next(),
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
