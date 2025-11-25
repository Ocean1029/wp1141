-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'PLAYING', 'FINISHED', 'ABORTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MERLIN', 'PERCIVAL', 'SERVANT', 'MORGANA', 'ASSASSIN', 'MINION', 'OBERON', 'MORDRED');

-- CreateEnum
CREATE TYPE "TeamVote" AS ENUM ('APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "MissionResult" AS ENUM ('SUCCESS', 'FAIL');

-- CreateEnum
CREATE TYPE "Winner" AS ENUM ('GOOD', 'EVIL');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('USER', 'BOT', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "pictureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "wonGames" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "lineGroupId" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "winner" "Winner",
    "playerCount" INTEGER NOT NULL DEFAULT 0,
    "questConfig" INTEGER[],
    "activeRoles" "Role"[],
    "currentLeaderIndex" INTEGER NOT NULL DEFAULT 0,
    "assassinTargetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "role" "Role",
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "hasLadyOfLake" BOOLEAN NOT NULL DEFAULT false,
    "wasInvestigatedBy" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "requiredPlayers" INTEGER NOT NULL,
    "isSuccess" BOOLEAN,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamProposal" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "proposerId" TEXT NOT NULL,
    "proposedTeam" TEXT[],
    "isApproved" BOOLEAN,

    CONSTRAINT "TeamProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "decision" "TeamVote" NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionAction" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "result" "MissionResult" NOT NULL,

    CONSTRAINT "MissionAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "lineUserId" TEXT,
    "sender" "MessageSender" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_lineId_key" ON "User"("lineId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_userId_gameId_key" ON "Player"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_gameId_roundNumber_key" ON "Round"("gameId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_proposalId_playerId_key" ON "Vote"("proposalId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionAction_proposalId_playerId_key" ON "MissionAction"("proposalId", "playerId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProposal" ADD CONSTRAINT "TeamProposal_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProposal" ADD CONSTRAINT "TeamProposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "TeamProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAction" ADD CONSTRAINT "MissionAction_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "TeamProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAction" ADD CONSTRAINT "MissionAction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_lineUserId_fkey" FOREIGN KEY ("lineUserId") REFERENCES "User"("lineId") ON DELETE SET NULL ON UPDATE CASCADE;
