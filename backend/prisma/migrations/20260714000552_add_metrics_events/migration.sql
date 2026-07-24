-- CreateTable
CREATE TABLE "VisitEvent" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "VisitEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "resumeId" TEXT,
    "source" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitEvent_date_idx" ON "VisitEvent"("date");

-- CreateIndex
CREATE UNIQUE INDEX "VisitEvent_visitorId_date_key" ON "VisitEvent"("visitorId", "date");

-- CreateIndex
CREATE INDEX "DownloadEvent_date_idx" ON "DownloadEvent"("date");
