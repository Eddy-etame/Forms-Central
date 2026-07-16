'use server';

import { supabase } from './supabase';
import { encryptPassword, decryptPassword, generateRandomPassword } from './crypto';
import { sendClientWelcomeEmail } from './email';

// Helper: Ensure the request is authenticated via cookies (read on the server)
async function verifyAdminAuth() {
  const { cookies } = await import('next/headers');
  const { verifyJWT } = await import('./jwt');
  
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!accessToken || !JWT_SECRET) {
    throw new Error('Unauthorized access');
  }
  
  const payload = await verifyJWT(accessToken, JWT_SECRET);
  if (!payload || payload.sub !== 'admin') {
    throw new Error('Unauthorized session');
  }
}

// ==================== DASHBOARD STATS ====================

export async function getDashboardStats() {
  await verifyAdminAuth();
  
  const [
    { count: formsCount },
    { count: clientsCount },
    { count: submissionsCount },
    { count: blacklistCount },
    { data: submissions },
  ] = await Promise.all([
    supabase.from('forms').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase.from('blacklist').select('*', { count: 'exact', head: true }),
    supabase
      .from('submissions')
      .select('id, form_id, ip_address, created_at, forms(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return {
    formsCount: formsCount || 0,
    clientsCount: clientsCount || 0,
    submissionsCount: submissionsCount || 0,
    blacklistCount: blacklistCount || 0,
    recentSubmissions: submissions || [],
  };
}

// ==================== CLIENTS CRUD ====================

export async function getClients() {
  await verifyAdminAuth();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveClient(
  id: string | null, 
  name: string, 
  email: string, 
  phone: string | null,
  logo_url: string | null = null,
  primary_color: string | null = '#000000',
  font_family: string | null = 'sans-serif'
) {
  try {
    await verifyAdminAuth();
    if (id) {
      const { error } = await supabase
        .from('clients')
        .update({ name, email, phone: phone || null, logo_url, primary_color, font_family })
        .eq('id', id);
      if (error) throw error;
    } else {
      // New Client: Generate password, encrypt, save, and email.
      const rawPassword = generateRandomPassword(12);
      const encryptedPassword = encryptPassword(rawPassword);

      const { error } = await supabase
        .from('clients')
        .insert([{ 
          name, 
          email, 
          phone: phone || null, 
          logo_url, 
          primary_color, 
          font_family,
          encrypted_password: encryptedPassword 
        }]);
      if (error) throw error;

      // Send the client welcome email with their password
      await sendClientWelcomeEmail(email, name, rawPassword, undefined, {
        logo_url, primary_color, font_family
      }).catch(err => console.error("Error sending welcome email:", err));
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error in saveClient:', err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function getClientPassword(id: string) {
  try {
    await verifyAdminAuth();
    const { data, error } = await supabase.from('clients').select('encrypted_password').eq('id', id).single();
    if (error) throw error;
    if (!data || !data.encrypted_password) return { success: true, password: null };
    
    const decrypted = decryptPassword(data.encrypted_password);
    return { success: true, password: decrypted };
  } catch (err: any) {
    console.error('Error in getClientPassword:', err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function triggerPasswordReset(id: string) {
  try {
    await verifyAdminAuth();
    const { data: client, error: fetchError } = await supabase.from('clients').select('*').eq('id', id).single();
    if (fetchError || !client) throw fetchError || new Error('Client not found');

    const rawPassword = generateRandomPassword(12);
    const encryptedPassword = encryptPassword(rawPassword);

    const { error: updateError } = await supabase
      .from('clients')
      .update({ encrypted_password: encryptedPassword })
      .eq('id', id);
    if (updateError) throw updateError;

    await sendClientWelcomeEmail(client.email, client.name, rawPassword, "true", {
      logo_url: client.logo_url, 
      primary_color: client.primary_color, 
      font_family: client.font_family
    }).catch(err => console.error("Error sending password reset email:", err));

    return { success: true };
  } catch (err: any) {
    console.error('Error in triggerPasswordReset:', err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function deleteClient(id: string) {
  try {
    await verifyAdminAuth();
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in deleteClient:', err);
    return { success: false, error: err.message || String(err) };
  }
}

// ==================== FORMS CRUD ====================

export async function getForms() {
  await verifyAdminAuth();
  const { data, error } = await supabase
    .from('forms')
    .select('id, name, is_active, allowed_origins, client_id, clients(name), created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getFormDetails(formId: string) {
  await verifyAdminAuth();
  const [formRes, subsRes] = await Promise.all([
    supabase
      .from('forms')
      .select('id, name, is_active, allowed_origins, auto_reply_enabled, auto_reply_subject, auto_reply_message, success_url, clients(name, email)')
      .eq('id', formId)
      .single(),
    supabase
      .from('submissions')
      .select('id, payload, ip_address, created_at')
      .eq('form_id', formId)
      .order('created_at', { ascending: false }),
  ]);

  if (formRes.error) throw formRes.error;
  return {
    form: formRes.data,
    submissions: subsRes.data || [],
  };
}

export async function createForm(
  name: string,
  clientId: string,
  allowedOrigins: string[],
  autoReplyEnabled = false,
  autoReplySubject = 'Confirmation de réception',
  autoReplyMessage = '',
  successUrl = ''
) {
  try {
    await verifyAdminAuth();
    const { error } = await supabase
      .from('forms')
      .insert([
        {
          name,
          client_id: clientId,
          allowed_origins: allowedOrigins.length > 0 ? allowedOrigins : ['*'],
          is_active: true,
          auto_reply_enabled: autoReplyEnabled,
          auto_reply_subject: autoReplySubject,
          auto_reply_message: autoReplyMessage,
          success_url: successUrl,
        },
      ]);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in createForm:', err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateFormSettings(
  formId: string,
  autoReplyEnabled: boolean,
  autoReplySubject: string,
  autoReplyMessage: string,
  successUrl: string
) {
  try {
    await verifyAdminAuth();
    const { error } = await supabase
      .from('forms')
      .update({
        auto_reply_enabled: autoReplyEnabled,
        auto_reply_subject: autoReplySubject,
        auto_reply_message: autoReplyMessage,
        success_url: successUrl,
      })
      .eq('id', formId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in updateFormAutoReply:', err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateFormOrigins(formId: string, allowedOrigins: string[]) {
  try {
    await verifyAdminAuth();
    const { error } = await supabase
      .from('forms')
      .update({
        allowed_origins: allowedOrigins,
      })
      .eq('id', formId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in updateFormOrigins:', err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function toggleFormStatus(id: string, newStatus: boolean) {
  try {
    await verifyAdminAuth();
    const { error } = await supabase
      .from('forms')
      .update({ is_active: newStatus })
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in toggleFormStatus:', err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function deleteForm(id: string) {
  try {
    await verifyAdminAuth();
    const { error } = await supabase.from('forms').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in deleteForm:', err);
    return { success: false, error: err.message || String(err) };
  }
}

// ==================== SUBMISSIONS CRUD ====================

export async function getSubmissions() {
  await verifyAdminAuth();
  const { data, error } = await supabase
    .from('submissions')
    .select('id, form_id, payload, ip_address, fingerprint, created_at, forms(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ==================== BLACKLIST CRUD ====================

export async function getBlacklist() {
  await verifyAdminAuth();
  const { data, error } = await supabase
    .from('blacklist')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addBlacklist(target: string, type: 'ip' | 'fingerprint' | 'host', reason: string) {
  try {
    await verifyAdminAuth();
    const { error } = await supabase
      .from('blacklist')
      .insert([{ target: target.trim().toLowerCase(), type, reason }]);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in addBlacklist:', err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function removeBlacklist(id: string) {
  try {
    await verifyAdminAuth();
    const { error } = await supabase.from('blacklist').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in removeBlacklist:', err);
    return { success: false, error: err.message || String(err) };
  }
}

// ==================== FAILURES LOGS ====================

export async function getFailuresLogs() {
  try {
    await verifyAdminAuth();
    const { data, error } = await supabase
      .from('failures_log')
      .select('id, form_id, error_type, error_message, payload, created_at, forms(name)')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Error in getFailuresLogs:', err);
    return { success: false, error: err.message || String(err) };
  }
}

// ==================== CLIENT PORTAL STATS ====================

export async function getClientDashboardStats() {
  const { cookies } = await import('next/headers');
  const { verifyJWT } = await import('./jwt');
  
  const cookieStore = await cookies();
  const token = cookieStore.get('client_access_token')?.value;
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!token || !JWT_SECRET) {
    throw new Error('Unauthorized');
  }
  
  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload || payload.sub !== 'client' || !payload.clientId) {
    throw new Error('Unauthorized');
  }

  const clientId = payload.clientId as string;

  // 1. Get all forms owned by this client
  const { data: forms, error: formsError } = await supabase
    .from('forms')
    .select('id, name')
    .eq('client_id', clientId);

  if (formsError) throw formsError;
  const formIds = forms?.map(f => f.id) || [];

  if (formIds.length === 0) {
    return {
      allTime: 0,
      past7Days: 0,
      recentLeads: [],
      formsCount: 0
    };
  }

  // 2. Get submissions for these forms
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: allTime },
    { count: past7Days },
    { data: allLeadsRaw }
  ] = await Promise.all([
    supabase.from('submissions').select('*', { count: 'exact', head: true }).in('form_id', formIds),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).in('form_id', formIds).gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('submissions').select('id, payload, created_at, forms(name)').in('form_id', formIds).order('created_at', { ascending: false }).limit(1000)
  ]);

  // 3. Aggregate Daily Trends (Last 30 Days)
  const dailyTrendsMap = new Map<string, number>();
  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); // e.g. "08 juin"
    dailyTrendsMap.set(dateStr, 0);
  }

  // 4. Aggregate Form Performance
  const formPerformanceMap = new Map<string, number>();
  forms.forEach(f => formPerformanceMap.set(f.name, 0));

  allLeadsRaw?.forEach(lead => {
    // Add to daily trends if within 30 days
    const leadDate = new Date(lead.created_at);
    if (leadDate >= thirtyDaysAgo) {
      const dateStr = leadDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      if (dailyTrendsMap.has(dateStr)) {
        dailyTrendsMap.set(dateStr, dailyTrendsMap.get(dateStr)! + 1);
      }
    }
    
    // Add to form performance
    const formName = lead.forms && typeof lead.forms === 'object' && 'name' in lead.forms 
      ? (lead.forms as any).name 
      : 'Inconnu';
    formPerformanceMap.set(formName, (formPerformanceMap.get(formName) || 0) + 1);
  });

  const dailyTrends = Array.from(dailyTrendsMap.entries()).map(([date, count]) => ({ date, count }));
  const formPerformance = Array.from(formPerformanceMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    allTime: allTime || 0,
    past7Days: past7Days || 0,
    recentLeads: allLeadsRaw || [],
    formsCount: formIds.length,
    dailyTrends,
    formPerformance
  };
}

export async function getClientForms() {
  const { cookies } = await import('next/headers');
  const { verifyJWT } = await import('./jwt');
  
  const cookieStore = await cookies();
  const token = cookieStore.get('client_access_token')?.value;
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!token || !JWT_SECRET) return [];
  
  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload || payload.sub !== 'client' || !payload.clientId) return [];

  const { data: forms } = await supabase
    .from('forms')
    .select('id, name')
    .eq('client_id', payload.clientId as string)
    .order('created_at', { ascending: false });

  return forms || [];
}

export async function getClientSingleFormStats(formId: string) {
  const { cookies } = await import('next/headers');
  const { verifyJWT } = await import('./jwt');
  
  const cookieStore = await cookies();
  const token = cookieStore.get('client_access_token')?.value;
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!token || !JWT_SECRET) throw new Error('Unauthorized');
  
  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload || payload.sub !== 'client' || !payload.clientId) throw new Error('Unauthorized');

  // Verify form belongs to client
  const { data: formCheck } = await supabase
    .from('forms')
    .select('id, name')
    .eq('id', formId)
    .eq('client_id', payload.clientId as string)
    .single();

  if (!formCheck) throw new Error('Form not found or unauthorized');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: allTime },
    { count: past7Days },
    { data: allLeadsRaw }
  ] = await Promise.all([
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('form_id', formId),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('form_id', formId).gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('submissions').select('id, payload, created_at').eq('form_id', formId).order('created_at', { ascending: false }).limit(1000)
  ]);

  const dailyTrendsMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    dailyTrendsMap.set(dateStr, 0);
  }

  allLeadsRaw?.forEach(lead => {
    const leadDate = new Date(lead.created_at);
    if (leadDate >= thirtyDaysAgo) {
      const dateStr = leadDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      if (dailyTrendsMap.has(dateStr)) {
        dailyTrendsMap.set(dateStr, dailyTrendsMap.get(dateStr)! + 1);
      }
    }
  });

  const dailyTrends = Array.from(dailyTrendsMap.entries()).map(([date, count]) => ({ date, count }));

  return {
    formName: formCheck.name,
    allTime: allTime || 0,
    past7Days: past7Days || 0,
    recentLeads: allLeadsRaw || [],
    dailyTrends
  };
}

// ==================== TRAFFIC ANALYTICS (super-admin) ====================

export async function getTrafficStats() {
  await verifyAdminAuth();

  // Graceful when migration_v11 hasn't run yet.
  const probe = await supabase.from('pageviews').select('id', { count: 'exact', head: true });
  const empty = {
    available: false,
    totals: { all: 0, today: 0, week: 0 },
    unique: { today: 0, week: 0 },
    dailyTrends: [] as { date: string; views: number; visitors: number }[],
    topPaths: [] as { name: string; count: number }[],
    topReferrers: [] as { name: string; count: number }[],
    devices: [] as { name: string; count: number }[],
    countries: [] as { name: string; count: number }[],
    recent: [] as any[],
  };
  if (probe.error) return empty;

  const now = Date.now();
  const dayAgo = new Date(now - 24 * 3600 * 1000).toISOString();
  const weekAgo = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
  const monthAgo = new Date(now - 30 * 24 * 3600 * 1000).toISOString();

  const [totalRes, todayRes, weekRes, rowsRes] = await Promise.all([
    supabase.from('pageviews').select('id', { count: 'exact', head: true }),
    supabase.from('pageviews').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo),
    supabase.from('pageviews').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase
      .from('pageviews')
      .select('path, referrer, session_id, device, browser, country, created_at')
      .gte('created_at', monthAgo)
      .order('created_at', { ascending: false })
      .limit(5000),
  ]);

  const rows = (rowsRes.data as any[]) || [];
  const uniqToday = new Set(rows.filter((r) => r.created_at >= dayAgo).map((r) => r.session_id)).size;
  const uniqWeek = new Set(rows.filter((r) => r.created_at >= weekAgo).map((r) => r.session_id)).size;

  // 30-day daily trend
  const days: Record<string, { date: string; views: number; visitors: Set<string> }> = {};
  for (let i = 29; i >= 0; i--) {
    const k = new Date(now - i * 86400000).toISOString().slice(0, 10);
    days[k] = { date: k, views: 0, visitors: new Set() };
  }
  for (const r of rows) {
    const k = String(r.created_at).slice(0, 10);
    if (days[k]) { days[k].views++; days[k].visitors.add(r.session_id); }
  }
  const dailyTrends = Object.values(days).map((d) => ({ date: d.date, views: d.views, visitors: d.visitors.size }));

  const tally = (key: string) => {
    const m: Record<string, number> = {};
    for (const r of rows) {
      const kk = (r as any)[key] || (key === 'referrer' ? 'Direct' : key === 'country' ? '—' : 'Unknown');
      m[kk] = (m[kk] || 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  };

  return {
    available: true,
    totals: { all: totalRes.count || 0, today: todayRes.count || 0, week: weekRes.count || 0 },
    unique: { today: uniqToday, week: uniqWeek },
    dailyTrends,
    topPaths: tally('path'),
    topReferrers: tally('referrer'),
    devices: tally('device'),
    countries: tally('country'),
    recent: rows.slice(0, 25).map((r) => ({
      path: r.path, referrer: r.referrer, device: r.device, browser: r.browser, country: r.country, created_at: r.created_at,
    })),
  };
}
