-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "premise" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "blockNum" INTEGER NOT NULL,
    "chunkStart" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryChunk" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,

    CONSTRAINT "StoryChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Block_storyId_blockNum_idx" ON "Block"("storyId", "blockNum");

-- CreateIndex
CREATE INDEX "StoryChunk_storyId_idx" ON "StoryChunk"("storyId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryChunk" ADD CONSTRAINT "StoryChunk_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
