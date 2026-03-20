-- AlterTable
ALTER TABLE "PomodoroSession" ADD COLUMN     "deepWorkSessionId" TEXT;

-- CreateTable
CREATE TABLE "DeepWorkSession" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "interruptions" INTEGER NOT NULL DEFAULT 0,
    "taskId" TEXT,
    "projectId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeepWorkSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeepWorkSession_userId_startTime_idx" ON "DeepWorkSession"("userId", "startTime");

-- CreateIndex
CREATE INDEX "DeepWorkSession_taskId_idx" ON "DeepWorkSession"("taskId");

-- CreateIndex
CREATE INDEX "DeepWorkSession_projectId_idx" ON "DeepWorkSession"("projectId");

-- CreateIndex
CREATE INDEX "PomodoroSession_deepWorkSessionId_idx" ON "PomodoroSession"("deepWorkSessionId");

-- AddForeignKey
ALTER TABLE "PomodoroSession" ADD CONSTRAINT "PomodoroSession_deepWorkSessionId_fkey" FOREIGN KEY ("deepWorkSessionId") REFERENCES "DeepWorkSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeepWorkSession" ADD CONSTRAINT "DeepWorkSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeepWorkSession" ADD CONSTRAINT "DeepWorkSession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeepWorkSession" ADD CONSTRAINT "DeepWorkSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
