-- Sync requests table to current Prisma schema.
-- This migration is written to be safe for environments that may have
-- already applied equivalent changes via `prisma db push`.

ALTER TABLE "requests"
  ADD COLUMN IF NOT EXISTS "normalized_title" TEXT,
  ADD COLUMN IF NOT EXISTS "tmdb_url" TEXT,
  ADD COLUMN IF NOT EXISTS "progress_token" TEXT,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "requests"
  ALTER COLUMN "contact" DROP NOT NULL;

-- Keep progress token unique when data allows.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'requests_progress_token_key'
  ) THEN
    IF NOT EXISTS (
      SELECT progress_token
      FROM "requests"
      WHERE progress_token IS NOT NULL
      GROUP BY progress_token
      HAVING COUNT(*) > 1
    ) THEN
      CREATE UNIQUE INDEX "requests_progress_token_key" ON "requests"("progress_token");
    END IF;
  END IF;
END $$;

-- Keep request deduplication unique constraint when data allows.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'requests_type_normalized_title_key'
  ) THEN
    IF NOT EXISTS (
      SELECT "type", normalized_title
      FROM "requests"
      WHERE normalized_title IS NOT NULL
      GROUP BY "type", normalized_title
      HAVING COUNT(*) > 1
    ) THEN
      CREATE UNIQUE INDEX "requests_type_normalized_title_key" ON "requests"("type", "normalized_title");
    END IF;
  END IF;
END $$;
