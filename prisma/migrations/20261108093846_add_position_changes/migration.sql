-- CreateTable
CREATE TABLE "PositionChange" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL,
    "position" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "firstShiftDate" TEXT,
    "firstShiftType" TEXT,
    "secondShiftDate" TEXT,
    "secondShiftType" TEXT,
    "keepsSchedule" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PositionChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PositionChange_userId_changeDate_idx" ON "PositionChange"("userId", "changeDate");

-- AddForeignKey
ALTER TABLE "PositionChange" ADD CONSTRAINT "PositionChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
