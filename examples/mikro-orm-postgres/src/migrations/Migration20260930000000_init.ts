import { Migration } from "@mikro-orm/migrations";

export class Migration20260930000000_init extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table "notes" (
        "id" varchar(255) not null,
        "title" varchar(255) not null,
        "content" text not null default '',
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "notes_pkey" primary key ("id")
      );
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "notes" cascade;`);
  }
}
