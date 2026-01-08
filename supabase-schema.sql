-- Esquema de Base de Datos Supabase
-- Ejecuta este archivo en el SQL Editor de Supabase

-- Tabla: contractors (Contratistas)
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  rfc TEXT NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para contractors
CREATE INDEX IF NOT EXISTS idx_contractors_email ON contractors(email);

-- Tabla: projects (Proyectos)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  square_meters INTEGER NOT NULL,
  liters INTEGER NOT NULL,
  paint_type TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'validated', 'rejected')),
  validation_notes TEXT,
  validation_date TIMESTAMP WITH TIME ZONE,
  validator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para projects
CREATE INDEX IF NOT EXISTS idx_projects_contractor_id ON projects(contractor_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Tabla: project_images (Imágenes de Proyectos)
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para project_images
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);

-- Tabla: promotions (Banners de Promociones)
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banner_image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para promotions
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, display_order);

-- Tabla: admin_users (Usuarios Administradores)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Habilitar Row Level Security (RLS)
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para contractors
-- Los contratistas pueden ver y editar su propia información
CREATE POLICY "Contractors can view own data"
  ON contractors FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Contractors can update own data"
  ON contractors FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Políticas RLS para projects
-- Los contratistas pueden ver sus propios proyectos
CREATE POLICY "Contractors can view own projects"
  ON projects FOR SELECT
  USING (
    contractor_id IN (
      SELECT id FROM contractors WHERE id::text = auth.uid()::text
    )
  );

-- Los contratistas pueden crear proyectos
CREATE POLICY "Contractors can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    contractor_id IN (
      SELECT id FROM contractors WHERE id::text = auth.uid()::text
    )
  );

-- Los contratistas pueden actualizar sus proyectos pendientes
CREATE POLICY "Contractors can update own pending projects"
  ON projects FOR UPDATE
  USING (
    contractor_id IN (
      SELECT id FROM contractors WHERE id::text = auth.uid()::text
    )
    AND status IN ('pending', 'rejected')
  );

-- Los admins pueden ver todos los proyectos
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text
    )
  );

-- Los admins pueden actualizar proyectos
CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text
    )
  );

-- Políticas RLS para project_images
-- Los contratistas pueden ver imágenes de sus proyectos
CREATE POLICY "Contractors can view own project images"
  ON project_images FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE contractor_id IN (
        SELECT id FROM contractors WHERE id::text = auth.uid()::text
      )
    )
  );

-- Los contratistas pueden insertar imágenes en sus proyectos
CREATE POLICY "Contractors can insert own project images"
  ON project_images FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE contractor_id IN (
        SELECT id FROM contractors WHERE id::text = auth.uid()::text
      )
    )
  );

-- Los admins pueden ver todas las imágenes
CREATE POLICY "Admins can view all project images"
  ON project_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text
    )
  );

-- Políticas RLS para promotions (público)
CREATE POLICY "Promotions are public"
  ON promotions FOR SELECT
  USING (is_active = true);

-- Políticas RLS para admin_users
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text
    )
  );

