-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_loans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "loans_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_loans" ("bookId", "dueDate", "id", "loanDate", "returnDate", "userId") SELECT "bookId", "dueDate", "id", "loanDate", "returnDate", "userId" FROM "loans";
DROP TABLE "loans";
ALTER TABLE "new_loans" RENAME TO "loans";
CREATE TABLE "new_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "bookId" TEXT,
    "authorId" TEXT,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("authorId", "bookId", "comment", "createdAt", "id", "stars", "userId") SELECT "authorId", "bookId", "comment", "createdAt", "id", "stars", "userId" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
