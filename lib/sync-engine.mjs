export function createSyncEngine(store,transport=fetch){let running=null;
 async function synchronize(session){if(!session?.studentToken)return {saved:0,waiting:0};let saved=0;
  const drafts=(await store.list()).filter(d=>d.code===session.code&&d.participantId===session.participantId&&d.revision>d.syncedRevision&&!d.blocked).sort((a,b)=>a.created-b.created);
  for(const d of drafts){try{
   const body={action:d.uploaded?'update':'submit',code:d.code,id:d.id,editToken:d.editToken,title:d.title,guess:d.guess,reason:d.reason,model:JSON.stringify(d.model),reflection:d.reflection,completed:d.completed,...(!d.uploaded?{photo:d.photo}:{})};
   const response=await transport('/api/classrooms',{method:d.uploaded?'PATCH':'POST',headers:{'Content-Type':'application/json',Authorization:'Student '+session.studentToken},body:JSON.stringify(body)});
   const data=await response.json();if(!response.ok){const permanent=[400,403,409,413,415].includes(response.status);await store.update(d.id,c=>({...c,blocked:permanent,lastError:data.error||'연결이 돌아오면 다시 전송할게요.'}));if(!permanent)break;continue;}
   await store.update(d.id,c=>({...c,uploaded:true,syncedRevision:data.alreadySaved?(c.syncedRevision||0):Math.max(c.syncedRevision||0,d.revision),lastError:'',blocked:false}));saved++;
  }catch{await store.update(d.id,c=>({...c,lastError:'연결이 돌아오면 자동으로 다시 전송합니다.',blocked:false}));break;}}
  const current=(await store.list()).filter(d=>d.code===session.code&&d.participantId===session.participantId);return {saved,waiting:current.filter(d=>d.revision>d.syncedRevision).length};
 }
 return {run(session){if(running)return running;running=synchronize(session).finally(()=>{running=null;});return running;}};
}
