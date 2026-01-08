# Checklist para Probar Localmente

## ✅ Antes de Probar

### 1. Configurar Supabase
- [ ] Crear proyecto en [Supabase](https://supabase.com/)
- [ ] Copiar **URL** y **Publishable Key** desde Settings > API
- [ ] Crear archivo `.env.local` en la raíz del proyecto con:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key_aqui
  ```

### 2. Crear Tablas en Supabase
- [ ] Ir a **SQL Editor** en Supabase
- [ ] Ejecutar el archivo `supabase-schema.sql` completo
- [ ] Verificar que se crearon las 5 tablas:
  - `contractors`
  - `projects`
  - `project_images`
  - `promotions`
  - `admin_users`

### 3. Configurar Storage (Opcional - para imágenes)
- [ ] Ir a **Storage** en Supabase
- [ ] Crear bucket llamado `project-images`
- [ ] Configurar como **Private** o **Public** según necesites
- [ ] Ejecutar políticas de storage (ver `supabase-storage-policies.sql`)

### 4. ⚠️ IMPORTANTE: Políticas RLS

**Problema:** Las políticas RLS actuales usan `auth.uid()` que solo funciona con Supabase Auth. Como el código usa `localStorage` para guardar `contractorId`, las políticas van a bloquear las operaciones.

**Solución Temporal (para probar):**
```sql
-- Deshabilitar RLS temporalmente en todas las tablas
ALTER TABLE contractors DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
```

**Solución Permanente (recomendado):**
Ajustar las políticas para que funcionen sin Supabase Auth (ver sección abajo).

### 5. Instalar Dependencias
```bash
pnpm install
```

### 6. Iniciar Servidor
```bash
pnpm dev
```

## 🧪 Probar Funcionalidad

### Probar Registro de Contratista
1. Ir a `/register`
2. Llenar el formulario con datos de prueba
3. Verificar que se crea el contratista en Supabase (Table Editor)

### Probar Login
1. Ir a `/login`
2. Usar el email del contratista creado
3. Verificar que se guarda `contractorId` en localStorage (DevTools > Application > Local Storage)

### Probar Crear Proyecto
1. Ir a `/contractor/projects/new`
2. Llenar el formulario de proyecto
3. Subir imágenes (si configuraste Storage)
4. Verificar que se crea el proyecto en Supabase

### Probar Ver Proyectos
1. Ir a `/contractor/projects`
2. Verificar que se muestran los proyectos del contratista

### Probar Admin
1. Crear un usuario admin manualmente en Supabase:
   ```sql
   INSERT INTO admin_users (email, name) 
   VALUES ('admin@example.com', 'Admin User');
   ```
2. Ir a `/admin/login`
3. Verificar que se muestran todos los proyectos

## 🔧 Solución para Políticas RLS sin Supabase Auth

Si quieres mantener RLS activo pero sin usar Supabase Auth, necesitas ajustar las políticas. Aquí hay un ejemplo:

```sql
-- Política para que los contratistas puedan ver sus proyectos
-- Basada en el contractor_id en lugar de auth.uid()
CREATE POLICY "Contractors can view own projects"
ON projects FOR SELECT
USING (true); -- Temporalmente permitir todo

-- O mejor aún, usar una función que verifique el contractor_id
-- desde una variable de sesión o header personalizado
```

**Nota:** Para producción, deberías implementar autenticación adecuada (Supabase Auth o tu propio sistema con JWT).

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"
- **Causa:** RLS está bloqueando la operación
- **Solución:** Deshabilitar RLS temporalmente o ajustar políticas

### Error: "relation does not exist"
- **Causa:** Las tablas no se crearon
- **Solución:** Ejecutar `supabase-schema.sql` nuevamente

### Error: "Failed to fetch" o "Network error"
- **Causa:** Variables de entorno no configuradas o incorrectas
- **Solución:** Verificar `.env.local` y reiniciar el servidor

### No se muestran proyectos
- **Causa:** `contractorId` no está en localStorage
- **Solución:** Hacer login nuevamente o verificar que el registro guardó el ID
