CREATE TABLE "WatchMotivationGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "goal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchMotivationGoal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WatchMotivationGoal_userId_idx"
ON "WatchMotivationGoal"("userId");

CREATE UNIQUE INDEX "WatchMotivationGoal_userId_startDate_endDate_key"
ON "WatchMotivationGoal"("userId", "startDate", "endDate");

ALTER TABLE "WatchMotivationGoal"
ADD CONSTRAINT "WatchMotivationGoal_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;