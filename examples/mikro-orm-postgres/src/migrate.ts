import { closeDatabase, createDatabase } from "./database";

const { orm } = await createDatabase();
const migrated = await orm.migrator.up();
await closeDatabase({ orm });
console.log(`applied ${migrated.length} migration(s)`);
