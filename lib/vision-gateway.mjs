import { participant } from './access.mjs';
import { vision } from './vision-handler.mjs';
export async function studentVision(request,env,transport=fetch){
 try{const body=await request.json(),code=String(body.code||'').toUpperCase();if(!env.DB)return Response.json({error:'수업 저장소에 연결하지 못했어요.'},{status:503});const student=await participant(request,env,code);if(!student)return Response.json({error:'수업에 먼저 참여해 주세요.'},{status:403});
 const allowed=await env.DB.prepare('UPDATE classrooms SET analysis_count=analysis_count+1 WHERE code=? AND phase<>4 AND analysis_count<200 RETURNING code').bind(code).first();if(!allowed)return Response.json({error:'수업이 마감됐거나 이 수업의 AI 분석 횟수를 모두 사용했어요. 선생님께 문의해 주세요.'},{status:429});
 return vision(new Request(request.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({photo:body.photo})}),env,transport);
 }catch{return Response.json({error:'사진과 수업 참여 정보를 확인해 주세요.'},{status:400});}
}
