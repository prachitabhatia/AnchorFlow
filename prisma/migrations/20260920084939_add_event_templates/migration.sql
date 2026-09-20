-- AlterTable
ALTER TABLE "Event" ADD COLUMN "sourceTemplateId" TEXT;

-- CreateTable
CREATE TABLE "EventTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TemplateAgendaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isBuffer" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TemplateAgendaItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EventTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TemplateAgendaItem_templateId_orderIndex_idx" ON "TemplateAgendaItem"("templateId", "orderIndex");
