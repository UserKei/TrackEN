/*
  Warnings:

  - You are about to drop the column `isTimeTask` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `timeTaskTime` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isTimeTask",
DROP COLUMN "timeTaskTime",
ADD COLUMN     "isTimingTask" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timingTaskTime" TEXT NOT NULL DEFAULT '00:00:00';
