-- DropForeignKey
ALTER TABLE "place_tags" DROP CONSTRAINT "place_tags_tag_id_fkey";

-- DropIndex
DROP INDEX "place_tags_place_id_tag_id_key";

-- DropIndex
DROP INDEX "place_tags_tag_id_idx";

-- DropIndex
DROP INDEX "tags_created_by_idx";

-- DropIndex
DROP INDEX "tags_created_by_name_key";

-- AlterTable
ALTER TABLE "place_tags" DROP COLUMN "tag_id",
ADD COLUMN "tag_created_by" UUID NOT NULL,
ADD COLUMN "tag_name" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "tags" DROP CONSTRAINT "tags_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("created_by", "name");

-- CreateIndex
CREATE INDEX "place_tags_tag_created_by_tag_name_idx" ON "place_tags"("tag_created_by", "tag_name");

-- CreateIndex
CREATE UNIQUE INDEX "place_tags_place_id_tag_created_by_tag_name_key" ON "place_tags"("place_id", "tag_created_by", "tag_name");

-- AddForeignKey
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_tag_created_by_tag_name_fkey" FOREIGN KEY ("tag_created_by", "tag_name") REFERENCES "tags"("created_by", "name") ON DELETE CASCADE ON UPDATE CASCADE;

