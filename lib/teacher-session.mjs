export const TEACHER_COOKIE='solid_teacher_session';
export const SESSION_SECONDS=8*60*60;
const bytes=s=>new TextEncoder().encode(s);
const encode=b=>btoa(String.fromCharCode(...b)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const decode=s=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
async function signingKey(secret){return crypto.subtle.importKey('raw',bytes(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function makeTeacherSession(secret,now=Date.now()){if(!secret||secret.length<32)throw Error('teacher session not configured');const payload=encode(bytes(JSON.stringify({role:'teacher',exp:Math.floor(now/1000)+SESSION_SECONDS,nonce:crypto.randomUUID()})));const signature=await crypto.subtle.sign('HMAC',await signingKey(secret),bytes(payload));return payload+'.'+encode(new Uint8Array(signature));}
export async function validTeacherSession(value,secret,now=Date.now()){try{if(!secret||secret.length<32||typeof value!=='string'||value.length>1000)return false;const [payload,signature,extra]=value.split('.');if(!payload||!signature||extra)return false;if(!await crypto.subtle.verify('HMAC',await signingKey(secret),decode(signature),bytes(payload)))return false;const data=JSON.parse(new TextDecoder().decode(decode(payload)));return data.role==='teacher'&&Number.isInteger(data.exp)&&data.exp>Math.floor(now/1000);}catch{return false;}}
export function readTeacherCookie(request){const cookie=request.headers.get('cookie')||'';return cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(TEACHER_COOKIE+'='))?.slice(TEACHER_COOKIE.length+1)||'';}
