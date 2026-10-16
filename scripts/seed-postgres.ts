import { spawnSync } from 'node:child_process';

function runNpx(args: string[], env: NodeJS.ProcessEnv = process.env) {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`npx ${args.join(' ')} exited with status ${result.status}.`);
  }
}

let seedError: unknown;
try {
  runNpx(['prisma', 'generate', '--schema', 'prisma/postgres/schema.prisma']);
  const seedEnvironment: NodeJS.ProcessEnv = { ...process.env, NORIA_DEMO_MODE: 'true' };
  delete seedEnvironment.ADMIN_EMAIL;
  delete seedEnvironment.ADMIN_PASSWORD;
  runNpx(['prisma', 'db', 'seed', '--schema', 'prisma/postgres/schema.prisma'], seedEnvironment);
} catch (error) {
  seedError = error;
}

let restoreError: unknown;
try {
  runNpx(['prisma', 'generate']);
} catch (error) {
  restoreError = error;
}

if (seedError) {
  console.error('PostgreSQL demo seed failed:', seedError);
}
if (restoreError) {
  console.error('Could not restore the local SQLite Prisma client:', restoreError);
}
if (seedError || restoreError) {
  process.exitCode = 1;
}
