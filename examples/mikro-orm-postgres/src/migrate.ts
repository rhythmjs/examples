import { createOrm } from "./database";

const orm = await createOrm();
const migrated = await orm.migrator.up();
await orm.close();
console.log(`applied ${migrated.length} migration(s)`);
