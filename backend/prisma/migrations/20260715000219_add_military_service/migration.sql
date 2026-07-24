-- AlterTable
ALTER TABLE "ResumePersonalInfo" ADD COLUMN     "fvMilitaryService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "militaryService" TEXT NOT NULL DEFAULT '';
