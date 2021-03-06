import Knex from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("members", (table) => {
    table.increments("id").primary();
    table.timestamp("created_at").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.string("nome").notNullable()
    table.string("discordId").notNullable()
    table.string("guildName").notNullable()
    table.string("guildId").notNullable()
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("members");
}
