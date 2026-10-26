import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { da } from "@payloadcms/translations/languages/da";
import { en } from "@payloadcms/translations/languages/en";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Photos } from "./collections/Photos";
import { Species } from "./collections/Species";
import { Users } from "./collections/Users";
import { About, WhereToGetWood } from "./globals/pages";
import { draftCardWorkflow, draftSectionTasks } from "./jobs/draftCard";
import {
  fetchCommonsTask,
  fetchInaturalistTask,
  fetchPhotoCandidatesWorkflow,
} from "./jobs/fetchPhotoCandidates";
import { migrations } from "./migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: ["/components/admin/ReviewNavLink#ReviewNavLink"],
      views: {
        review: {
          Component: "/components/admin/ReviewQueue#ReviewQueue",
          path: "/review",
        },
      },
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
  jobs: {
    tasks: [fetchCommonsTask, fetchInaturalistTask, ...draftSectionTasks],
    workflows: [fetchPhotoCandidatesWorkflow, draftCardWorkflow],
    access: {
      queue: ({ req }) => Boolean(req.user),
      // Admins, or the daily Vercel Cron sweep (architecture spec §5).
      run: ({ req }) =>
        Boolean(req.user) ||
        (Boolean(process.env.CRON_SECRET) &&
          req.headers.get("authorization") ===
            `Bearer ${process.env.CRON_SECRET}`),
    },
  },
  sharp,
  plugins: [
    // Selected photos go to Supabase Storage (S3 API) when configured;
    // otherwise to ./media on disk (local development and CI).
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      collections: { photos: true },
      bucket: process.env.S3_BUCKET ?? "",
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        },
      },
    }),
  ],
});
