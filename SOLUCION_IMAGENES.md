# Solución: Las Imágenes No Se Muestran

## Pasos para Diagnosticar

### 1. Verificar que el bucket existe
1. Ve a **Storage** en Supabase
2. Verifica que existe un bucket llamado `project-images`
3. Si no existe, créalo:
   - Haz clic en "New bucket"
   - Nombre: `project-images`
   - Configura como **Public** (para URLs públicas) o **Private** (requiere URLs firmadas)

### 2. Verificar que las imágenes se guardaron en la base de datos
Ejecuta esta consulta en el SQL Editor de Supabase:

```sql
SELECT * FROM project_images 
WHERE project_id = 'TU_PROJECT_ID_AQUI'
ORDER BY image_order;
```

Reemplaza `TU_PROJECT_ID_AQUI` con el ID de tu proyecto.

### 3. Verificar las URLs de las imágenes
Si las imágenes están en la base de datos, verifica las URLs:

```sql
SELECT id, project_id, image_url, image_order 
FROM project_images 
WHERE project_id = 'TU_PROJECT_ID_AQUI';
```

Las URLs deberían verse así:
```
https://TU_PROYECTO.supabase.co/storage/v1/object/public/project-images/...
```

### 4. Verificar políticas de Storage
Si el bucket es **privado**, necesitas políticas RLS o usar URLs firmadas.

Ejecuta en SQL Editor:

```sql
-- Ver políticas actuales de storage
SELECT * FROM storage.policies 
WHERE bucket_id = 'project-images';
```

### 5. Revisar la consola del navegador
1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Busca mensajes que empiecen con:
   - "Loading images for project:"
   - "Project images from DB:"
   - "Image URLs:"
   - "Error loading image:"

## Soluciones Comunes

### Problema: El bucket no existe
**Solución:** Crea el bucket `project-images` en Storage

### Problema: El bucket es privado y no hay políticas
**Solución:** 
- Opción 1: Cambia el bucket a **Public**
- Opción 2: Ejecuta las políticas de storage (ver `supabase-storage-policies.sql`)

### Problema: Las imágenes no se están guardando en la tabla
**Solución:** 
- Verifica que la tabla `project_images` existe
- Verifica que RLS está deshabilitado temporalmente (o que las políticas permiten INSERT)
- Revisa los logs en la consola cuando creas un proyecto

### Problema: Las URLs no funcionan
**Solución:**
- Si el bucket es privado, necesitas usar URLs firmadas
- Verifica que la URL tenga el formato correcto
- Prueba abrir la URL directamente en el navegador

## Código Mejorado

El código ahora incluye:
- ✅ Logs detallados en consola
- ✅ Manejo de errores mejorado
- ✅ Mensaje cuando no hay imágenes
- ✅ Fallback a placeholder si la imagen falla al cargar

## Próximos Pasos

1. Abre la consola del navegador (F12)
2. Recarga la página del proyecto
3. Revisa los mensajes en la consola
4. Comparte los mensajes de error si los hay
