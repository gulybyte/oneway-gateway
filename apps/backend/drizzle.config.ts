/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Config } from 'drizzle-kit'

export default {
  schema: './src/drizzle/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  introspect: {
    casing: 'camel',
  },
  verbose: true,
  strict: true,
} satisfies Config
