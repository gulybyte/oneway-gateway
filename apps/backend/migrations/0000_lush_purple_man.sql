CREATE TABLE "plans" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "plans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text,
	"imageLink" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
	CONSTRAINT "products_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plans_created_at_index" ON "plans" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "plans_updated_at_index" ON "plans" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "plans_product_id_index" ON "plans" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "plans_name_index" ON "plans" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_product_id_name_index" ON "plans" USING btree ("product_id","name");--> statement-breakpoint
CREATE INDEX "products_created_at_index" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "products_updated_at_index" ON "products" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "products_name_index" ON "products" USING btree ("name");