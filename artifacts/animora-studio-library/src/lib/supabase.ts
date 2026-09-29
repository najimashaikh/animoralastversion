import { createClient } from '@supabase/supabase-js';
import { apiFetch } from './api';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://kfngsvnxsqhmkojdppll.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmbmdzdm54c3FobWtvamRwcGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Mjc0MDYsImV4cCI6MjEwNjEwMzQwNn0.qInFDqhb89xeKgS2YqzJskQ4pUpgpl3TBIF3c1_E-HE';

export const FORMSUBMIT_EMAIL = 'najimashaikh267@gmail.com';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface AppUser {
  id: string | number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Sign up a new user via Supabase RPC (which creates auth.users, auth.identities, and public.profiles directly)
 * and automatically sign them in.
 */
export async function authSignUp(name: string, email: string, password: string): Promise<AppUser> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // 1. Register user directly into Supabase database (auth.users + auth.identities + public.profiles)
  const { data: rpcData, error: rpcError } = await supabase.rpc('register_studio_user', {
    user_name: cleanName,
    user_email: cleanEmail,
    user_password: password,
    user_role: 'user',
  });

  if (rpcError) {
    // If RPC returned an error, check if user already exists or show message
    throw new Error(rpcError.message || 'Failed to create account in database.');
  }

  // 2. Automatically log the user into Supabase session
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  // 3. Sync to local backend database for backward compatibility
  apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
  }).catch(() => undefined);

  if (!signInError && authData.user) {
    return {
      id: authData.user.id,
      name: cleanName,
      email: cleanEmail,
      role: 'user',
    };
  }

  return {
    id: (rpcData as { id?: string })?.id ?? cleanEmail,
    name: cleanName,
    email: cleanEmail,
    role: 'user',
  };
}

/**
 * Sign in existing user via Supabase Auth with fallback to backend
 */
export async function authSignIn(email: string, password: string): Promise<AppUser> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Try Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (!error && data.user) {
    let role: 'user' | 'admin' = (data.user.user_metadata?.role as 'user' | 'admin') || 'user';
    let name: string = (data.user.user_metadata?.name as string) || '';

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role as 'user' | 'admin';
      }
      if (profile?.name) {
        name = profile.name;
      }
    } catch {
      // use user metadata
    }

    if (!name) {
      name = cleanEmail.split('@')[0] ?? 'Studio Member';
    }

    // Also sync local PHP session
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password }),
    }).catch(() => undefined);

    return {
      id: data.user.id,
      name,
      email: data.user.email || cleanEmail,
      role,
    };
  }

  // 2. Fallback to local API (e.g. for existing local admin accounts or offline mode)
  try {
    const localResponse = await apiFetch<{ user: AppUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    return localResponse.user;
  } catch (localErr) {
    if (error) {
      throw new Error(error.message);
    }
    throw localErr;
  }
}

/**
 * Sign out from Supabase & local session
 */
export async function authSignOut(): Promise<void> {
  await Promise.allSettled([
    supabase.auth.signOut(),
    apiFetch('/auth/logout', { method: 'POST' }),
  ]);
}

/**
 * Get current session user (checks Supabase first, then local API)
 */
export async function authGetCurrentUser(): Promise<AppUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      let role: 'user' | 'admin' = (session.user.user_metadata?.role as 'user' | 'admin') || 'user';
      let name: string = (session.user.user_metadata?.name as string) || '';

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.role) {
          role = profile.role as 'user' | 'admin';
        }
        if (profile?.name) {
          name = profile.name;
        }
      } catch {
        // use metadata role
      }

      if (!name) {
        name = session.user.email?.split('@')[0] ?? 'Studio Member';
      }

      return {
        id: session.user.id,
        name,
        email: session.user.email ?? '',
        role,
      };
    }
  } catch {
    // continue to local fallback
  }

  try {
    const local = await apiFetch<{ user: AppUser }>('/auth/me');
    return local.user;
  } catch {
    return null;
  }
}

/**
 * Submit contact form with formsubmit.co notification to najimashaikh267@gmail.com
 * AND save to Supabase contact_messages and local database
 */
export async function submitContactForm(contact: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ formsubmitSent: boolean; saved: boolean }> {
  // 1. Parallel Task: Save to Supabase (primary fast store)
  const supabasePromise = (async () => {
    try {
      const { error: supabaseError } = await supabase.from('contact_messages').insert({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        status: 'new',
      });
      return !supabaseError;
    } catch (err) {
      console.warn('Supabase contact save error:', err);
      return false;
    }
  })();

  // 2. Parallel Task: Send email via FormSubmit with 3.5s timeout protection
  const formSubmitPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
          _subject: `[Animora Studio] New inquiry: ${contact.subject || 'Message from ' + contact.name}`,
          _template: 'table',
          _captcha: 'false',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return formSubmitRes.ok;
    } catch (err) {
      console.warn('FormSubmit notification error (non-fatal):', err);
      return false;
    }
  })();

  // 3. Parallel Task: Sync to local database for admin portal
  const localApiPromise = (async () => {
    try {
      await apiFetch('/contact-messages', {
        method: 'POST',
        body: JSON.stringify(contact),
      });
      return true;
    } catch (err) {
      console.warn('Local contact save error:', err);
      return false;
    }
  })();

  // Execute all 3 in parallel without sequential blocking
  const [supabaseSaved, formsubmitSent, localSaved] = await Promise.all([
    supabasePromise,
    formSubmitPromise,
    localApiPromise,
  ]);

  const saved = supabaseSaved || localSaved;
  if (!saved && !formsubmitSent) {
    throw new Error('Could not submit message. Please try again.');
  }

  return { formsubmitSent, saved };
}

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  desc: string;
  category: string;
  visual: string;
  level: string;
  duration: string;
  meta: string;
  videoUrl: string;
  thumbnail: string;
}

