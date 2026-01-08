-- Script para agregar usuarios administradores
-- Ejecuta este archivo en el SQL Editor de Supabase

-- IMPORTANTE: Después de agregar un admin, usa su EMAIL para iniciar sesión
-- La contraseña no se valida actualmente (solo se verifica que el email exista)

-- Agregar un administrador
INSERT INTO admin_users (email, name)
VALUES ('admin@example.com', 'Administrador Principal')
ON CONFLICT (email) DO NOTHING;

-- Agregar múltiples administradores
INSERT INTO admin_users (email, name)
VALUES 
  ('admin1@example.com', 'Admin 1'),
  ('admin2@example.com', 'Admin 2'),
  ('manuelv@pintacomex.mx', 'Manuel Villaseñor')
ON CONFLICT (email) DO NOTHING;

-- Ver todos los administradores
SELECT * FROM admin_users ORDER BY created_at DESC;

-- Agregar un administrador específico (cambia el email y nombre)
-- INSERT INTO admin_users (email, name)
-- VALUES ('tu-email@ejemplo.com', 'Tu Nombre')
-- ON CONFLICT (email) DO NOTHING;

-- Eliminar un administrador (si es necesario)
-- DELETE FROM admin_users WHERE email = 'admin@example.com';

-- Actualizar el nombre de un administrador
-- UPDATE admin_users 
-- SET name = 'Nuevo Nombre' 
-- WHERE email = 'admin@example.com';
