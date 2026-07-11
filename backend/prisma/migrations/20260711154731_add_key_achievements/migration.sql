-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "achievementShowDescription" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "achievementShowIcons" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Achievement_resumeId_idx" ON "Achievement"("resumeId");

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
