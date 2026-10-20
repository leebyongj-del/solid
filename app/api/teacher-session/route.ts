import {env} from 'cloudflare:workers';
import {teacherLogin} from '../../../lib/teacher-login-handler.mjs';
export const dynamic='force-dynamic';
const handle=(request:Request)=>teacherLogin(request,env);
export {handle as POST,handle as DELETE};
