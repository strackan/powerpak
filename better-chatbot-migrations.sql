CREATE TABLE IF NOT EXISTS "chat_message" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" uuid NOT NULL,
	"role" text NOT NULL,
	"parts" json[],
	"attachments" json[],
	"annotations" json[],
	"model" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_thread" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"project_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL,
	"instructions" json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint

DO $$ BEGIN	
  ALTER TABLE "chat_thread" ADD CONSTRAINT "chat_thread_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "project" ADD CONSTRAINT "project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcp_server_binding" (
	"owner_type" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "mcp_server_binding_owner_type_owner_id_pk" PRIMARY KEY("owner_type","owner_id")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_thread_id_chat_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_thread"("id") ON DELETE no action ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DROP TABLE IF EXISTS "mcp_server_binding";DO $$ BEGIN
ALTER TABLE "user" ADD COLUMN "preferences" json DEFAULT '{}'::json;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "mcp_server" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"config" json NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='user'
          AND column_name='password'
          AND is_nullable='NO'
    ) THEN
        ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;
    END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;CREATE TABLE IF NOT EXISTS "mcp_server_custom_instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mcp_server_id" uuid NOT NULL,
	"prompt" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "mcp_server_custom_instructions_user_id_mcp_server_id_unique" UNIQUE("user_id","mcp_server_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcp_server_tool_custom_instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tool_name" text NOT NULL,
	"mcp_server_id" uuid NOT NULL,
	"prompt" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "mcp_server_tool_custom_instructions_user_id_tool_name_mcp_server_id_unique" UNIQUE("user_id","tool_name","mcp_server_id")
);
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "mcp_server_custom_instructions" ADD CONSTRAINT "mcp_server_custom_instructions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
ALTER TABLE "mcp_server_custom_instructions" ADD CONSTRAINT "mcp_server_custom_instructions_mcp_server_id_mcp_server_id_fk" FOREIGN KEY ("mcp_server_id") REFERENCES "public"."mcp_server"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
ALTER TABLE "mcp_server_tool_custom_instructions" ADD CONSTRAINT "mcp_server_tool_custom_instructions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
ALTER TABLE "mcp_server_tool_custom_instructions" ADD CONSTRAINT "mcp_server_tool_custom_instructions_mcp_server_id_mcp_server_id_fk" FOREIGN KEY ("mcp_server_id") REFERENCES "public"."mcp_server"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;CREATE TABLE IF NOT EXISTS "workflow_edge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text DEFAULT '0.1.0' NOT NULL,
	"workflow_id" uuid NOT NULL,
	"source" uuid NOT NULL,
	"target" uuid NOT NULL,
	"ui_config" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_node" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text DEFAULT '0.1.0' NOT NULL,
	"workflow_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"ui_config" json DEFAULT '{}'::json,
	"node_config" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text DEFAULT '0.1.0' NOT NULL,
	"name" text NOT NULL,
	"icon" json,
	"description" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "workflow_edge" ADD CONSTRAINT "workflow_edge_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
ALTER TABLE "workflow_edge" ADD CONSTRAINT "workflow_edge_source_workflow_node_id_fk" FOREIGN KEY ("source") REFERENCES "public"."workflow_node"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
ALTER TABLE "workflow_edge" ADD CONSTRAINT "workflow_edge_target_workflow_node_id_fk" FOREIGN KEY ("target") REFERENCES "public"."workflow_node"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
ALTER TABLE "workflow_node" ADD CONSTRAINT "workflow_node_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "workflow" ADD CONSTRAINT "workflow_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "workflow_node_kind_idx" ON "workflow_node" USING btree ("kind");CREATE TABLE IF NOT EXISTS "agent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" json,
	"user_id" uuid NOT NULL,
	"instructions" json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "archive" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "archive_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"archive_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint

-- Migrate data from project to agent and archive if project table exists
DO $$ 
BEGIN
	IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project') 
		AND EXISTS (SELECT FROM information_schema.columns 
                WHERE table_name = 'chat_thread' AND column_name = 'project_id') 
	THEN
		-- 1. Migrate project system prompts to agent table
		INSERT INTO "agent" (id, name, user_id, instructions, created_at, updated_at)
		SELECT 
			id, 
			name, 
			user_id, 
			instructions, 
			created_at, 
			updated_at 
		FROM "project"
		ON CONFLICT (id) DO NOTHING;
		
		-- 2. Create default archives for each project's threads
		INSERT INTO "archive" (id, name, description, user_id, created_at, updated_at)
		SELECT 
			gen_random_uuid(),
			p.name || ' Archive',
			'Migrated from project: ' || p.name,
			p.user_id,
			p.created_at,
			p.updated_at
		FROM "project" p
		WHERE EXISTS (
			SELECT 1 FROM "chat_thread" ct WHERE ct.project_id = p.id
		);
		
		-- 3. Move project threads to archives
		INSERT INTO "archive_item" (id, archive_id, item_id, user_id, added_at)
		SELECT 
			gen_random_uuid(),
			a.id,
			ct.id,
			ct.user_id,
			ct.created_at
		FROM "chat_thread" ct
		JOIN "project" p ON ct.project_id = p.id
		JOIN "archive" a ON a.user_id = p.user_id 
			AND a.name = p.name || ' Archive'
		WHERE ct.project_id IS NOT NULL;
		
		-- 4. Drop project table after migration
		DROP TABLE "project" CASCADE;
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "agent" ADD CONSTRAINT "agent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "archive" ADD CONSTRAINT "archive_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "archive_item" ADD CONSTRAINT "archive_item_archive_id_archive_id_fk" FOREIGN KEY ("archive_id") REFERENCES "public"."archive"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "archive_item" ADD CONSTRAINT "archive_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "archive_item_item_id_idx" ON "archive_item" USING btree ("item_id");
--> statement-breakpoint