export interface TutorialItem {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  color?: string;
}

export interface ProblemItem {
  id: string;
  title: string;
  category: '2D' | '3D' | 'VFX';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  problem: string;
  task: string;
  hint: string;
  solution: string;
  relatedCourse: string;
  relatedTutorial: string;
}

/**
 * Fetch all Courses from Supabase DB (with fallback to local backend API)
 */
export async function fetchCoursesFromDb(): Promise<CourseItem[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((item) => ({
        id: `course-${item.id}`,
        title: item.title,
        description: item.description,
        desc: item.description,
        category: item.category,
        visual: item.category,
        level: item.level || 'FOUNDATION',
        duration: item.duration || '3h 40m',
        meta: item.duration || '3h 40m',
        videoUrl: item.video_url,
        thumbnail: item.thumbnail || '/animora-art.jpg',
      }));
    }
  } catch (err) {
    console.warn('Supabase courses fetch error, falling back to local API:', err);
  }

  const res = await apiFetch<{ courses: Array<{ id: number; title: string; description: string; category: string; level: string; duration: string; videoUrl?: string; thumbnail?: string }> }>('/courses');
  return res.courses.map((item) => ({
    id: `course-${item.id}`,
    title: item.title,
    description: item.description,
    desc: item.description,
    category: item.category,
    visual: item.category,
    level: item.level,
    duration: item.duration,
    meta: item.duration,
    videoUrl: item.videoUrl || 'https://www.youtube.com/watch?v=haa7n3UGyDc',
    thumbnail: item.thumbnail || '/animora-art.jpg',
  }));
}

/**
 * Fetch all Tutorials from Supabase DB (with fallback to local backend API)
 */
export async function fetchTutorialsFromDb(): Promise<TutorialItem[]> {
  try {
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((item) => ({
        id: `tutorial-${item.id}`,
        title: item.title,
        description: item.description,
        category: item.category,
        duration: item.duration,
        videoUrl: item.video_url,
        thumbnail: item.thumbnail || '/animora-hero.jpg',
        color: item.color || (item.category === '3D' ? 'bg-[#e2e5a9]' : item.category === 'VFX' ? 'bg-[#c3e12c]' : 'bg-[#d7d4c8]'),
      }));
    }
  } catch (err) {
    console.warn('Supabase tutorials fetch error, falling back to local API:', err);
  }

  const res = await apiFetch<{ tutorials: Array<{ id: number; title: string; description: string; category: string; duration: string; videoUrl?: string; thumbnail?: string }> }>('/tutorials');
  return res.tutorials.map((item) => ({
    id: `tutorial-${item.id}`,
    title: item.title,
    description: item.description,
    category: item.category,
    duration: item.duration,
    videoUrl: item.videoUrl || 'https://www.youtube.com/watch?v=n_11DSOBmLc',
    thumbnail: item.thumbnail || '/animora-hero.jpg',
    color: item.category === '3D' ? 'bg-[#e2e5a9]' : item.category === 'VFX' ? 'bg-[#c3e12c]' : 'bg-[#d7d4c8]',
  }));
}

/**
 * Fetch all Problems from Supabase DB (with fallback to local backend API)
 */
export async function fetchProblemsFromDb(): Promise<ProblemItem[]> {
  try {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((item) => ({
        id: `problem-${item.id}`,
        title: item.title,
        category: item.category as '2D' | '3D' | 'VFX',
        difficulty: item.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
        problem: item.problem,
        task: item.task,
        hint: item.hint,
        solution: item.solution,
        relatedCourse: item.related_course,
        relatedTutorial: item.related_tutorial,
      }));
    }
  } catch (err) {
    console.warn('Supabase problems fetch error, falling back to local API:', err);
  }

  const res = await apiFetch<{ problems: Array<ProblemItem> }>('/problems');
  return res.problems.map((item) => ({
    id: `problem-${item.id}`,
    title: item.title,
    category: item.category,
    difficulty: item.difficulty,
    problem: item.problem,
    task: item.task,
    hint: item.hint,
    solution: item.solution,
    relatedCourse: item.relatedCourse || '',
    relatedTutorial: item.relatedTutorial || '',
  }));
}
