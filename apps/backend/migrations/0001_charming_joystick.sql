ALTER TABLE "plans" DROP CONSTRAINT "plans_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "provider_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "meta" json;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_provider_id_unique" UNIQUE("provider_id");