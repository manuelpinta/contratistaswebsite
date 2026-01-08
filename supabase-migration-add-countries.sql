-- Migración: Agregar campos de país y ciudad a las tablas

-- 1. Agregar campos a la tabla contractors
ALTER TABLE contractors 
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS city_code TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT;

-- Renombrar rfc a tax_id si existe (para mantener compatibilidad)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contractors' AND column_name = 'rfc'
  ) THEN
    -- Si rfc existe y tax_id está vacío, copiar los valores
    UPDATE contractors 
    SET tax_id = rfc 
    WHERE tax_id IS NULL AND rfc IS NOT NULL;
    
    -- Opcional: eliminar la columna rfc después de migrar
    -- ALTER TABLE contractors DROP COLUMN rfc;
  END IF;
END $$;

-- 2. Agregar campos a la tabla admin_users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS city_code TEXT;

-- 3. Agregar índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_contractors_country_code ON contractors(country_code);
CREATE INDEX IF NOT EXISTS idx_contractors_city_code ON contractors(city_code);
CREATE INDEX IF NOT EXISTS idx_admin_users_country_code ON admin_users(country_code);

-- 4. Agregar restricciones CHECK para validar códigos de país
DO $$
BEGIN
  -- Agregar constraint a contractors si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_country_code'
  ) THEN
    ALTER TABLE contractors 
    ADD CONSTRAINT check_country_code 
    CHECK (country_code IS NULL OR country_code IN ('MX', 'HN', 'SV', 'BZ'));
  END IF;

  -- Agregar constraint a admin_users si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_admin_country_code'
  ) THEN
    ALTER TABLE admin_users 
    ADD CONSTRAINT check_admin_country_code 
    CHECK (country_code IS NULL OR country_code IN ('MX', 'HN', 'SV', 'BZ'));
  END IF;
END $$;

-- 5. Comentarios para documentación
COMMENT ON COLUMN contractors.country_code IS 'Código del país: MX, HN, SV, BZ';
COMMENT ON COLUMN contractors.city_code IS 'Código de la ciudad (solo para México)';
COMMENT ON COLUMN contractors.tax_id IS 'Identificador fiscal (RFC para México, opcional para otros países)';
COMMENT ON COLUMN admin_users.country_code IS 'Código del país que el admin puede gestionar';
COMMENT ON COLUMN admin_users.city_code IS 'Código de la ciudad que el admin puede gestionar (solo para México)';

