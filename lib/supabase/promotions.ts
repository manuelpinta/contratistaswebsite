import { supabase } from './client'
import type { Database } from './types'

type Promotion = Database['public']['Tables']['promotions']['Row']

// Obtener banners de promociones activos
export async function getActivePromotions() {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching promotions:', error)
    throw error
  }

  return data
}

