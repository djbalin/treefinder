import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { da } from "@payloadcms/translations/languages/da";
import { en } from "@payloadcms/translations/languages/en";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Photos } from "./collections/Photos";
import { Species } from "./collections/Species";
import { Users } from "./collections/Users";
import { About, WhereToGetWood } from "./globals/pages";
import { migrations } from "./migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Species, Photos, Users],
  globals: [WhereToGetWood, About],
  editor: lexicalEditor(),
  // Admin UI languages.
  i18n: {
    supportedLanguages: { da, en },
    fallbackLanguage: "da",
  },
  // Content languages (architecture spec §6). Danish is required, English
  // falls back to Danish until it is translated.
  localization: {
    locales: [
      { code: "da", label: "Dansk" },
      { code: "en", label: "English" },
    ],
    defaultLocale: "da",
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    migrationDir: path.resolve(dirname, "migrations"),
    // Schema changes go through migrations, never automatic push, so local,
    // CI and production databases stay identical.
    push: false,
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [],
});
