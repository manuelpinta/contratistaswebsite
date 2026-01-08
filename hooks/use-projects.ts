"use client"

import { useState, useEffect } from 'react'
import { getContractorProjects, getProjectById, createProject, updateProject } from '@/lib/supabase/projects'
import type { Database } from '@/lib/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export function useContractorProjects(contractorId: string | null) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!contractorId) {
      setLoading(false)
      return
    }

    async function fetchProjects() {
      try {
        setLoading(true)
        const data = await getContractorProjects(contractorId)
        setProjects(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [contractorId])

  return { projects, loading, error, refetch: () => contractorId && getContractorProjects(contractorId).then(setProjects) }
}

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    async function fetchProject() {
      try {
        setLoading(true)
        const data = await getProjectById(projectId)
        setProject(data as Project)
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  return { project, loading, error }
}

export function useCreateProject() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const create = async (project: ProjectInsert) => {
    try {
      setLoading(true)
      setError(null)
      const data = await createProject(project)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error }
}

export function useUpdateProject() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const update = async (projectId: string, updates: ProjectUpdate) => {
    try {
      setLoading(true)
      setError(null)
      const data = await updateProject(projectId, updates)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error }
}

