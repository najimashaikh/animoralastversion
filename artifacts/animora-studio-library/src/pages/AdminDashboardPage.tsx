import { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, ShieldCheck, Users } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { ApiError, apiFetch } from '@/lib/api';
import { supabase } from '@/lib/supabase';

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
};

type AdminResponse = { users: AdminUser[] };
type DashboardResponse = { counts: Record<string, number> };
type AdminRow = Record<string, unknown>;

function AdminTable({ eyebrow, title, rows, columns }: { eyebrow: string; title: string; rows: AdminRow[]; columns: Array<{ key: string; label: string }> }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#c9ccbd] bg-[#f2f2e7]">
      <div className="flex items-center justify-between border-b border-[#c9ccbd] px-5 py-5 md:px-7">
        <div><p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#68731f]">{eyebrow}</p><h2 className="mt-2 font-display text-3xl tracking-[-.05em]">{title}</h2></div>
        <span className="font-mono-custom text-[10px] text-[#7d857c]">{rows.length} RECORDS</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-left text-sm">
          <thead className="border-b border-[#d7d9cc] font-mono-custom text-[9px] uppercase tracking-[.14em] text-[#7d857c]">
            <tr>{columns.map((column) => <th key={column.key} className="px-5 py-3 font-normal md:px-7">{column.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#d7d9cc]">
            {rows.map((row, index) => <tr key={String(row.id ?? index)} className="align-top">
              {columns.map((column) => <td key={column.key} className="max-w-[340px] px-5 py-4 text-[#4f5a52] md:px-7">{String(row[column.key] ?? '—')}</td>)}
            </tr>)}
          </tbody>
        </table>
        {!rows.length && <p className="px-5 py-8 text-sm text-[#697168] md:px-7">No records yet.</p>}
      </div>
    </section>
  );
}

export default function AdminDashboardPage() {
  const [, navigate] = useLocation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [collections, setCollections] = useState<Record<string, AdminRow[]>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const supabaseMessagesPromise = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => (data as AdminRow[]) ?? [])
      .catch(() => [] as AdminRow[]);

    Promise.all([
      apiFetch<AdminResponse>('/admin/users'),
      apiFetch<DashboardResponse>('/admin/dashboard'),
      apiFetch<{ 'contact-messages': AdminRow[] }>('/admin/contact-messages').catch(() => ({ 'contact-messages': [] })),
      apiFetch<{ projects: AdminRow[] }>('/admin/projects'),
      apiFetch<{ documents: AdminRow[] }>('/admin/documents'),
      apiFetch<{ courses: AdminRow[] }>('/admin/courses'),
      apiFetch<{ tutorials: AdminRow[] }>('/admin/tutorials'),
      apiFetch<{ problems: AdminRow[] }>('/admin/problems'),
      supabaseMessagesPromise,
    ]).then(([userResponse, dashboardResponse, messagesResponse, projectsResponse, documentsResponse, coursesResponse, tutorialsResponse, problemsResponse, supabaseMessages]) => {
      if (!active) return;
      setUsers(userResponse.users);

      // Merge local and Supabase contact messages without duplicates
      const localMsgs = messagesResponse['contact-messages'] || [];
      const seen = new Set<string>();
      const mergedContactMsgs: AdminRow[] = [];
      for (const m of [...supabaseMessages, ...localMsgs]) {
        const key = `${m.email ?? ''}|${m.created_at ?? ''}|${m.message ?? ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          mergedContactMsgs.push(m);
        }
      }

      setCounts({
        ...dashboardResponse.counts,
        contact_messages: mergedContactMsgs.length || dashboardResponse.counts.contact_messages || 0,
      });

      setCollections({
        'contact-messages': mergedContactMsgs,
        projects: projectsResponse.projects,
        documents: documentsResponse.documents,
        courses: coursesResponse.courses,
        tutorials: tutorialsResponse.tutorials,
        problems: problemsResponse.problems,
      });
    }).catch((requestError) => {
      if (!active) return;
      if (requestError instanceof ApiError && (requestError.status === 401 || requestError.status === 403)) {
        navigate('/admin/login');
        return;
      }
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to load the dashboard.');
    });
    return () => { active = false; };
  }, [navigate]);

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => undefined);
    navigate('/admin/login');
  }

  return (
    <main className="grain min-h-screen bg-[#ececdf] text-[#172520]">
      <header className="border-b border-[#cfd1c1] bg-[#ececdf]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-10">
          <Link href="/" className="font-display text-lg font-bold tracking-[.08em]">ANIMORA <span className="text-[#7c862a]">/</span> STUDIO</Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden items-center gap-2 rounded-full border border-[#b8bcae] px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] sm:flex"><ArrowLeft size={13} /> Library</Link>
            <button data-testid="button-admin-logout" onClick={logout} className="flex items-center gap-2 rounded-full bg-[#172520] px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#eff0dc]"><LogOut size={13} /> Logout</button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-20">
        <div className="flex flex-col justify-between gap-6 border-b border-[#bfc3b3] pb-10 md:flex-row md:items-end">
          <div><p className="font-mono-custom text-[10px] uppercase tracking-[.24em] text-[#68731f]">ADMIN / DASHBOARD</p><h1 className="mt-4 font-display text-6xl font-semibold leading-[.88] tracking-[-.08em] md:text-8xl">Studio control.</h1><p className="mt-5 max-w-md text-sm leading-6 text-[#626a62]">Manage access and monitor the core library records from one protected space.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-[#bfc3b3] px-4 py-2 font-mono-custom text-[10px] uppercase tracking-[.14em]"><ShieldCheck size={14} className="text-[#7d891b]" /> Backend verified</div>
        </div>
        {error && <p role="alert" className="mt-8 rounded-xl border border-[#d17d69]/50 bg-[#f4d6ce] px-4 py-3 text-sm">{error}</p>}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Users', counts.users ?? 0],
            ['Projects', counts.projects ?? 0],
            ['Documents', counts.documents ?? 0],
            ['Messages', counts.contact_messages ?? 0],
          ].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#172520] p-5 text-[#eff0dc]"><p className="font-mono-custom text-[10px] uppercase tracking-[.18em] text-[#aab5a8]">{label}</p><p className="mt-4 font-display text-5xl tracking-[-.07em] text-[#c3e12c]">{value}</p></div>)}
        </div>
        <div className="mt-12 space-y-6">
          <section className="overflow-hidden rounded-3xl border border-[#c9ccbd] bg-[#f2f2e7]">
            <div className="flex items-center justify-between border-b border-[#c9ccbd] px-5 py-5 md:px-7"><div><p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#68731f]">USER DIRECTORY</p><h2 className="mt-2 font-display text-3xl tracking-[-.05em]">Accounts</h2></div><Users size={22} className="text-[#7d891b]" /></div>
            <div className="divide-y divide-[#d7d9cc]">
              {users.map((user) => <div key={user.id} className="flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7"><div><p className="font-semibold">{user.name}</p><p className="mt-1 text-sm text-[#697168]">{user.email}</p></div><div className="flex items-center gap-3"><span className="rounded-full border border-[#b8bcae] px-3 py-1 font-mono-custom text-[9px] uppercase tracking-[.14em]">{user.role}</span><span className="text-xs text-[#7d857c]">{new Date(user.created_at).toLocaleDateString()}</span></div></div>)}
              {!users.length && <p className="px-5 py-8 text-sm text-[#697168] md:px-7">No accounts yet.</p>}
            </div>
          </section>
          <AdminTable eyebrow="INBOX" title="Contact messages" rows={collections['contact-messages'] ?? []} columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'subject', label: 'Subject' }, { key: 'status', label: 'Status' }]} />
          <AdminTable eyebrow="WORKSPACE" title="Projects" rows={collections.projects ?? []} columns={[{ key: 'title', label: 'Project' }, { key: 'user_name', label: 'Owner' }, { key: 'status', label: 'Status' }, { key: 'updated_at', label: 'Updated' }]} />
          <AdminTable eyebrow="WORKSPACE" title="Documents" rows={collections.documents ?? []} columns={[{ key: 'title', label: 'Document' }, { key: 'document_type', label: 'Type' }, { key: 'user_name', label: 'Owner' }, { key: 'updated_at', label: 'Updated' }]} />
          <div className="grid gap-6 xl:grid-cols-3">
            <AdminTable eyebrow="LIBRARY" title="Courses" rows={collections.courses ?? []} columns={[{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'level', label: 'Level' }]} />
            <AdminTable eyebrow="LIBRARY" title="Tutorials" rows={collections.tutorials ?? []} columns={[{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'duration', label: 'Duration' }]} />
            <AdminTable eyebrow="LIBRARY" title="Problems" rows={collections.problems ?? []} columns={[{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'difficulty', label: 'Difficulty' }]} />
          </div>
        </div>
      </div>
    </main>
  );
}