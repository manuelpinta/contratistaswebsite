# Sistema de Multi-País

Este documento explica cómo funciona el sistema de múltiples países implementado en la aplicación.

## Países Soportados

- **México (MX)**: Con ciudades específicas (Coatzacoalcos, Minatitlán, Aguascalientes, Guerrero, Lázaro Cárdenas, CDMX)
- **Honduras (HN)**: Todo el país
- **El Salvador (SV)**: Todo el país
- **Belize (BZ)**: Todo el país

## Características por País

### México
- **RFC requerido**: Sí (formato: ABC123456DEF)
- **Teléfono**: 10 dígitos
- **Ciudad**: Requerida (selección de lista)
- **Identificador fiscal**: RFC (obligatorio)

### Honduras, El Salvador, Belize
- **Identificador fiscal**: Opcional (RTN para HN, NIT para SV, Tax ID para BZ)
- **Teléfono**: 8 dígitos (HN, SV) o 7 dígitos (BZ)
- **Ciudad**: No requerida

## Funcionamiento

### 1. Selección de País

Cuando un usuario visita la aplicación por primera vez o intenta registrarse:

1. **Detección automática**: El sistema intenta detectar el país desde:
   - Zona horaria del navegador
   - Idioma del navegador
   
2. **Selección manual**: Si no se puede detectar o el usuario quiere cambiar, se muestra un selector de país

3. **Almacenamiento**: El país seleccionado se guarda en `localStorage` como `selectedCountry`

### 2. Formulario de Registro Dinámico

El formulario de registro se adapta según el país seleccionado:

- **Campos siempre presentes**:
  - Nombre completo
  - Correo electrónico
  - Teléfono (formato y validación según país)
  - Contraseña

- **Campos condicionales**:
  - **RFC/Tax ID**: 
    - México: Requerido, formato RFC
    - Otros países: Opcional
  - **Ciudad**: 
    - México: Requerida, selector de ciudades
    - Otros países: No se muestra

### 3. Base de Datos

#### Tabla `contractors`
- `country_code`: Código del país (MX, HN, SV, BZ)
- `city_code`: Código de la ciudad (solo para México)
- `tax_id`: Identificador fiscal (RFC para México, opcional para otros)

#### Tabla `admin_users`
- `country_code`: País que el admin puede gestionar
- `city_code`: Ciudad que el admin puede gestionar (solo para México)

### 4. Filtrado de Proyectos

Los administradores solo ven proyectos de su país/ciudad asignado:

1. Al iniciar sesión, se guarda el `country_code` y `city_code` del admin en `localStorage`
2. Al cargar proyectos, se filtran automáticamente por estos valores
3. Si un admin no tiene país asignado, verá todos los proyectos (comportamiento legacy)

## Migración de Base de Datos

Ejecuta el script SQL `supabase-migration-add-countries.sql` en tu base de datos Supabase:

```sql
-- Este script:
-- 1. Agrega campos country_code, city_code, tax_id a contractors
-- 2. Agrega campos country_code, city_code a admin_users
-- 3. Migra datos de rfc a tax_id (mantiene compatibilidad)
-- 4. Crea índices para mejorar consultas
-- 5. Agrega restricciones CHECK para validar códigos
```

## Configuración de Admins

Para agregar un admin con país/ciudad específico, usa la función actualizada:

```typescript
import { createAdmin } from '@/lib/supabase/admin'

// Admin para México - CDMX
await createAdmin(
  'admin.cdmx@example.com',
  'Admin CDMX',
  'MX',
  'MX_CDMX'
)

// Admin para Honduras (todo el país)
await createAdmin(
  'admin.hn@example.com',
  'Admin Honduras',
  'HN',
  null
)
```

## Archivos Clave

- `lib/countries.ts`: Configuración de países y validaciones
- `components/country-selector.tsx`: Componente de selección de país
- `components/contractor/register-form.tsx`: Formulario dinámico de registro
- `lib/supabase/types.ts`: Tipos TypeScript actualizados
- `lib/supabase/projects.ts`: Funciones de filtrado por país
- `hooks/use-all-projects.ts`: Hook que filtra proyectos por país del admin

## Próximos Pasos

1. **Ejecutar migración SQL**: Aplicar `supabase-migration-add-countries.sql` en Supabase
2. **Actualizar admins existentes**: Asignar `country_code` y `city_code` a los admins actuales
3. **Migrar datos existentes**: Si hay contratistas existentes, asignarles un país
4. **Probar flujo completo**: 
   - Registro desde diferentes países
   - Login de admin y verificación de filtrado
   - Validación de campos según país

## Notas

- El campo `rfc` se mantiene en la base de datos para compatibilidad, pero se recomienda usar `tax_id`
- Si un usuario no selecciona país, se usa México como default
- Los admins sin país asignado verán todos los proyectos (comportamiento legacy)

