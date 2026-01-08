"use client"

import { useState, useEffect } from 'react'
import { getAllProjects, reviewProject } from '@/lib/supabase/projects'
import type { Database } from '@/lib/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

export function useAllProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        // Obtener país y ciudad del admin desde localStorage
        const countryCode = typeof window !== 'undefined' 
          ? localStorage.getItem("adminCountryCode") 
          : null
        const cityCode = typeof window !== 'undefined' 
          ? localStorage.getItem("adminCityCode") 
          : null
        
        const data = await getAllProjects(countryCode, cityCode)
        setProjects(data as Project[])
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching all projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const refetch = async () => {
    try {
      setLoading(true)
      // Obtener país y ciudad del admin desde localStorage
      const countryCode = typeof window !== 'undefined' 
        ? localStorage.getItem("adminCountryCode") 
        : null
      const cityCode = typeof window !== 'undefined' 
        ? localStorage.getItem("adminCityCode") 
        : null
      
      const data = await getAllProjects(countryCode, cityCode)
      setProjects(data as Project[])
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const review = async (
    projectId: string,
    status: 'validated' | 'rejected',
    validationNotes: string,
    validatorId: string
  ) => {
    try {
      await reviewProject(projectId, status, validationNotes, validatorId)
      await refetch()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  return { projects, loading, error, refetch, review }
}

