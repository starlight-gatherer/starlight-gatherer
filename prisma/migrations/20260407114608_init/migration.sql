-- CreateTable
CREATE TABLE "Archive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "bv" TEXT,
    "isTranslated" INTEGER NOT NULL DEFAULT -1,
    "fullVersionId" TEXT,
    "seriesId" INTEGER,
    "seriesVol" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Archive_fullVersionId_fkey" FOREIGN KEY ("fullVersionId") REFERENCES "Archive" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Archive_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Series" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Series_title_key" ON "Series"("title");
