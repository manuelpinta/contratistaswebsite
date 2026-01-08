-- Script para DESHABILITAR RLS temporalmente
-- Úsalo solo para desarrollo/testing
-- ⚠️ NO usar en producción sin políticas adecuadas

-- Deshabilitar RLS en todas las tablas
ALTER TABLE contractors DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Si también necesitas deshabilitar RLS en Storage:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Para volver a habilitar RLS más tarde:
-- ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
