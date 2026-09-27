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
  let formsubmitSent = false;
  let saved = false;

  // 1. Send email notification via FormSubmit.co to najimashaikh267@gmail.com
  try {
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
    });

    if (formSubmitRes.ok) {
      formsubmitSent = true;
    }
  } catch (err) {
    console.warn('FormSubmit notification error (non-fatal):', err);
  }

  // 2. Save message into Supabase contact_messages table
  try {
    const { error: supabaseError } = await supabase.from('contact_messages').insert({
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      status: 'new',
    });

    if (!supabaseError) {
      saved = true;
    }
  } catch (err) {
    console.warn('Supabase contact save error:', err);
  }

  // 3. Save into local DB for admin portal
  try {
    await apiFetch('/contact-messages', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
    saved = true;
  } catch (err) {
    console.warn('Local contact save error:', err);
  }

  if (!saved && !formsubmitSent) {
    throw new Error('Could not submit message. Please try again.');
  }

  return { formsubmitSent, saved };
}
