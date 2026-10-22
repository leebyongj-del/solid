import {env} from 'cloudflare:workers';
import {challenge} from '../../../lib/challenge-handler.mjs';
export const dynamic='force-dynamic';
export async function POST(request:Request){return challenge(request,env);}
