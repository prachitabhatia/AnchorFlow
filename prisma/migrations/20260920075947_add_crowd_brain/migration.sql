-- CreateTable
CREATE TABLE "CrowdBrainResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "agendaItemId" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrowdBrainResponse_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrowdBrainResponse_agendaItemId_fkey" FOREIGN KEY ("agendaItemId") REFERENCES "AgendaItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrowdBrainInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "agendaItemId" TEXT NOT NULL,
    "moodLabel" TEXT NOT NULL,
    "insightText" TEXT NOT NULL,
    "recommendationText" TEXT NOT NULL,
    "suggestedLine" TEXT NOT NULL,
    "totalResponsesAtCompute" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CrowdBrainInsight_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrowdBrainInsight_agendaItemId_fkey" FOREIGN KEY ("agendaItemId") REFERENCES "AgendaItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CrowdBrainResponse_eventId_agendaItemId_createdAt_idx" ON "CrowdBrainResponse"("eventId", "agendaItemId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrowdBrainInsight_agendaItemId_key" ON "CrowdBrainInsight"("agendaItemId");
