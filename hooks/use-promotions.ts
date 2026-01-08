"use client"

import { useState, useEffect } from 'react'
import { getActivePromotions } from '@/lib/supabase/promotions'
import type { Database } from '@/lib/supabase/types'

type Promotion = Database['public']['Tables']['promotions']['Row']

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPromotions() {
      try {
        setLoading(true)
        const data = await getActivePromotions()
        setPromotions(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching promotions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [])

  return { promotions, loading, error }
}

