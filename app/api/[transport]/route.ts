import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { verifyApiKey, type ApiKeyAuth } from '@/lib/apiKeys';
import { getPlan } from '@/lib/plans';

/**
 * Formdock MCP server (Streamable HTTP, stateless).
 * Endpoint: POST /api/mcp — Authorization: Bearer kef_... (API key from the
 * dashboard, paid plans). An AI agent connected to this server can create
 * forms, read leads, and fetch the exact integration snippet.
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

const SERVICE_ORIGIN = 'https://forms-central-h1ee.vercel.app';

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}

function buildHandler(auth: ApiKeyAuth) {
  return createMcpHandler(
    (server) => {
      server.tool(
        'list_forms',
        'List all forms in this Formdock account with their IDs and status.',
        {},
        async () => {
          const { data, error } = await supabase
            .from('forms')
            .select('id, name, is_active, created_at')
            .eq('client_id', auth.clientId)
            .order('created_at', { ascending: false });
          if (error) return text(`Error: ${error.message}`);
          if (!data?.length) return text('No forms yet. Use create_form to make one.');
          return text(JSON.stringify(data, null, 2));
        }
      );

      server.tool(
        'create_form',
        'Create a new form and return its FORM_ID. Respects the account plan limit.',
        { name: z.string().min(2).max(60).describe('Form name, e.g. "Portfolio contact form"') },
        async ({ name }) => {
          const plan = getPlan(auth.plan.id);
          const { count } = await supabase
            .from('forms')
            .select('id', { count: 'exact', head: true })
            .eq('client_id', auth.clientId);
          if (plan.formLimit !== null && (count ?? 0) >= plan.formLimit) {
            return text(
              `Plan limit reached: the ${plan.name} plan includes ${plan.formLimit} forms. Upgrade at ${SERVICE_ORIGIN}/pricing`
            );
          }
          const { data, error } = await supabase
            .from('forms')
            .insert({
              name: name.trim(),
              client_id: auth.clientId,
              is_active: true,
              notify_email: true,
              auto_reply_enabled: true,
              auto_reply_subject: 'Thanks — we received your message',
              auto_reply_message: '',
            })
            .select('id, name')
            .single();
          if (error || !data) return text(`Error creating form: ${error?.message ?? 'unknown'}`);
          return text(
            `Form created.\nFORM_ID: ${data.id}\nFORM_API_URL: ${SERVICE_ORIGIN}\n\nNext: integrate it — read ${SERVICE_ORIGIN}/llm-install.md and follow it exactly.`
          );
        }
      );

      server.tool(
        'get_submissions',
        'Fetch recent submissions (leads) for one of your forms.',
        {
          form_id: z.string().uuid().describe('The form UUID'),
          limit: z.number().int().min(1).max(50).optional().describe('Max rows (default 10)'),
        },
        async ({ form_id, limit }) => {
          const { data: form } = await supabase
            .from('forms')
            .select('id, name, client_id')
            .eq('id', form_id)
            .eq('client_id', auth.clientId) // tenant isolation
            .maybeSingle();
          if (!form) return text('Form not found in this account.');
          const { data, error } = await supabase
            .from('submissions')
            .select('id, payload, created_at')
            .eq('form_id', form_id)
            .order('created_at', { ascending: false })
            .limit(limit ?? 10);
          if (error) return text(`Error: ${error.message}`);
          return text(`${form.name} — ${data?.length ?? 0} recent submissions:\n${JSON.stringify(data, null, 2)}`);
        }
      );

      server.tool(
        'get_integration_snippet',
        'Get the exact env values and integration instructions for a form.',
        { form_id: z.string().uuid().describe('The form UUID') },
        async ({ form_id }) => {
          const { data: form } = await supabase
            .from('forms')
            .select('id, name')
            .eq('id', form_id)
            .eq('client_id', auth.clientId)
            .maybeSingle();
          if (!form) return text('Form not found in this account.');
          return text(
            [
              `Integration values for "${form.name}":`,
              `FORM_API_URL=${SERVICE_ORIGIN}`,
              `FORM_ID=${form.id}`,
              ``,
              `Full instructions (follow exactly): ${SERVICE_ORIGIN}/llm-install.md`,
              `Key rules: POST JSON to {FORM_API_URL}/api/submit/{FORM_ID} with the`,
              `fields plus _lang, an empty _gotcha, and solved pow_challenge/`,
              `pow_timestamp/pow_nonce from GET {FORM_API_URL}/api/challenge.`,
              `No SMTP or email library — the service handles delivery.`,
            ].join('\n')
          );
        }
      );
    },
    {
      serverInfo: { name: 'formdock', version: '1.0.0' },
    },
    {
      basePath: '/api',
      maxDuration: 60,
      disableSse: true, // stateless streamable HTTP only — serverless-safe without Redis
    }
  );
}

async function withAuth(req: Request): Promise<Response> {
  const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const auth = await verifyApiKey(bearer);
  if (!auth) {
    return Response.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message: `Unauthorized: pass a Formdock API key as "Authorization: Bearer kef_...". Create one in your dashboard (${SERVICE_ORIGIN}/client/dashboard/developer).`,
        },
        id: null,
      },
      { status: 401 }
    );
  }
  if (!auth.plan.apiAccess) {
    return Response.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32002,
          message: `The ${auth.plan.name} plan does not include API/MCP access. Upgrade at ${SERVICE_ORIGIN}/pricing`,
        },
        id: null,
      },
      { status: 403 }
    );
  }
  return buildHandler(auth)(req);
}

export async function POST(req: Request) {
  return withAuth(req);
}

export async function GET() {
  // SSE transport is disabled (stateless mode) — POST JSON-RPC to /api/mcp.
  return Response.json(
    { error: 'Use POST with JSON-RPC (Streamable HTTP). SSE is disabled.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return new Response(null, { status: 405 });
}
