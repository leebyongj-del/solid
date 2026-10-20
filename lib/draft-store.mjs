const NAME='solid-discovery-offline-v2';
let connection;
export function openDraftDb(){if(connection)return connection;connection=new Promise((resolve,reject)=>{if(typeof indexedDB==='undefined'){reject(Error('이 브라우저에서는 기기 임시저장을 사용할 수 없어요. 일반 브라우저 창에서 다시 열어 주세요.'));return;}const r=indexedDB.open(NAME,1);r.onupgradeneeded=()=>{const db=r.result;db.createObjectStore('drafts',{keyPath:'id'});db.createObjectStore('meta');};r.onsuccess=()=>resolve(r.result);r.onerror=()=>{connection=null;reject(Error('기기 저장 공간을 사용할 수 없어요. 사진을 촬영하기 전에 브라우저 저장 설정을 확인해 주세요.'));};});return connection;}
async function transaction(store,mode,fn){const db=await openDraftDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode);let result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(Error('기기에 저장하지 못했어요. 저장 공간을 확인한 뒤 다시 시도해 주세요.'));tx.onabort=()=>reject(Error('임시저장이 중단되었어요. 사진을 다시 저장해 주세요.'));fn(tx.objectStore(store),value=>{result=value;});});}
export const draftStore={
 get:id=>transaction('drafts','readonly',(s,done)=>{const r=s.get(id);r.onsuccess=()=>done(r.result);}),
 list:()=>transaction('drafts','readonly',(s,done)=>{const r=s.getAll();r.onsuccess=()=>done(r.result);}),
 put:value=>transaction('drafts','readwrite',(s,done)=>{s.put(value);done(value);}),
 update:(id,fn)=>transaction('drafts','readwrite',(s,done)=>{const r=s.get(id);r.onsuccess=()=>{if(!r.result){done(null);return;}const value=fn(r.result);s.put(value);done(value);};}),
 getMeta:key=>transaction('meta','readonly',(s,done)=>{const r=s.get(key);r.onsuccess=()=>done(r.result);}),
 setMeta:(key,value)=>transaction('meta','readwrite',(s,done)=>{s.put(value,key);done(value);})
};
