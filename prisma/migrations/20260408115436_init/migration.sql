-- CreateTable
CREATE TABLE "Archive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "bv" TEXT,
    "isTranslated" INTEGER NOT NULL DEFAULT -1,
    "fullVersionId" INTEGER,
    "eventId" INTEGER,
    "seriesVol" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Archive_fullVersionId_fkey" FOREIGN KEY ("fullVersionId") REFERENCES "Archive" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Archive_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "typeId" INTEGER,
    "date" DATETIME,
    "isVirtual" BOOLEAN NOT NULL,
    "seriesId" INTEGER,
    CONSTRAINT "Event_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "SeriesType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeriesType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Series" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "seriesTypeId" INTEGER,
    CONSTRAINT "Series_seriesTypeId_fkey" FOREIGN KEY ("seriesTypeId") REFERENCES "SeriesType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SeriesType_name_key" ON "SeriesType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Series_title_key" ON "Series"("title");
