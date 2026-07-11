import { Pool, types } from "pg";

// NUMERIC (OID 1700) → number (money values are small; float is fine here)
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
// DATE (OID 1082) → keep the raw 'YYYY-MM-DD' string instead of a JS Date,
// so date params round-trip without timezone shifts.
types.setTypeParser(1082, (v) => v);

declare global {
  var pgPool: Pool | undefined;
}

export const pool =
  global.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}
