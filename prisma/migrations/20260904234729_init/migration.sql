-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'employee');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "accessCodeHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'employee',
    "isSetupCompleted" BOOLEAN NOT NULL DEFAULT false,
    "warehouse" TEXT NOT NULL DEFAULT '',
    "position" TEXT NOT NULL DEFAULT '',
    "schedule" TEXT NOT NULL DEFAULT '',
    "hireDate" TEXT NOT NULL DEFAULT '',
    "firstShiftDate" TEXT NOT NULL DEFAULT '',
    "firstShiftType" TEXT NOT NULL DEFAULT '',
    "secondShiftDate" TEXT NOT NULL DEFAULT '',
    "secondShiftType" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleChange" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL,
    "schedule" TEXT NOT NULL,
    "firstShiftDate" TEXT,
    "firstShiftType" TEXT,
    "secondShiftDate" TEXT,
    "secondShiftType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "workType" TEXT,
    "status" TEXT,
    "workZone" TEXT,
    "salaryHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "baseHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tobaccoHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "boxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "blocks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nonProfileHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mentor" BOOLEAN NOT NULL DEFAULT false,
    "transitionDistribution" JSONB,
    "isWorked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OriginalMainShift" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "OriginalMainShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goalMonthKey" TEXT,

    CONSTRAINT "FinanceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deduction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,

    CONSTRAINT "Deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Premium" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,

    CONSTRAINT "Premium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DismissedNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,

    CONSTRAINT "DismissedNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE INDEX "ScheduleChange_userId_changeDate_idx" ON "ScheduleChange"("userId", "changeDate");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_userId_date_key" ON "Shift"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "OriginalMainShift_userId_monthKey_key" ON "OriginalMainShift"("userId", "monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceSettings_userId_key" ON "FinanceSettings"("userId");

-- CreateIndex
CREATE INDEX "Payment_userId_monthKey_idx" ON "Payment"("userId", "monthKey");

-- CreateIndex
CREATE INDEX "Deduction_userId_monthKey_idx" ON "Deduction"("userId", "monthKey");

-- CreateIndex
CREATE INDEX "Premium_userId_monthKey_idx" ON "Premium"("userId", "monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "DismissedNotification_userId_notificationId_key" ON "DismissedNotification"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "ScheduleChange" ADD CONSTRAINT "ScheduleChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OriginalMainShift" ADD CONSTRAINT "OriginalMainShift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceSettings" ADD CONSTRAINT "FinanceSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Premium" ADD CONSTRAINT "Premium_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DismissedNotification" ADD CONSTRAINT "DismissedNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
