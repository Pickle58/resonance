import { createTRPCRouter } from '../init';
import { billingRouter } from './billing';
import { generationsRouter } from './generations';
import { voiceRouter } from './voices';
 
export const appRouter = createTRPCRouter({
  voices: voiceRouter,
  generations: generationsRouter,
  billing: billingRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;