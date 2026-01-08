# Cómo Agregar Administradores

## Método 1: Usando SQL (Recomendado)

### Paso 1: Ir al SQL Editor de Supabase
1. Abre tu proyecto en [Supabase](https://supabase.com/)
2. Ve a **SQL Editor** en el menú lateral
3. Haz clic en **"New query"**

### Paso 2: Ejecutar el Script
Copia y pega este SQL (ajusta el email y nombre):

```sql
-- Agregar un administrador
INSERT INTO admin_users (email, name)
VALUES ('tu-email@ejemplo.com', 'Tu Nombre')
ON CONFLICT (email) DO NOTHING;
```

O ejecuta el archivo completo `supabase-add-admin.sql` que incluye ejemplos.

### Paso 3: Verificar
Ejecuta esta consulta para ver todos los admins:

```sql
SELECT * FROM admin_users ORDER BY created_at DESC;
```

## Método 2: Usando la Interfaz de Supabase

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla `admin_users`
3. Haz clic en **"Insert row"** o **"+"**
4. Completa los campos:
   - **email**: El correo del administrador
   - **name**: El nombre del administrador
5. Haz clic en **"Save"**

## Cómo Iniciar Sesión como Admin

1. Ve a `/admin/login` en tu aplicación
2. Ingresa el **email** del administrador que agregaste
3. Ingresa cualquier contraseña (actualmente no se valida, solo se verifica que el email exista)
4. Haz clic en **"Entrar"**

## Notas Importantes

- **Email único**: Cada email solo puede estar registrado una vez
- **Sin validación de contraseña**: Actualmente el sistema solo verifica que el email exista en la tabla `admin_users`. Para producción, deberías implementar autenticación adecuada.
- **Seguridad**: En producción, implementa:
  - Validación de contraseña (hash con bcrypt)
  - Tokens JWT para sesiones
  - O usa Supabase Auth

## Ejemplos de Admins

```sql
-- Admin principal
INSERT INTO admin_users (email, name)
VALUES ('admin@pintacomex.mx', 'Administrador Principal');

-- Manuel Villaseñor
INSERT INTO admin_users (email, name)
VALUES ('manuelv@pintacomex.mx', 'Manuel Villaseñor');
```

## Eliminar un Admin

```sql
DELETE FROM admin_users WHERE email = 'admin@example.com';
```

## Ver Todos los Admins

```sql
SELECT id, email, name, created_at 
FROM admin_users 
ORDER BY created_at DESC;
```
