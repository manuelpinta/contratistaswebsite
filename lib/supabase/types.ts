// Tipos para las tablas de Supabase

export type Database = {
  public: {
    Tables: {
      contractors: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          rfc?: string // Mantener para compatibilidad
          tax_id?: string
          country_code: string | null
          city_code: string | null
          password_hash?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          rfc?: string // Mantener para compatibilidad
          tax_id?: string | null
          country_code?: string | null
          city_code?: string | null
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          rfc?: string // Mantener para compatibilidad
          tax_id?: string | null
          country_code?: string | null
          city_code?: string | null
          password_hash?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          contractor_id: string
          name: string
          location: string
          square_meters: number
          liters: number
          paint_type?: string
          description?: string
          status: 'pending' | 'reviewing' | 'validated' | 'rejected'
          validation_notes?: string
          validation_date?: string
          validator_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contractor_id: string
          name: string
          location: string
          square_meters: number
          liters: number
          paint_type?: string
          description?: string
          status?: 'pending' | 'reviewing' | 'validated' | 'rejected'
          validation_notes?: string
          validation_date?: string
          validator_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contractor_id?: string
          name?: string
          location?: string
          square_meters?: number
          liters?: number
          paint_type?: string
          description?: string
          status?: 'pending' | 'reviewing' | 'validated' | 'rejected'
          validation_notes?: string
          validation_date?: string
          validator_id?: string
          updated_at?: string
        }
      }
      project_images: {
        Row: {
          id: string
          project_id: string
          image_url: string
          image_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          image_url: string
          image_order: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          image_url?: string
          image_order?: number
        }
      }
      promotions: {
        Row: {
          id: string
          banner_image_url: string
          link_url?: string
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          banner_image_url: string
          link_url?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          banner_image_url?: string
          link_url?: string
          is_active?: boolean
          display_order?: number
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          name: string
          country_code: string | null
          city_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          country_code?: string | null
          city_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          country_code?: string | null
          city_code?: string | null
        }
      }
    }
  }
}

