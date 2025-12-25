// Authentication utilities (Client-side)
import { createClient } from './supabase-client'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role?: string
}

/**
 * Get current user session (Client-side)
 */
export async function getSession(): Promise<{ user: AuthUser | null; error: Error | null }> {
  try {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return { user: null, error }
    }

    if (!session?.user) {
      return { user: null, error: null }
    }

    // Check if user is admin
    const role = await getUserRole(session.user)

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email || '',
      role,
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

/**
 * Get user role (check if user is admin)
 */
async function getUserRole(user: User): Promise<string | undefined> {
  // Option 1: Check user metadata
  if (user.user_metadata?.role === 'admin') {
    return 'admin'
  }

  // Option 2: Check admin emails from environment variable
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  if (user.email && adminEmails.includes(user.email)) {
    return 'admin'
  }

  return undefined
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const { user } = await getSession()
  return user?.role === 'admin'
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

