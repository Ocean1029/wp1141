-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "maxPlayers" INTEGER NOT NULL DEFAULT 6,
ALTER COLUMN "lineGroupId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "gameId" TEXT,
ADD COLUMN     "tokens" INTEGER;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "isReady" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isLearningRules" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
