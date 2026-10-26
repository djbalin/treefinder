import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_species_good_for_tags" AS ENUM('spoons', 'bowls', 'kuksa', 'figures', 'handles', 'spatulas', 'boxes');
  CREATE TYPE "public"."enum_species_filter_traits_leaf_type" AS ENUM('needles', 'scales', 'broad');
  CREATE TYPE "public"."enum_species_filter_traits_arrangement" AS ENUM('opposite', 'alternate');
  CREATE TYPE "public"."enum_species_filter_traits_leaf_shape" AS ENUM('simple', 'lobed', 'pinnate', 'palmate');
  CREATE TYPE "public"."enum_species_filter_traits_leaf_edge" AS ENUM('smooth', 'toothed', 'doubleToothed', 'spiny');
  CREATE TYPE "public"."enum_species_filter_traits_bark" AS ENUM('smooth', 'peeling', 'furrowed', 'banded');
  CREATE TYPE "public"."enum_species_filter_traits_thorns" AS ENUM('yes', 'no');
  CREATE TYPE "public"."enum_species_sources_field" AS ENUM('general', 'carving', 'hardness', 'grainTexture', 'colourSmell', 'goodFor', 'riving', 'drying', 'foodSafety', 'identification');
  CREATE TYPE "public"."enum_species_status" AS ENUM('aiDraft', 'needsChanges', 'approved', 'published');
  CREATE TYPE "public"."enum_species_launch_wave" AS ENUM('launch', '2');
  CREATE TYPE "public"."enum_species_green_carving" AS ENUM('easy', 'medium', 'hard');
  CREATE TYPE "public"."enum_species_dry_hardness" AS ENUM('soft', 'medium', 'hard');
  CREATE TYPE "public"."enum__species_v_version_good_for_tags" AS ENUM('spoons', 'bowls', 'kuksa', 'figures', 'handles', 'spatulas', 'boxes');
  CREATE TYPE "public"."enum__species_v_version_filter_traits_leaf_type" AS ENUM('needles', 'scales', 'broad');
  CREATE TYPE "public"."enum__species_v_version_filter_traits_arrangement" AS ENUM('opposite', 'alternate');
  CREATE TYPE "public"."enum__species_v_version_filter_traits_leaf_shape" AS ENUM('simple', 'lobed', 'pinnate', 'palmate');
  CREATE TYPE "public"."enum__species_v_version_filter_traits_leaf_edge" AS ENUM('smooth', 'toothed', 'doubleToothed', 'spiny');
  CREATE TYPE "public"."enum__species_v_version_filter_traits_bark" AS ENUM('smooth', 'peeling', 'furrowed', 'banded');
  CREATE TYPE "public"."enum__species_v_version_filter_traits_thorns" AS ENUM('yes', 'no');
  CREATE TYPE "public"."enum__species_v_version_sources_field" AS ENUM('general', 'carving', 'hardness', 'grainTexture', 'colourSmell', 'goodFor', 'riving', 'drying', 'foodSafety', 'identification');
  CREATE TYPE "public"."enum__species_v_version_status" AS ENUM('aiDraft', 'needsChanges', 'approved', 'published');
  CREATE TYPE "public"."enum__species_v_version_launch_wave" AS ENUM('launch', '2');
  CREATE TYPE "public"."enum__species_v_version_green_carving" AS ENUM('easy', 'medium', 'hard');
  CREATE TYPE "public"."enum__species_v_version_dry_hardness" AS ENUM('soft', 'medium', 'hard');
  CREATE TYPE "public"."enum_photos_status" AS ENUM('candidate', 'selected', 'rejected');
  CREATE TYPE "public"."enum_photos_slot" AS ENUM('wholeTree', 'leaf', 'bark', 'winterTwig', 'cutWood');
  CREATE TYPE "public"."enum_photos_source" AS ENUM('commons', 'inaturalist', 'upload');
  CREATE TYPE "public"."enum_photos_license" AS ENUM('CC0-1.0', 'CC-BY-2.0', 'CC-BY-2.5', 'CC-BY-3.0', 'CC-BY-4.0', 'CC-BY-SA-2.0', 'CC-BY-SA-2.5', 'CC-BY-SA-3.0', 'CC-BY-SA-4.0', 'own');
  CREATE TABLE "species_good_for_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_species_good_for_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "species_filter_traits_leaf_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_species_filter_traits_leaf_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "species_filter_traits_arrangement" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_species_filter_traits_arrangement",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "species_filter_traits_leaf_shape" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_species_filter_traits_leaf_shape",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "species_filter_traits_leaf_edge" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_species_filter_traits_leaf_edge",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "species_filter_traits_bark" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_species_filter_traits_bark",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "species_filter_traits_thorns" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_species_filter_traits_thorns",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "species_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"field" "enum_species_sources_field" DEFAULT 'general' NOT NULL
  );
  
  CREATE TABLE "species" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"latin_name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_species_status" DEFAULT 'aiDraft' NOT NULL,
  	"launch_wave" "enum_species_launch_wave" DEFAULT '2',
  	"review_notes" varchar,
  	"is_warning" boolean,
  	"green_carving" "enum_species_green_carving",
  	"dry_hardness" "enum_species_dry_hardness",
  	"janka_n" numeric,
  	"food_safety_checked" boolean,
  	"food_safety_checked_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "species_locales" (
  	"name" varchar NOT NULL,
  	"warning_reason" varchar,
  	"grain_texture" jsonb,
  	"colour_smell" jsonb,
  	"good_for" jsonb,
  	"riving" jsonb,
  	"drying" jsonb,
  	"food_safety" jsonb,
  	"id_features_leaf" jsonb,
  	"id_features_bark" jsonb,
  	"id_features_twig" jsonb,
  	"id_features_shape" jsonb,
  	"id_features_cut_wood" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "species_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "species_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"species_id" integer
  );
  
  CREATE TABLE "_species_v_version_good_for_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__species_v_version_good_for_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_species_v_version_filter_traits_leaf_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__species_v_version_filter_traits_leaf_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_species_v_version_filter_traits_arrangement" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__species_v_version_filter_traits_arrangement",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_species_v_version_filter_traits_leaf_shape" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__species_v_version_filter_traits_leaf_shape",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_species_v_version_filter_traits_leaf_edge" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__species_v_version_filter_traits_leaf_edge",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_species_v_version_filter_traits_bark" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__species_v_version_filter_traits_bark",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_species_v_version_filter_traits_thorns" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__species_v_version_filter_traits_thorns",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_species_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"field" "enum__species_v_version_sources_field" DEFAULT 'general' NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_species_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_latin_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_status" "enum__species_v_version_status" DEFAULT 'aiDraft' NOT NULL,
  	"version_launch_wave" "enum__species_v_version_launch_wave" DEFAULT '2',
  	"version_review_notes" varchar,
  	"version_is_warning" boolean,
  	"version_green_carving" "enum__species_v_version_green_carving",
  	"version_dry_hardness" "enum__species_v_version_dry_hardness",
  	"version_janka_n" numeric,
  	"version_food_safety_checked" boolean,
  	"version_food_safety_checked_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_species_v_locales" (
  	"version_name" varchar NOT NULL,
  	"version_warning_reason" varchar,
  	"version_grain_texture" jsonb,
  	"version_colour_smell" jsonb,
  	"version_good_for" jsonb,
  	"version_riving" jsonb,
  	"version_drying" jsonb,
  	"version_food_safety" jsonb,
  	"version_id_features_leaf" jsonb,
  	"version_id_features_bark" jsonb,
  	"version_id_features_twig" jsonb,
  	"version_id_features_shape" jsonb,
  	"version_id_features_cut_wood" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_species_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_species_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"species_id" integer
  );
  
  CREATE TABLE "photos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"species_id" integer NOT NULL,
  	"status" "enum_photos_status" DEFAULT 'candidate' NOT NULL,
  	"slot" "enum_photos_slot",
  	"source" "enum_photos_source" DEFAULT 'upload' NOT NULL,
  	"license" "enum_photos_license" NOT NULL,
  	"author" varchar NOT NULL,
  	"attribution" varchar NOT NULL,
  	"source_url" varchar,
  	"remote_url" varchar,
  	"fetched_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "photos_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "where_to_get_wood" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "where_to_get_wood_locales" (
  	"title" varchar NOT NULL,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_where_to_get_wood_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_where_to_get_wood_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_locales" (
  	"title" varchar NOT NULL,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_about_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "species_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "photos_id" integer;
  ALTER TABLE "species_good_for_tags" ADD CONSTRAINT "species_good_for_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_filter_traits_leaf_type" ADD CONSTRAINT "species_filter_traits_leaf_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_filter_traits_arrangement" ADD CONSTRAINT "species_filter_traits_arrangement_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_filter_traits_leaf_shape" ADD CONSTRAINT "species_filter_traits_leaf_shape_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_filter_traits_leaf_edge" ADD CONSTRAINT "species_filter_traits_leaf_edge_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_filter_traits_bark" ADD CONSTRAINT "species_filter_traits_bark_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_filter_traits_thorns" ADD CONSTRAINT "species_filter_traits_thorns_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_sources" ADD CONSTRAINT "species_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_locales" ADD CONSTRAINT "species_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_texts" ADD CONSTRAINT "species_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_rels" ADD CONSTRAINT "species_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "species_rels" ADD CONSTRAINT "species_rels_species_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_version_good_for_tags" ADD CONSTRAINT "_species_v_version_good_for_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_version_filter_traits_leaf_type" ADD CONSTRAINT "_species_v_version_filter_traits_leaf_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_version_filter_traits_arrangement" ADD CONSTRAINT "_species_v_version_filter_traits_arrangement_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_version_filter_traits_leaf_shape" ADD CONSTRAINT "_species_v_version_filter_traits_leaf_shape_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_version_filter_traits_leaf_edge" ADD CONSTRAINT "_species_v_version_filter_traits_leaf_edge_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_version_filter_traits_bark" ADD CONSTRAINT "_species_v_version_filter_traits_bark_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_version_filter_traits_thorns" ADD CONSTRAINT "_species_v_version_filter_traits_thorns_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_version_sources" ADD CONSTRAINT "_species_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v" ADD CONSTRAINT "_species_v_parent_id_species_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."species"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_species_v_locales" ADD CONSTRAINT "_species_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_texts" ADD CONSTRAINT "_species_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_rels" ADD CONSTRAINT "_species_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_species_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_species_v_rels" ADD CONSTRAINT "_species_v_rels_species_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos_locales" ADD CONSTRAINT "photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "where_to_get_wood_locales" ADD CONSTRAINT "where_to_get_wood_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."where_to_get_wood"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_where_to_get_wood_v_locales" ADD CONSTRAINT "_where_to_get_wood_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_where_to_get_wood_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_locales" ADD CONSTRAINT "about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_locales" ADD CONSTRAINT "_about_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "species_good_for_tags_order_idx" ON "species_good_for_tags" USING btree ("order");
  CREATE INDEX "species_good_for_tags_parent_idx" ON "species_good_for_tags" USING btree ("parent_id");
  CREATE INDEX "species_filter_traits_leaf_type_order_idx" ON "species_filter_traits_leaf_type" USING btree ("order");
  CREATE INDEX "species_filter_traits_leaf_type_parent_idx" ON "species_filter_traits_leaf_type" USING btree ("parent_id");
  CREATE INDEX "species_filter_traits_arrangement_order_idx" ON "species_filter_traits_arrangement" USING btree ("order");
  CREATE INDEX "species_filter_traits_arrangement_parent_idx" ON "species_filter_traits_arrangement" USING btree ("parent_id");
  CREATE INDEX "species_filter_traits_leaf_shape_order_idx" ON "species_filter_traits_leaf_shape" USING btree ("order");
  CREATE INDEX "species_filter_traits_leaf_shape_parent_idx" ON "species_filter_traits_leaf_shape" USING btree ("parent_id");
  CREATE INDEX "species_filter_traits_leaf_edge_order_idx" ON "species_filter_traits_leaf_edge" USING btree ("order");
  CREATE INDEX "species_filter_traits_leaf_edge_parent_idx" ON "species_filter_traits_leaf_edge" USING btree ("parent_id");
  CREATE INDEX "species_filter_traits_bark_order_idx" ON "species_filter_traits_bark" USING btree ("order");
  CREATE INDEX "species_filter_traits_bark_parent_idx" ON "species_filter_traits_bark" USING btree ("parent_id");
  CREATE INDEX "species_filter_traits_thorns_order_idx" ON "species_filter_traits_thorns" USING btree ("order");
  CREATE INDEX "species_filter_traits_thorns_parent_idx" ON "species_filter_traits_thorns" USING btree ("parent_id");
  CREATE INDEX "species_sources_order_idx" ON "species_sources" USING btree ("_order");
  CREATE INDEX "species_sources_parent_id_idx" ON "species_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "species_slug_idx" ON "species" USING btree ("slug");
  CREATE INDEX "species_updated_at_idx" ON "species" USING btree ("updated_at");
  CREATE INDEX "species_created_at_idx" ON "species" USING btree ("created_at");
  CREATE UNIQUE INDEX "species_locales_locale_parent_id_unique" ON "species_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "species_locales_parent_id_idx" ON "species_locales" USING btree ("_parent_id");
  CREATE INDEX "species_texts_order_parent" ON "species_texts" USING btree ("order","parent_id");
  CREATE INDEX "species_rels_order_idx" ON "species_rels" USING btree ("order");
  CREATE INDEX "species_rels_parent_idx" ON "species_rels" USING btree ("parent_id");
  CREATE INDEX "species_rels_path_idx" ON "species_rels" USING btree ("path");
  CREATE INDEX "species_rels_species_id_idx" ON "species_rels" USING btree ("species_id");
  CREATE INDEX "_species_v_version_good_for_tags_order_idx" ON "_species_v_version_good_for_tags" USING btree ("order");
  CREATE INDEX "_species_v_version_good_for_tags_parent_idx" ON "_species_v_version_good_for_tags" USING btree ("parent_id");
  CREATE INDEX "_species_v_version_filter_traits_leaf_type_order_idx" ON "_species_v_version_filter_traits_leaf_type" USING btree ("order");
  CREATE INDEX "_species_v_version_filter_traits_leaf_type_parent_idx" ON "_species_v_version_filter_traits_leaf_type" USING btree ("parent_id");
  CREATE INDEX "_species_v_version_filter_traits_arrangement_order_idx" ON "_species_v_version_filter_traits_arrangement" USING btree ("order");
  CREATE INDEX "_species_v_version_filter_traits_arrangement_parent_idx" ON "_species_v_version_filter_traits_arrangement" USING btree ("parent_id");
  CREATE INDEX "_species_v_version_filter_traits_leaf_shape_order_idx" ON "_species_v_version_filter_traits_leaf_shape" USING btree ("order");
  CREATE INDEX "_species_v_version_filter_traits_leaf_shape_parent_idx" ON "_species_v_version_filter_traits_leaf_shape" USING btree ("parent_id");
  CREATE INDEX "_species_v_version_filter_traits_leaf_edge_order_idx" ON "_species_v_version_filter_traits_leaf_edge" USING btree ("order");
  CREATE INDEX "_species_v_version_filter_traits_leaf_edge_parent_idx" ON "_species_v_version_filter_traits_leaf_edge" USING btree ("parent_id");
  CREATE INDEX "_species_v_version_filter_traits_bark_order_idx" ON "_species_v_version_filter_traits_bark" USING btree ("order");
  CREATE INDEX "_species_v_version_filter_traits_bark_parent_idx" ON "_species_v_version_filter_traits_bark" USING btree ("parent_id");
  CREATE INDEX "_species_v_version_filter_traits_thorns_order_idx" ON "_species_v_version_filter_traits_thorns" USING btree ("order");
  CREATE INDEX "_species_v_version_filter_traits_thorns_parent_idx" ON "_species_v_version_filter_traits_thorns" USING btree ("parent_id");
  CREATE INDEX "_species_v_version_sources_order_idx" ON "_species_v_version_sources" USING btree ("_order");
  CREATE INDEX "_species_v_version_sources_parent_id_idx" ON "_species_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_species_v_parent_idx" ON "_species_v" USING btree ("parent_id");
  CREATE INDEX "_species_v_version_version_slug_idx" ON "_species_v" USING btree ("version_slug");
  CREATE INDEX "_species_v_version_version_updated_at_idx" ON "_species_v" USING btree ("version_updated_at");
  CREATE INDEX "_species_v_version_version_created_at_idx" ON "_species_v" USING btree ("version_created_at");
  CREATE INDEX "_species_v_created_at_idx" ON "_species_v" USING btree ("created_at");
  CREATE INDEX "_species_v_updated_at_idx" ON "_species_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_species_v_locales_locale_parent_id_unique" ON "_species_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_species_v_locales_parent_id_idx" ON "_species_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_species_v_texts_order_parent" ON "_species_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_species_v_rels_order_idx" ON "_species_v_rels" USING btree ("order");
  CREATE INDEX "_species_v_rels_parent_idx" ON "_species_v_rels" USING btree ("parent_id");
  CREATE INDEX "_species_v_rels_path_idx" ON "_species_v_rels" USING btree ("path");
  CREATE INDEX "_species_v_rels_species_id_idx" ON "_species_v_rels" USING btree ("species_id");
  CREATE INDEX "photos_species_idx" ON "photos" USING btree ("species_id");
  CREATE INDEX "photos_status_idx" ON "photos" USING btree ("status");
  CREATE INDEX "photos_updated_at_idx" ON "photos" USING btree ("updated_at");
  CREATE INDEX "photos_created_at_idx" ON "photos" USING btree ("created_at");
  CREATE UNIQUE INDEX "photos_filename_idx" ON "photos" USING btree ("filename");
  CREATE INDEX "photos_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "photos" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "photos_sizes_card_sizes_card_filename_idx" ON "photos" USING btree ("sizes_card_filename");
  CREATE UNIQUE INDEX "photos_locales_locale_parent_id_unique" ON "photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "photos_locales_parent_id_idx" ON "photos_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "where_to_get_wood_locales_locale_parent_id_unique" ON "where_to_get_wood_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "where_to_get_wood_locales_parent_id_idx" ON "where_to_get_wood_locales" USING btree ("_parent_id");
  CREATE INDEX "_where_to_get_wood_v_created_at_idx" ON "_where_to_get_wood_v" USING btree ("created_at");
  CREATE INDEX "_where_to_get_wood_v_updated_at_idx" ON "_where_to_get_wood_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_where_to_get_wood_v_locales_locale_parent_id_unique" ON "_where_to_get_wood_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_where_to_get_wood_v_locales_parent_id_idx" ON "_where_to_get_wood_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_locales_locale_parent_id_unique" ON "about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_locales_parent_id_idx" ON "about_locales" USING btree ("_parent_id");
  CREATE INDEX "_about_v_created_at_idx" ON "_about_v" USING btree ("created_at");
  CREATE INDEX "_about_v_updated_at_idx" ON "_about_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_about_v_locales_locale_parent_id_unique" ON "_about_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_v_locales_parent_id_idx" ON "_about_v_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_species_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_photos_fk" FOREIGN KEY ("photos_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_species_id_idx" ON "payload_locked_documents_rels" USING btree ("species_id");
  CREATE INDEX "payload_locked_documents_rels_photos_id_idx" ON "payload_locked_documents_rels" USING btree ("photos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "species_good_for_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_filter_traits_leaf_type" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_filter_traits_arrangement" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_filter_traits_leaf_shape" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_filter_traits_leaf_edge" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_filter_traits_bark" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_filter_traits_thorns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "species_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_version_good_for_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_version_filter_traits_leaf_type" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_version_filter_traits_arrangement" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_version_filter_traits_leaf_shape" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_version_filter_traits_leaf_edge" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_version_filter_traits_bark" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_version_filter_traits_thorns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_version_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_species_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "photos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "where_to_get_wood" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "where_to_get_wood_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_where_to_get_wood_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_where_to_get_wood_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "species_good_for_tags" CASCADE;
  DROP TABLE "species_filter_traits_leaf_type" CASCADE;
  DROP TABLE "species_filter_traits_arrangement" CASCADE;
  DROP TABLE "species_filter_traits_leaf_shape" CASCADE;
  DROP TABLE "species_filter_traits_leaf_edge" CASCADE;
  DROP TABLE "species_filter_traits_bark" CASCADE;
  DROP TABLE "species_filter_traits_thorns" CASCADE;
  DROP TABLE "species_sources" CASCADE;
  DROP TABLE "species" CASCADE;
  DROP TABLE "species_locales" CASCADE;
  DROP TABLE "species_texts" CASCADE;
  DROP TABLE "species_rels" CASCADE;
  DROP TABLE "_species_v_version_good_for_tags" CASCADE;
  DROP TABLE "_species_v_version_filter_traits_leaf_type" CASCADE;
  DROP TABLE "_species_v_version_filter_traits_arrangement" CASCADE;
  DROP TABLE "_species_v_version_filter_traits_leaf_shape" CASCADE;
  DROP TABLE "_species_v_version_filter_traits_leaf_edge" CASCADE;
  DROP TABLE "_species_v_version_filter_traits_bark" CASCADE;
  DROP TABLE "_species_v_version_filter_traits_thorns" CASCADE;
  DROP TABLE "_species_v_version_sources" CASCADE;
  DROP TABLE "_species_v" CASCADE;
  DROP TABLE "_species_v_locales" CASCADE;
  DROP TABLE "_species_v_texts" CASCADE;
  DROP TABLE "_species_v_rels" CASCADE;
  DROP TABLE "photos" CASCADE;
  DROP TABLE "photos_locales" CASCADE;
  DROP TABLE "where_to_get_wood" CASCADE;
  DROP TABLE "where_to_get_wood_locales" CASCADE;
  DROP TABLE "_where_to_get_wood_v" CASCADE;
  DROP TABLE "_where_to_get_wood_v_locales" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "about_locales" CASCADE;
  DROP TABLE "_about_v" CASCADE;
  DROP TABLE "_about_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_species_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_photos_fk";
  
  DROP INDEX "payload_locked_documents_rels_species_id_idx";
  DROP INDEX "payload_locked_documents_rels_photos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "species_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "photos_id";
  DROP TYPE "public"."enum_species_good_for_tags";
  DROP TYPE "public"."enum_species_filter_traits_leaf_type";
  DROP TYPE "public"."enum_species_filter_traits_arrangement";
  DROP TYPE "public"."enum_species_filter_traits_leaf_shape";
  DROP TYPE "public"."enum_species_filter_traits_leaf_edge";
  DROP TYPE "public"."enum_species_filter_traits_bark";
  DROP TYPE "public"."enum_species_filter_traits_thorns";
  DROP TYPE "public"."enum_species_sources_field";
  DROP TYPE "public"."enum_species_status";
  DROP TYPE "public"."enum_species_launch_wave";
  DROP TYPE "public"."enum_species_green_carving";
  DROP TYPE "public"."enum_species_dry_hardness";
  DROP TYPE "public"."enum__species_v_version_good_for_tags";
  DROP TYPE "public"."enum__species_v_version_filter_traits_leaf_type";
  DROP TYPE "public"."enum__species_v_version_filter_traits_arrangement";
  DROP TYPE "public"."enum__species_v_version_filter_traits_leaf_shape";
  DROP TYPE "public"."enum__species_v_version_filter_traits_leaf_edge";
  DROP TYPE "public"."enum__species_v_version_filter_traits_bark";
  DROP TYPE "public"."enum__species_v_version_filter_traits_thorns";
  DROP TYPE "public"."enum__species_v_version_sources_field";
  DROP TYPE "public"."enum__species_v_version_status";
  DROP TYPE "public"."enum__species_v_version_launch_wave";
  DROP TYPE "public"."enum__species_v_version_green_carving";
  DROP TYPE "public"."enum__species_v_version_dry_hardness";
  DROP TYPE "public"."enum_photos_status";
  DROP TYPE "public"."enum_photos_slot";
  DROP TYPE "public"."enum_photos_source";
  DROP TYPE "public"."enum_photos_license";`)
}
