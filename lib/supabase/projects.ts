import { supabase } from './client'
import type { Database } from './types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// Obtener todos los proyectos de un contratista
export async function getContractorProjects(contractorId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contractor projects:', error)
    throw error
  }

  return data
}

// Obtener un proyecto por ID
export async function getProjectById(projectId: string) {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projectError) {
    console.error('Error fetching project:', projectError)
    throw projectError
  }

  // Obtener el contratista
  let contractor = null
  if (project.contractor_id) {
    const { data: contractorData, error: contractorError } = await supabase
      .from('contractors')
      .select('id, name, email, phone')
      .eq('id', project.contractor_id)
      .single()

    if (!contractorError && contractorData) {
      contractor = {
        id: contractorData.id,
        name: contractorData.name,
        email: contractorData.email,
        phone: contractorData.phone,
      }
    }
  }

  return {
    ...project,
    contractor
  }
}

// Obtener todos los proyectos (para admin)
// Opcionalmente filtrar por país y ciudad del admin
export async function getAllProjects(countryCode?: string | null, cityCode?: string | null) {
  // Primero obtener todos los proyectos
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: projects, error: projectsError } = await query

  if (projectsError) {
    console.error('Error fetching all projects:', projectsError)
    throw projectsError
  }

  if (!projects || projects.length === 0) {
    return []
  }

  // Obtener los IDs únicos de contratistas
  const contractorIds = [...new Set(projects.map((p: any) => p.contractor_id))]
  
  // Obtener los contratistas, filtrando por país/ciudad si se especifica
  let contractorsQuery = supabase
    .from('contractors')
    .select('id, name, email, phone, country_code, city_code')
    .in('id', contractorIds)

  if (countryCode) {
    contractorsQuery = contractorsQuery.eq('country_code', countryCode)
  }
  if (cityCode) {
    contractorsQuery = contractorsQuery.eq('city_code', cityCode)
  }

  const { data: contractors, error: contractorsError } = await contractorsQuery

  if (contractorsError) {
    console.error('Error fetching contractors:', contractorsError)
    // Continuar sin los datos del contratista si hay error
  }

  // Crear un mapa de contratistas por ID
  const contractorsMap = new Map(
    (contractors || []).map((c: any) => [c.id, c])
  )

  // Combinar proyectos con sus contratistas
  // Filtrar proyectos que no tengan contratista en el país/ciudad especificado
  const projectsWithContractors = projects
    .map((project: any) => {
      const contractor = contractorsMap.get(project.contractor_id)
      return contractor ? {
        ...project,
        contractor: {
          id: contractor.id,
          name: contractor.name,
          email: contractor.email,
          phone: contractor.phone,
          country_code: contractor.country_code,
          city_code: contractor.city_code,
        }
      } : null
    })
    .filter((p: any) => p !== null) // Filtrar proyectos sin contratista válido

  return projectsWithContractors
}

// Crear un nuevo proyecto
export async function createProject(project: ProjectInsert) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw error
  }

  return data
}

// Actualizar un proyecto
export async function updateProject(projectId: string, updates: ProjectUpdate) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw error
  }

  return data
}

// Validar/rechazar un proyecto (admin)
export async function reviewProject(
  projectId: string,
  status: 'validated' | 'rejected',
  validationNotes: string,
  validatorId: string
) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      status,
      validation_notes: validationNotes,
      validation_date: new Date().toISOString(),
      validator_id: validatorId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error reviewing project:', error)
    throw error
  }

  return data
}

