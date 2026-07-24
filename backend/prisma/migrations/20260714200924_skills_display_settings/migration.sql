-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "skillDisplayMode" TEXT NOT NULL DEFAULT 'row',
ADD COLUMN     "skillMeterVariant" TEXT NOT NULL DEFAULT 'line',
ADD COLUMN     "skillShowLevel" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "SkillGroup" ADD COLUMN     "showTitle" BOOLEAN NOT NULL DEFAULT true;
