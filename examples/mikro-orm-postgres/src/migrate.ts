import { createDatabase } from "./database";

const { orm, close } = await createDatabase();
const migrated = await orm.migrator.up();
await close();
console.log(`applied ${migrated.length} migration(s)`);
