-- AlterTable
ALTER TABLE "DownloadEvent" ADD COLUMN     "backgroundPattern" TEXT,
ADD COLUMN     "fontId" TEXT,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "themeId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "occupation" TEXT;

-- CreateTable
CREATE TABLE "SelectionEvent" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelectionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SelectionEvent_kind_date_idx" ON "SelectionEvent"("kind", "date");
