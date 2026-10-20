import { env } from 'cloudflare:workers';
import { classroom } from '../../../lib/classroom-handler.mjs';
export const dynamic='force-dynamic';
const handle=(request:Request)=>classroom(request,env);
export {handle as GET,handle as POST,handle as PATCH};
