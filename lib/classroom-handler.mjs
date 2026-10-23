import { hash,isTeacher,participant } from './access.mjs';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const token=()=>crypto.randomUUID()+crypto.randomUUID();
const str=(s,n)=>typeof s==='string'?s.trim().slice(0,n):'';
const validCode=c=>/^[A-Z2-9]{6}$/.test(c);
const uuid=s=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const projection='id,group_name,title,guess,reason,model,reflection,status,created';
export async function classroom(request,env){try{
 if(!env.DB||!env.BUCKET)return json({error:'수업 저장소가 준비되지 않았습니다.'},503);
 const url=new URL(request.url),code=(url.searchParams.get('code')||'').toUpperCase(),teacher=await isTeacher(request,env);
 if(request.method==='GET'){
  if(url.searchParams.get('action')==='rooms'){
   if(!teacher)return json({error:'교사 로그인이 필요합니다.'},403);
   const {results}=await env.DB.prepare('SELECT c.code,c.title,c.phase,c.created,COUNT(d.id) AS photos FROM classrooms c LEFT JOIN discoveries d ON c.code=d.code AND d.status<>"삭제됨" GROUP BY c.code ORDER BY c.created DESC LIMIT 50').all();return json({rooms:results});
  }
  if(!validCode(code))return json({error:'6자리 수업 코드를 확인해 주세요.'},400);
  const room=await env.DB.prepare('SELECT code,title,phase,created FROM classrooms WHERE code=?').bind(code).first();if(!room)return json({error:'해당 수업을 찾을 수 없습니다.'},404);
  if(url.searchParams.get('action')==='room')return json({room});
  const student=teacher?null:await participant(request,env,code);
  if(!teacher&&!student)return json({error:'수업에 먼저 참여해 주세요.'},403);
  if(url.searchParams.get('photo')){
   const id=url.searchParams.get('photo');const row=await env.DB.prepare('SELECT photo_key,participant_id,status FROM discoveries WHERE code=? AND id=?').bind(code,id).first();
   if(!row||row.status==='삭제됨'||(!teacher&&row.participant_id!==student.id))return json({error:'사진을 볼 권한이 없습니다.'},403);
   const object=await env.BUCKET.get(row.photo_key);if(!object)return json({error:'사진을 찾을 수 없습니다.'},404);
   return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'image/jpeg','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  const statement=teacher?env.DB.prepare(`SELECT ${projection} FROM discoveries WHERE code=? AND status<>'삭제됨' ORDER BY created DESC LIMIT 100`).bind(code):env.DB.prepare(`SELECT ${projection} FROM discoveries WHERE code=? AND participant_id=? AND status<>'삭제됨' ORDER BY created DESC LIMIT 100`).bind(code,student.id);
  const {results}=await statement.all();return json({room,items:results});
 }
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'지원하지 않는 요청입니다.'},415);
 if(Number(request.headers.get('content-length')||0)>2500000)return json({error:'사진 용량이 큽니다. 작은 사진으로 다시 시도해 주세요.'},413);
 const body=await request.json();
 if(request.method==='POST'&&body.action==='create'){
  if(!teacher)return json({error:'수업 생성은 등록된 교사만 할 수 있습니다.'},403);
  const title=str(body.title,60)||'우리 학교 입체 탐험';let code='';const abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';for(const b of crypto.getRandomValues(new Uint8Array(6)))code+=abc[b%abc.length];
  await env.DB.prepare('INSERT INTO classrooms(code,title,teacher_hash,phase,created) VALUES (?,?,?,0,?)').bind(code,title,await hash(token()),new Date().toISOString()).run();return json({code,title,phase:0},201);
 }
 const c=str(body.code,6).toUpperCase();if(!validCode(c))return json({error:'수업 코드를 확인해 주세요.'},400);
 const room=await env.DB.prepare('SELECT code,title,phase FROM classrooms WHERE code=?').bind(c).first();if(!room)return json({error:'해당 수업을 찾을 수 없습니다.'},404);
 if(request.method==='PATCH'&&body.action==='phase'){
  if(!teacher)return json({error:'수업 진행은 등록된 교사만 변경할 수 있습니다.'},403);
  const phase=Number(body.phase);if(!Number.isInteger(phase)||phase<0||phase>4)return json({error:'단계를 확인해 주세요.'},400);
  await env.DB.prepare('UPDATE classrooms SET phase=? WHERE code=?').bind(phase,c).run();return json({ok:true});
 }
 if(request.method==='POST'&&body.action==='join'){
  if(room.phase===4)return json({error:'이 수업은 마감되었습니다. 선생님께 새 수업 코드를 확인해 주세요.'},409);
  const group=str(body.group,24);if(!group)return json({error:'모둠 이름을 입력해 주세요.'},400);
  const id=crypto.randomUUID(),studentToken=token();
  await env.DB.prepare('INSERT INTO participants(id,code,group_name,token_hash,created) VALUES(?,?,?,?,?)').bind(id,c,group,await hash(studentToken),new Date().toISOString()).run();
  return json({room,participantId:id,studentToken,group},201);
 }
 const student=await participant(request,env,c);if(!student)return json({error:'수업 참여 정보를 확인해 주세요. 수업 코드로 다시 참여할 수 있습니다.'},403);
 if(request.method==='DELETE'&&body.action==='delete'){
  if(!uuid(body.id)||typeof body.editToken!=='string'||body.editToken.length<32||body.editToken.length>200)return json({error:'삭제할 사진 정보를 확인해 주세요.'},400);
  const editHash=await hash(body.editToken),photoKey=c+'/'+student.id+'/'+body.id;
  // A durable tombstone also rejects an upload whose response was lost before deletion.
  await env.DB.prepare("INSERT OR IGNORE INTO discoveries (id,code,participant_id,group_name,title,guess,reason,model,reflection,status,edit_hash,photo_key,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(body.id,c,student.id,student.group_name,'','','','{}','','삭제됨',editHash,photoKey,new Date().toISOString()).run();
  const row=await env.DB.prepare('SELECT code,participant_id,edit_hash,photo_key FROM discoveries WHERE id=?').bind(body.id).first();
  if(!row||row.code!==c||row.participant_id!==student.id||row.edit_hash!==editHash)return json({error:'본인이 올린 사진만 삭제할 수 있어요.'},403);
  await env.DB.prepare("UPDATE discoveries SET status='삭제됨',title='',guess='',reason='',model='{}',reflection='' WHERE id=? AND code=?").bind(body.id,c).run();
  await env.BUCKET.delete(row.photo_key);return json({ok:true,deleted:true});
 }
 if(request.method==='POST'&&body.action==='submit'){
  if(!uuid(body.id)||typeof body.editToken!=='string'||body.editToken.length<32||body.editToken.length>200)return json({error:'사진의 저장 정보를 확인해 주세요.'},400);
  // Retry an acknowledged upload before checking closure: an interrupted response must not duplicate it.
  const previous=await env.DB.prepare('SELECT id,code,participant_id,edit_hash,status FROM discoveries WHERE id=?').bind(body.id).first();
  if(previous){if(previous.code!==c||previous.participant_id!==student.id||previous.edit_hash!==await hash(body.editToken))return json({error:'이 사진을 수정할 권한이 없습니다.'},403);if(previous.status==='삭제됨')return json({error:'삭제한 사진입니다.'},410);return json({id:previous.id,alreadySaved:true},200);}
  if(room.phase===4)return json({error:'수업이 마감되었습니다. 사진은 이 기기에 보관되어 있습니다.'},409);
  const total=await env.DB.prepare('SELECT COUNT(*) AS n FROM discoveries WHERE code=? AND status<>"삭제됨"').bind(c).first();if(total.n>=100)return json({error:'수업당 최대 100개의 사진을 제출할 수 있습니다.'},409);
  // Keep blanks blank: the teacher board shows them as '아직 생각 전', not as a student's choice.
  const title=str(body.title,60),reason=str(body.reason,500),guess=str(body.guess,40);
  const match=typeof body.photo==='string'&&body.photo.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);if(!match||match[2].length>2000000)return json({error:'사진을 다시 선택해 주세요. 최대 1.5MB까지 가능합니다.'},400);
  const raw=Uint8Array.from(atob(match[2]),x=>x.charCodeAt(0));const isJpeg=raw[0]===255&&raw[1]===216,isPng=raw[0]===137&&raw[1]===80&&raw[2]===78,isWebp=new TextDecoder().decode(raw.slice(0,4))==='RIFF'&&new TextDecoder().decode(raw.slice(8,12))==='WEBP';if(!(isJpeg&&match[1]==='image/jpeg'||isPng&&match[1]==='image/png'||isWebp&&match[1]==='image/webp'))return json({error:'올바른 이미지 파일을 선택해 주세요.'},400);
  const id=body.id,photoKey=c+'/'+student.id+'/'+id;await env.BUCKET.put(photoKey,raw,{httpMetadata:{contentType:match[1]}});
  const inserted=await env.DB.prepare('INSERT OR IGNORE INTO discoveries (id,code,participant_id,group_name,title,guess,reason,model,reflection,status,edit_hash,photo_key,created) VALUES(?,?,?,?,?,?,?,?,?, ?,?,?,?)').bind(id,c,student.id,student.group_name,title,guess,reason,str(body.model,2000)||'{}',str(body.reflection,1600),body.completed&&str(body.reflection,1600)?'탐구 완료':'탐구 중',await hash(body.editToken),photoKey,new Date().toISOString()).run();
  const after=await env.DB.prepare('SELECT status FROM discoveries WHERE id=?').bind(id).first();if(after?.status==='삭제됨'){await env.BUCKET.delete(photoKey);return json({error:'삭제한 사진입니다.'},410);}
  return json({id,...(inserted.meta.changes===0?{alreadySaved:true}:{})},inserted.meta.changes===0?200:201);
 }
 if(request.method==='PATCH'&&['update','reflect'].includes(body.action)){
  if(room.phase===4)return json({error:'수업이 마감되었습니다. 작성한 내용은 이 기기에 보관되어 있습니다.'},409);
  const row=await env.DB.prepare('SELECT participant_id,edit_hash,status FROM discoveries WHERE code=? AND id=?').bind(c,str(body.id,50)).first();
  if(!row||row.status==='삭제됨'||row.participant_id!==student.id||await hash(str(body.editToken,200))!==row.edit_hash)return json({error:'이 사진을 제출한 기기에서 수정해 주세요.'},403);
  const reflection=str(body.reflection,1600);if(body.completed&&!reflection)return json({error:'탐구 결과를 작성해 주세요.'},400);
  await env.DB.prepare('UPDATE discoveries SET title=?,guess=?,reason=?,model=?,reflection=?,status=? WHERE id=? AND code=? AND status<>"삭제됨"').bind(str(body.title,60),str(body.guess,40),str(body.reason,500),str(body.model,2000)||'{}',reflection,body.completed?'탐구 완료':'탐구 중',body.id,c).run();return json({ok:true});
 }
 return json({error:'지원하지 않는 요청입니다.'},400);
}catch(e){console.error('classroom request failed',e instanceof Error?e.message:'unknown');return json({error:'저장하지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.'},500);}}
