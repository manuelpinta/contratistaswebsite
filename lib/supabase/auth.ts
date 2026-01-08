import { supabase } from './client'

// Iniciar sesión como contratista
export async function signInContractor(email: string, password: string) {
  // Nota: Esto asume que estás usando Supabase Auth
  // Si no, necesitarás implementar tu propia lógica de autenticación
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error signing in:', error)
    throw error
  }

  return data
}

// Registrar nuevo contratista
export async function signUpContractor(email: string, password: string, userData: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })

  if (error) {
    console.error('Error signing up:', error)
    throw error
  }

  return data
}

// Cerrar sesión
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Obtener usuario actual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

