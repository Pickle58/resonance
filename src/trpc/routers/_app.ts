import { createTRPCRouter } from '../init';
import { generationsRouter } from './generations';
import { voiceRouter } from './voices';
 
export const appRouter = createTRPCRouter({
  voices: voiceRouter,
  generations: generationsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;