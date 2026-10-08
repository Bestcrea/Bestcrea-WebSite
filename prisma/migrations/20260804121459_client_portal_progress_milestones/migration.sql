-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "milestones" JSONB,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;
