/*
  Warnings:

  - The primary key for the `places` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "event_places" DROP CONSTRAINT "event_places_place_id_fkey";

-- DropForeignKey
ALTER TABLE "place_tags" DROP CONSTRAINT "place_tags_place_id_fkey";

-- AlterTable
ALTER TABLE "event_places" ALTER COLUMN "place_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "place_tags" ALTER COLUMN "place_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "places" DROP CONSTRAINT "places_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "places_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_places" ADD CONSTRAINT "event_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
