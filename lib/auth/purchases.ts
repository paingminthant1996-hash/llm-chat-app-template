// User purchase utilities
import { createClient } from './supabase-client'
import { PurchaseWithDetails } from '../db/purchases'

/**
 * Get user's purchases
 */
export async function getUserPurchases(userId: string): Promise<PurchaseWithDetails[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('purchases_v2')
      .select(`
        *,
        template_version:template_versions(
          id,
          version,
          template_id,
          template:templates(
            id,
            title,
            slug,
            category
          )
        )
      `)
      .eq('user_id', userId)
      .eq('granted', true)
      .eq('refunded', false)
      .order('purchased_at', { ascending: false })

    if (error) {
      console.error('Error fetching user purchases:', error)
      return []
    }

    // Transform data
    const purchases: PurchaseWithDetails[] = (data || []).map((purchase: any) => {
      const result: PurchaseWithDetails = {
        id: purchase.id,
        user_id: purchase.user_id,
        template_version_id: purchase.template_version_id,
        price: parseFloat(purchase.price),
        currency: purchase.currency || 'USD',
        stripe_payment_intent: purchase.stripe_payment_intent,
        stripe_session_id: purchase.stripe_session_id,
        granted: purchase.granted,
        refunded: purchase.refunded,
        purchased_at: purchase.purchased_at,
        expires_at: purchase.expires_at,
        metadata: purchase.metadata,
      }

      if (purchase.template_version) {
        result.template_version = {
          id: purchase.template_version.id,
          version: purchase.template_version.version,
          template_id: purchase.template_version.template_id,
        }

        if (purchase.template_version.template) {
          result.template = purchase.template_version.template
        }
      }

      return result
    })

    return purchases
  } catch (error) {
    console.error('Failed to fetch user purchases:', error)
    return []
  }
}

/**
 * Check if user has purchased a template
 */
export async function hasUserPurchasedTemplate(
  userId: string,
  templateId: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('purchases_v2')
      .select(`
        id,
        template_version:template_versions!inner(
          template_id
        )
      `)
      .eq('user_id', userId)
      .eq('template_versions.template_id', templateId)
      .eq('granted', true)
      .eq('refunded', false)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking purchase:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Failed to check purchase:', error)
    return false
  }
}

/**
 * Get download URL for purchased template
 */
export async function getDownloadUrl(
  userId: string,
  templateVersionId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Verify user has access
    const hasAccess = await verifyUserAccess(userId, templateVersionId)
    if (!hasAccess) {
      return { url: null, error: 'Access denied. Please purchase this template first.' }
    }

    // Get access token
    const { data: { session } } = await createClient().auth.getSession()
    if (!session) {
      return { url: null, error: 'Not authenticated' }
    }

    // Call download API
    const apiBase = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const res = await fetch(`${apiBase}/api/download?version_id=${templateVersionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
      return { url: null, error: errorData.error || 'Failed to get download URL' }
    }

    const data = await res.json()
    return { url: data.url || null, error: null }
  } catch (error: any) {
    return { url: null, error: error.message || 'Failed to get download URL' }
  }
}

/**
 * Verify user has access to template version
 */
async function verifyUserAccess(userId: string, templateVersionId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('purchases_v2')
      .select('id')
      .eq('user_id', userId)
      .eq('template_version_id', templateVersionId)
      .eq('granted', true)
      .eq('refunded', false)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return false
    }

    return !!data
  } catch {
    return false
  }
}

