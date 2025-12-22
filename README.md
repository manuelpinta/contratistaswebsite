# Contestants Website Design

Proyecto web desarrollado con Next.js, TypeScript y Tailwind CSS.

## Requisitos Previos

- **Node.js** (versión 18 o superior)
- **pnpm** (gestor de paquetes)
- **Google Maps API Key** (opcional, para funcionalidad de mapas en registro de proyectos)

### Instalación de pnpm

Si no tienes pnpm instalado, puedes instalarlo con:

```bash
npm install -g pnpm
```

O usando otros métodos según tu sistema operativo:
- **Windows (PowerShell)**: `iwr https://get.pnpm.io/install.ps1 -useb | iex`
- **macOS/Linux**: `curl -fsSL https://get.pnpm.io/install.sh | sh -`

## Instalación

1. Clona o descarga este repositorio
2. Abre una terminal en la carpeta del proyecto
3. Instala las dependencias:

```bash
pnpm install
```

4. Configura las variables de entorno (opcional):

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

**Nota:** La API key de Google Maps es opcional. Si no se configura, el campo de ubicación funcionará como un campo de texto normal. Para obtener una API key:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de "Places API" y "Maps JavaScript API"
4. Crea credenciales (API Key)
5. Restringe la API key a tu dominio en producción

## Ejecución Local

Para ejecutar el proyecto en modo desarrollo:

```bash
pnpm dev
```

El proyecto estará disponible en: **http://localhost:3000**

Abre tu navegador y visita esa URL para ver la aplicación.

## Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm start` - Inicia el servidor de producción (después de hacer build)
- `pnpm lint` - Ejecuta el linter para verificar el código

## Estructura del Proyecto

- `/app` - Páginas y rutas de la aplicación (App Router de Next.js)
- `/components` - Componentes reutilizables de React
- `/lib` - Utilidades y funciones auxiliares
- `/public` - Archivos estáticos (imágenes, iconos, etc.)
- `/styles` - Estilos globales

## Tecnologías Utilizadas

- **Next.js 16** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Radix UI** - Componentes de UI accesibles
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

## Notas

- El proyecto está configurado para ignorar errores de TypeScript durante el build
- Las imágenes están configuradas como no optimizadas para desarrollo local

