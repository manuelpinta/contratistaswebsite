import { supabase } from './client'
import type { Database } from './types'

type Contractor = Database['public']['Tables']['contractors']['Row']
type ContractorInsert = Database['public']['Tables']['contractors']['Insert']
type ContractorUpdate = Database['public']['Tables']['contractors']['Update']

// Obtener un contratista por email
export async function getContractorByEmail(email: string) {
  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching contractor:', error)
    throw error
  }

  return data
}

// Obtener un contratista por ID
export async function getContractorById(id: string) {
  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching contractor:', error)
    throw error
  }

  return data
}

// Crear un nuevo contratista
export async function createContractor(contractor: ContractorInsert) {
  // Preparar los datos para insertar, manejando compatibilidad con esquema antiguo
  const insertData: any = {
    name: contractor.name,
    email: contractor.email,
    phone: contractor.phone,
  }

  // Manejar tax_id/rfc - el esquema original requiere rfc, el nuevo usa tax_id
  // Siempre enviar rfc porque es NOT NULL en el esquema original
  const taxIdValue = contractor.tax_id || contractor.rfc || ""
  insertData.rfc = taxIdValue
  
  // Intentar agregar tax_id solo si está definido (puede no existir en esquema antiguo)
  if (contractor.tax_id !== undefined) {
    insertData.tax_id = contractor.tax_id || null
  }

  // Agregar campos nuevos solo si están definidos (pueden no existir en esquema antiguo)
  if (contractor.country_code !== undefined) {
    insertData.country_code = contractor.country_code
  }
  if (contractor.city_code !== undefined) {
    insertData.city_code = contractor.city_code
  }

  // Agregar password_hash si existe
  if (contractor.password_hash) {
    insertData.password_hash = contractor.password_hash
  }

  try {
    const { data, error } = await supabase
      .from('contractors')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating contractor:', error)
      console.error('Data attempted:', insertData)
      
      // Si el error es por columnas que no existen, intentar sin esos campos
      if (error.message?.includes('column') || error.code === '42703') {
        console.warn('Columnas nuevas no encontradas, intentando sin ellas...')
        const fallbackData: any = {
          name: contractor.name,
          email: contractor.email,
          phone: contractor.phone,
          rfc: taxIdValue,
        }
        if (contractor.password_hash) {
          fallbackData.password_hash = contractor.password_hash
        }
        
        const { data: fallbackResult, error: fallbackError } = await supabase
          .from('contractors')
          .insert(fallbackData)
          .select()
          .single()
        
        if (fallbackError) {
          throw new Error(`Error al crear contratista: ${fallbackError.message || fallbackError.details || JSON.stringify(fallbackError)}`)
        }
        
        return fallbackResult
      }
      
      // Lanzar un error más descriptivo
      const errorMessage = error.message || error.details || JSON.stringify(error)
      throw new Error(`Error al crear contratista: ${errorMessage}`)
    }

    return data
  } catch (err: any) {
    // Re-lanzar el error para que el componente lo maneje
    throw err
  }
}

// Actualizar un contratista
export async function updateContractor(id: string, updates: ContractorUpdate) {
  const { data, error } = await supabase
    .from('contractors')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating contractor:', error)
    throw error
  }

  return data
}

