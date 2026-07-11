-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "showMonth" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "monthFormat" TEXT NOT NULL DEFAULT 'name';

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "link" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "linkVisible" BOOLEAN NOT NULL DEFAULT true;
