-- AlterTable
ALTER TABLE "ResumePersonalInfo" ADD COLUMN     "imageSide" TEXT NOT NULL DEFAULT 'left';

-- AlterTable
ALTER TABLE "ResumeTheme" ADD COLUMN     "showSectionIcons" BOOLEAN NOT NULL DEFAULT false;
