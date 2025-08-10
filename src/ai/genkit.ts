import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { firebase } from "@genkit-ai/firebase";
import { next } from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    firebase(),
    googleAI({
        // Specify your API key and other desired options.
        //.env.local
        apiKey: process.env.GEMINI_API_KEY,
    }),
    next({
        // Specify Next.js-specific options, if any.
    }),
],
  model: 'googleai/gemini-2.0-flash',
  // Allow AI functions to run locally for development.
  // In production, you should remove this or configure it appropriately.
  allowDevInvoke: true,
  // Optional: Configure logging and telemetry.
  logLevel: "debug",
  // Optional: Configure where flow state is stored.
  flowStateStore: "firebase",
  // Optional: Configure where traces are stored.
  traceStore: "firebase",
});
