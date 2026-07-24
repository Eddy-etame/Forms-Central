import { LLM_INSTALL_MD } from '@/lib/agentDocs';
import { serveAgentDoc } from '@/lib/agentDocResponse';

export function GET(req: Request) {
  return serveAgentDoc(LLM_INSTALL_MD, 'llm-install.md', req);
}