-- Remove project_id column from chat_thread if it exists
DO $$ 
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns 
			  WHERE table_name = 'chat_thread' AND column_name = 'project_id') THEN
		ALTER TABLE "chat_thread" DROP COLUMN "project_id";
	END IF;
END $$;CREATE TABLE IF NOT EXISTS "mcp_oauth_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mcp_server_id" uuid NOT NULL,
	"server_url" text NOT NULL,
	"client_info" json,
	"tokens" json,
	"code_verifier" text,
	"state" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "mcp_oauth_session_mcp_server_id_unique" UNIQUE("mcp_server_id")
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "mcp_oauth_session" ADD CONSTRAINT "mcp_oauth_session_mcp_server_id_mcp_server_id_fk" FOREIGN KEY ("mcp_server_id") REFERENCES "public"."mcp_server"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mcp_oauth_data_server_id_idx" ON "mcp_oauth_session" USING btree ("mcp_server_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mcp_oauth_data_state_idx" ON "mcp_oauth_session" USING btree ("state");DO $$ BEGIN
	ALTER TABLE "mcp_oauth_session" DROP CONSTRAINT IF EXISTS "mcp_oauth_session_mcp_server_id_unique";
EXCEPTION
	WHEN undefined_object THEN null;
END $$;
--> statement-breakpoint
DROP INDEX IF EXISTS "mcp_oauth_data_server_id_idx";
--> statement-breakpoint
DROP INDEX IF EXISTS "mcp_oauth_data_state_idx";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mcp_oauth_session_server_id_idx" ON "mcp_oauth_session" USING btree ("mcp_server_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mcp_oauth_session_state_idx" ON "mcp_oauth_session" USING btree ("state");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mcp_oauth_session_tokens_idx" ON "mcp_oauth_session" USING btree ("mcp_server_id") WHERE "mcp_oauth_session"."tokens" is not null;
--> statement-breakpoint
DO $$ BEGIN
	-- Check if constraint exists and add if not
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.table_constraints 
		WHERE constraint_name = 'mcp_oauth_session_state_unique' 
		AND table_name = 'mcp_oauth_session'
		AND table_schema = 'public'
	) THEN
		ALTER TABLE "mcp_oauth_session" ADD CONSTRAINT "mcp_oauth_session_state_unique" UNIQUE("state");
	END IF;
EXCEPTION
	WHEN others THEN 
		-- Ignore all errors (constraint might exist with different name)
		NULL;
END $$;CREATE TABLE IF NOT EXISTS "bookmark" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"item_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "bookmark_user_id_item_id_item_type_unique" UNIQUE("user_id","item_id","item_type")
);
--> statement-breakpoint
ALTER TABLE "agent" ADD COLUMN IF NOT EXISTS "visibility" varchar DEFAULT 'private' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookmark_user_id_idx" ON "bookmark" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookmark_item_idx" ON "bookmark" USING btree ("item_id","item_type");ALTER TABLE "chat_message" ADD COLUMN IF NOT EXISTS "metadata" json;--> statement-breakpoint

