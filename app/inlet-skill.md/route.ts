import { INLET_SKILL_MD } from '@/lib/agentDocs';
import { serveAgentDoc } from '@/lib/agentDocResponse';

export function GET(req: Request) {
  return serveAgentDoc(INLET_SKILL_MD, 'inlet-skill.md', req);
}
