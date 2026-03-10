import { tdb } from './root-db'

export async function resetDb() {
  await tdb.execute(`
    DO $$
    DECLARE
        tbls text;
    BEGIN
        SELECT string_agg(quote_ident(tablename), ', ') INTO tbls
            FROM pg_tables WHERE schemaname = 'public';
        EXECUTE format('TRUNCATE TABLE %s RESTART IDENTITY CASCADE', tbls);
    END $$;
  `)
}
