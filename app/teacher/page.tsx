import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
import {isTeacher} from '../../lib/access.mjs';
import TeacherDashboard from '../../components/teacher-dashboard';
import TeacherLogin from '../../components/teacher-login';
export const dynamic='force-dynamic';
export default async function TeacherPage(){const h=await headers();const request=new Request('https://site.local/teacher',{headers:h});return await isTeacher(request,env)?<TeacherDashboard/>:<TeacherLogin/>;}
