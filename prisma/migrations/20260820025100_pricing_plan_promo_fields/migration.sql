-- AlterTable
ALTER TABLE "pricing_plans" ADD COLUMN     "originalPrice" DECIMAL(12,2),
ADD COLUMN     "discountAmount" DECIMAL(12,2),
ADD COLUMN     "ctaLabel" JSONB;

-- AlterTable
ALTER TABLE "pricing_plans" ALTER COLUMN "currency" SET DEFAULT 'DH';
