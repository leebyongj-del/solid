import { env } from 'cloudflare:workers';
import { vision } from '../../../lib/vision-handler.mjs';
import { studentVision } from '../../../lib/vision-gateway.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return vision(request,env);}
export async function POST(request:Request){return studentVision(request,env);}
