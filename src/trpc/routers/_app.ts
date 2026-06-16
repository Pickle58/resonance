import { createTRPCRouter } from '../init';
import { voiceRouter } from './voices';
 
export const appRouter = createTRPCRouter({
  voices: voiceRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;