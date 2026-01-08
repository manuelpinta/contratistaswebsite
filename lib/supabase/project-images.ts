import { supabase } from './client'
import type { Database } from './types'

type ProjectImage = Database['public']['Tables']['project_images']['Row']
type ProjectImageInsert = Database['public']['Tables']['project_images']['Insert']

// Obtener imágenes de un proyecto
export async function getProjectImages(projectId: string) {
  const { data, error } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', projectId)
    .order('image_order', { ascending: true })

  if (error) {
    console.error('Error fetching project images:', error)
    throw error
  }

  return data
}

// Subir imágenes de un proyecto
export async function uploadProjectImages(images: ProjectImageInsert[]) {
  const { data, error } = await supabase
    .from('project_images')
    .insert(images)
    .select()

  if (error) {
    console.error('Error uploading project images:', error)
    throw error
  }

  return data
}

// Eliminar una imagen (de la base de datos y del storage)
export async function deleteProjectImage(imageId: string) {
  // Primero obtener la información de la imagen para eliminar del storage
  const { data: imageData, error: fetchError } = await supabase
    .from('project_images')
    .select('image_url')
    .eq('id', imageId)
    .single()

  if (fetchError) {
    console.error('Error fetching image data:', fetchError)
    throw fetchError
  }

  // Extraer el path del storage de la URL
  if (imageData?.image_url) {
    const urlMatch = imageData.image_url.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/)
    if (urlMatch) {
      const [, bucket, encodedPath] = urlMatch
      let decodedPath: string
      try {
        decodedPath = decodeURIComponent(encodedPath)
      } catch (e) {
        decodedPath = encodedPath
      }

      // Eliminar del storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([decodedPath])

      if (storageError) {
        console.warn('Error deleting image from storage (continuing with DB delete):', storageError)
        // Continuar aunque falle el storage, para no bloquear la eliminación de la BD
      }
    }
  }

  // Eliminar de la base de datos
  const { error } = await supabase
    .from('project_images')
    .delete()
    .eq('id', imageId)

  if (error) {
    console.error('Error deleting project image from database:', error)
    throw error
  }
}

// Subir archivo a Supabase Storage
export async function uploadFileToStorage(
  bucket: string,
  path: string,
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading file to storage:', error)
    throw error
  }

  return data
}

// Obtener URL pública de un archivo
export function getPublicUrl(bucket: string, path: string) {
  // Decodificar el path si viene codificado
  const decodedPath = decodeURIComponent(path)
  const { data } = supabase.storage.from(bucket).getPublicUrl(decodedPath)
  return data.publicUrl
}

// Obtener URL firmada (temporal) de un archivo (útil si el bucket es privado)
export async function getSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
  // Decodificar el path si viene codificado
  let decodedPath = path
  try {
    decodedPath = decodeURIComponent(path)
  } catch (e) {
    // Si ya está decodificado, usar el path original
    decodedPath = path
  }
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(decodedPath, expiresIn)

  if (error) {
    console.error('Error creating signed URL:', error)
    throw error
  }

  return data.signedUrl
}

