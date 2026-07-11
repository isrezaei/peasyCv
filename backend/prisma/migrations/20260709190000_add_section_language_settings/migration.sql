-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "languageMeterVariant" TEXT NOT NULL DEFAULT 'bars',
ADD COLUMN     "languageShowMeter" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "languageShowLevelText" BOOLEAN NOT NULL DEFAULT true;