-- Migrate existing model and usage data to metadata format BEFORE dropping columns
DO $$ 
BEGIN
	-- Migrate model data if model column exists
	IF EXISTS (SELECT 1 FROM information_schema.columns 
		  WHERE table_name = 'chat_message' AND column_name = 'model') THEN
		
		BEGIN
		-- Migrate model data to metadata.chatModel.model for all message types that have model data
		UPDATE "chat_message" 
		SET "metadata" = COALESCE("metadata", '{}')::jsonb || 
			json_build_object('chatModel', json_build_object('model', "model"))::jsonb
		WHERE "model" IS NOT NULL 
		AND TRIM("model") != ''
		AND ("metadata" IS NULL OR "metadata"->>'chatModel' IS NULL);
			
			RAISE NOTICE 'Migrated % messages with model data to metadata format', 
				(SELECT COUNT(*) FROM "chat_message" 
				 WHERE "model" IS NOT NULL AND TRIM("model") != '');
		EXCEPTION
			WHEN OTHERS THEN
				RAISE NOTICE 'Skipped model migration due to error: %', SQLERRM;
		END;
	END IF;

	-- Migrate usage data from annotations if annotations column exists
	IF EXISTS (SELECT 1 FROM information_schema.columns 
		  WHERE table_name = 'chat_message' AND column_name = 'annotations') THEN
		
		BEGIN
		-- Migrate usage tokens from annotations[1]->usageTokens to metadata.usage.totalTokens
		UPDATE "chat_message" 
		SET "metadata" = COALESCE("metadata", '{}')::jsonb || 
			json_build_object('usage', json_build_object('totalTokens', 
				CASE 
					WHEN ("annotations"[1]::json->>'usageTokens') ~ '^[0-9]+(\.[0-9]+)?$' 
					THEN ("annotations"[1]::json->>'usageTokens')::numeric
					ELSE 0
				END))::jsonb
		WHERE "annotations" IS NOT NULL 
		AND array_length("annotations", 1) >= 1
		AND "annotations"[1] IS NOT NULL
		AND "annotations"[1]::text != 'null'
		AND "annotations"[1]::jsonb ? 'usageTokens'
		AND ("metadata" IS NULL OR "metadata"->>'usage' IS NULL);
			
			RAISE NOTICE 'Migrated % messages with usage data from annotations to metadata format', 
				(SELECT COUNT(*) FROM "chat_message" 
				 WHERE "annotations" IS NOT NULL 
				 AND array_length("annotations", 1) >= 1
				 AND "annotations"[1] IS NOT NULL
				 AND "annotations"[1]::text != 'null'
				 AND "annotations"[1]::jsonb ? 'usageTokens');
		EXCEPTION
			WHEN OTHERS THEN
				RAISE NOTICE 'Skipped annotations migration due to error: %', SQLERRM;
		END;
	END IF;
END $$;
--> statement-breakpoint

-- Now safely drop the old columns after data migration
DO $$ 
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns 
		  WHERE table_name = 'chat_message' AND column_name = 'attachments') THEN
		ALTER TABLE "chat_message" DROP COLUMN "attachments";
	END IF;
END $$;
--> statement-breakpoint
DO $$ 
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns 
		  WHERE table_name = 'chat_message' AND column_name = 'annotations') THEN
		ALTER TABLE "chat_message" DROP COLUMN "annotations";
	END IF;
END $$;
--> statement-breakpoint
DO $$ 
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns 
		  WHERE table_name = 'chat_message' AND column_name = 'model') THEN
		ALTER TABLE "chat_message" DROP COLUMN "model";
	END IF;
END $$;DO $$ BEGIN
  ALTER TABLE "agent" DROP CONSTRAINT "agent_user_id_user_id_fk";
EXCEPTION
  WHEN undefined_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "chat_message" DROP CONSTRAINT "chat_message_thread_id_chat_thread_id_fk";
EXCEPTION
  WHEN undefined_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "chat_thread" DROP CONSTRAINT "chat_thread_user_id_user_id_fk";
EXCEPTION
  WHEN undefined_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "mcp_server" ADD COLUMN IF NOT EXISTS "user_id" uuid;--> statement-breakpoint
ALTER TABLE "mcp_server" ADD COLUMN IF NOT EXISTS "visibility" varchar DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'editor' NOT NULL;--> statement-breakpoint
-- Set user_id for existing MCP servers to first admin user (or first user if no admin)
UPDATE "mcp_server" SET "user_id" = COALESCE(
  (SELECT id FROM "user" WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1),
  (SELECT id FROM "user" ORDER BY created_at ASC LIMIT 1)
) WHERE "user_id" IS NULL;--> statement-breakpoint
-- Make user_id NOT NULL after populating
ALTER TABLE "mcp_server" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "agent" ADD CONSTRAINT "agent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_thread_id_chat_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_thread"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "chat_thread" ADD CONSTRAINT "chat_thread_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "mcp_server" ADD CONSTRAINT "mcp_server_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;CREATE TABLE IF NOT EXISTS "chat_export_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"export_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_id" uuid,
	"content" json NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_export" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"exporter_id" uuid NOT NULL,
	"original_thread_id" uuid,
	"messages" json NOT NULL,
	"exported_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp
);


--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "chat_export_comment" ADD CONSTRAINT "chat_export_comment_export_id_chat_export_id_fk" FOREIGN KEY ("export_id") REFERENCES "public"."chat_export"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "chat_export_comment" ADD CONSTRAINT "chat_export_comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "chat_export_comment" ADD CONSTRAINT "chat_export_comment_parent_id_chat_export_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chat_export_comment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "chat_export" ADD CONSTRAINT "chat_export_exporter_id_user_id_fk" FOREIGN KEY ("exporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
