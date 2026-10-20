import {hash} from './access.mjs';
import {makeTeacherSession,TEACHER_COOKIE,SESSION_SECONDS} from './teacher-session.mjs';
const response=(data,status=200,cookie='')=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
const cookie=value=>`${TEACHER_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
export async function teacherLogin(request,env,now=Date.now()){
 if(request.method==='DELETE')return response({ok:true},200,`${TEACHER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
 if(!env.TEACHER_PIN_HASH||!env.TEACHER_SESSION_SECRET||!env.DB)return response({error:'교사 접속 설정을 준비하고 있습니다.'},503);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'이 사이트에서 다시 접속해 주세요.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return response({error:'비밀번호를 다시 입력해 주세요.'},415);
 try{
  const bucket=Math.floor(now/600000),ip=request.headers.get('cf-connecting-ip')||'shared',key=await hash(ip+'|'+bucket);
  const attempts=await env.DB.prepare('SELECT failures FROM teacher_login_attempts WHERE key=?').bind(key).first();
  if(attempts?.failures>=8)return response({error:'입력 횟수가 많습니다. 잠시 후 다시 시도해 주세요.'},429);
  const body=await request.json(),pin=typeof body.pin==='string'?body.pin:'';
  const actual=await hash(pin);const expected=env.TEACHER_PIN_HASH;let different=actual.length^expected.length;for(let i=0;i<Math.max(actual.length,expected.length);i++)different|=(actual.charCodeAt(i)||0)^(expected.charCodeAt(i)||0);
  if(!/^\d{6}$/.test(pin)||different!==0){await env.DB.prepare('INSERT INTO teacher_login_attempts(key,failures,started) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET failures=failures+1').bind(key,now).run();return response({error:'비밀번호가 맞지 않습니다. 다시 확인해 주세요.'},401);}
  await env.DB.prepare('DELETE FROM teacher_login_attempts WHERE key=?').bind(key).run();
  return response({ok:true},200,cookie(await makeTeacherSession(env.TEACHER_SESSION_SECRET,now)));
 }catch{return response({error:'교사 접속을 완료하지 못했습니다. 연결을 확인하고 다시 시도해 주세요.'},500);}
}
