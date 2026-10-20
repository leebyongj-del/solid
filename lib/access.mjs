import { validTeacherSession,readTeacherCookie } from './teacher-session.mjs';
export const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export const isTeacher=async(request,env)=>validTeacherSession(readTeacherCookie(request),env.TEACHER_SESSION_SECRET);
export async function participant(request,env,code){const authorization=request.headers.get('Authorization')||'';if(!authorization.startsWith('Student '))return null;const key=authorization.slice(8);if(key.length<32||key.length>200)return null;return env.DB.prepare('SELECT id,code,group_name FROM participants WHERE code=? AND token_hash=?').bind(code,await hash(key)).first();}
