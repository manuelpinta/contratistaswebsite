import { supabase } from './client'
import type { Database } from './types'

type AdminUser = Database['public']['Tables']['admin_users']['Row']

// Obtener un admin por email
export async function getAdminByEmail(email: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching admin:', error)
    throw error
  }

  return data
}

// Obtener un admin por ID
export async function getAdminById(id: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching admin:', error)
    throw error
  }

  return data
}

// Crear un nuevo admin
export async function createAdmin(
  email: string, 
  name: string, 
  countryCode?: string | null, 
  cityCode?: string | null
) {
  const { data, error } = await supabase
    .from('admin_users')
    .insert({ 
      email, 
      name,
      country_code: countryCode || null,
      city_code: cityCode || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating admin:', error)
    throw error
  }

  return data
}

// Obtener admins por país
export async function getAdminsByCountry(countryCode: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('country_code', countryCode)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admins by country:', error)
    throw error
  }

  return data
}

// Obtener admins por ciudad (para México)
export async function getAdminsByCity(cityCode: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('city_code', cityCode)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admins by city:', error)
    throw error
  }

  return data
}

// Obtener todos los admins
export async function getAllAdmins() {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admins:', error)
    throw error
  }

  return data
}
