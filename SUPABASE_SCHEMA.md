# Esquema de Base de Datos Supabase

Este documento describe las tablas necesarias para la aplicación.

## Tablas Requeridas

### 1. `contractors` (Contratistas)

```sql
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  rfc TEXT NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_contractors_email ON contractors(email);
```

### 2. `projects` (Proyectos)

```sql
CREATE TABLE projects (
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

-- Índices
CREATE INDEX idx_projects_contractor_id ON projects(contractor_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

### 3. `project_images` (Imágenes de Proyectos)

```sql
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_project_images_project_id ON project_images(project_id);
```

### 4. `promotions` (Banners de Promociones)

```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banner_image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_promotions_active ON promotions(is_active, display_order);
```

### 5. `admin_users` (Usuarios Administradores)

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_admin_users_email ON admin_users(email);
```

## Storage Buckets

Necesitas crear un bucket en Supabase Storage para las imágenes de proyectos:

1. Ve a Storage en tu proyecto de Supabase
2. Crea un bucket llamado `project-images`
3. Configura las políticas RLS según necesites

## Políticas RLS (Row Level Security)

### Para `contractors`:
```sql
-- Los contratistas solo pueden ver y editar su propia información
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view own data"
  ON contractors FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Contractors can update own data"
  ON contractors FOR UPDATE
  USING (auth.uid()::text = id::text);
```

### Para `projects`:
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

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
```

## Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key_de_supabase
```

**Nota:** 
- La **Publishable Key** es la que se usa en el cliente (frontend) y es segura para exponer públicamente
- La **Secret Key** solo debe usarse en el servidor (backend) y nunca debe exponerse en el cliente

