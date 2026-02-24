/*
  Warnings:

  - You are about to drop the `_BookToCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `books` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_BookToCategory_B_index";

-- DropIndex
DROP INDEX "_BookToCategory_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_BookToCategory";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_books" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pages" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "books_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "books_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_books" ("authorId", "description", "id", "pages", "status", "title", "year") SELECT "authorId", "description", "id", "pages", "status", "title", "year" FROM "books";
DROP TABLE "books";
ALTER TABLE "new_books" RENAME TO "books";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
