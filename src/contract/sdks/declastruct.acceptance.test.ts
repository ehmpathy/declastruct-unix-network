import type { DeclastructChange } from 'declastruct';
import { given, then, when } from 'test-fns';

import { getDeclastructUnixNetworkProvider } from '@src/domain.operations/provider/getDeclastructUnixNetworkProvider';

import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const log = console;

/**
 * .what = acceptance tests for declastruct CLI workflow with unix network provider
 * .why = validates end-to-end usage of declastruct-unix-network with declastruct CLI
 * .note = runs against an isolated temp dir (temp /etc/hosts + temp systemd dir),
 *         so no sudo is required. the temp paths are passed to the declastruct CLI
 *         subprocess via ACCEPTANCE_ETC_HOSTS_PATH / ACCEPTANCE_SYSTEMD_UNITS_DIR
 *         env vars, which resources.acceptance.ts reads to configure the provider.
 */
describe('declastruct CLI workflow', () => {
  given('a declastruct resources file', () => {
    const testDir = join(
      __dirname,
      '.test',
      '.temp',
      'acceptance',
      `run.${Date.now()}`,
    );
    const resourcesFile = join(
      __dirname,
      '.test',
      'assets',
      'resources.acceptance.ts',
    );
    const planFile = join(testDir, 'plan.json');

    // a single sandbox root that mirrors the real /etc layout, so apply mutates a
    // temp hosts file + systemd dir (no sudo). the wish file derives both paths
    // from ACCEPTANCE_ROOT as ROOT/etc/hosts and ROOT/etc/systemd/system.
    const sandboxRoot = join(testDir, 'root');
    const hostsPath = join(sandboxRoot, 'etc', 'hosts');
    const systemdDir = join(sandboxRoot, 'etc', 'systemd', 'system');

    // env passed to the declastruct CLI subprocess so the wish file (re-imported
    // at plan/apply time) configures the provider with the sandbox root
    const acceptanceEnv = {
      ...process.env,
      ACCEPTANCE_ROOT: sandboxRoot,
    };

    beforeEach(() => {
      // reset to a clean, isolated sandbox state for each test
      rmSync(testDir, { recursive: true, force: true });
      mkdirSync(systemdDir, { recursive: true });
      writeFileSync(hostsPath, '');
    });

    afterAll(() => {
      // cleanup temp dir
      rmSync(testDir, { recursive: true, force: true });
    });

    when('generating a plan via declastruct CLI', () => {
      then('creates a valid plan file', async () => {
        /**
         * .what = validates declastruct plan command produces valid JSON output
         * .why = ensures CLI can parse resources file and generate plan
         */

        // execute declastruct plan command
        execSync(
          `npx declastruct plan --wish ${resourcesFile} --into ${planFile}`,
          { stdio: 'inherit', env: acceptanceEnv },
        );

        // verify plan file exists
        const planExists = existsSync(planFile);
        expect(planExists).toBe(true);

        // verify plan contains expected structure
        const plan = JSON.parse(readFileSync(planFile, 'utf-8'));
        expect(plan).toHaveProperty('changes');
        expect(Array.isArray(plan.changes)).toBe(true);
      });

      then('plan includes host alias and port alias resources', async () => {
        /**
         * .what = validates plan includes all declared resources
         * .why = ensures declastruct correctly processes resource declarations
         */

        // execute plan generation
        execSync(
          `npx declastruct plan --wish ${resourcesFile} --into ${planFile}`,
          { stdio: 'inherit', env: acceptanceEnv },
        );

        // parse plan
        const plan = JSON.parse(readFileSync(planFile, 'utf-8'));

        // verify resources
        const hostAliasResource: DeclastructChange = plan.changes.find(
          (r: DeclastructChange) =>
            r.forResource.class === 'DeclaredUnixHostAlias',
        );
        const portAliasResource: DeclastructChange = plan.changes.find(
          (r: DeclastructChange) =>
            r.forResource.class === 'DeclaredUnixPortAlias',
        );

        expect(hostAliasResource).toBeDefined();
        expect(hostAliasResource.forResource.slug).toContain(
          'declastruct-unix-network.test.local',
        );
        expect(portAliasResource).toBeDefined();
        expect(portAliasResource.forResource.slug).toContain('59432');
      });
    });

    when('applying a plan via declastruct CLI', () => {
      then('executes changes and verifies resources exist', async () => {
        /**
         * .what = validates declastruct apply command works with unix network provider
         * .why = ensures end-to-end workflow from plan to reality
         * .note = mutates the temp hosts file + systemd dir (no sudo needed)
         */

        // generate plan
        execSync(
          `npx declastruct plan --wish ${resourcesFile} --into ${planFile}`,
          { stdio: 'inherit', env: acceptanceEnv },
        );

        // apply plan
        execSync(`npx declastruct apply --plan ${planFile}`, {
          stdio: 'inherit',
          env: acceptanceEnv,
        });

        // verify resources exist via provider (against the same temp paths)
        const provider = getDeclastructUnixNetworkProvider(
          { repo: { etcHostsPath: hostsPath, systemdUnitsDir: systemdDir } },
          { log },
        );

        const hostAlias =
          await provider.daos.DeclaredUnixHostAlias.get.one.byUnique(
            {
              via: '/etc/hosts',
              from: 'declastruct-unix-network.test.local',
            },
            provider.context,
          );

        expect(hostAlias).toBeDefined();
        expect(hostAlias!.from).toBe('declastruct-unix-network.test.local');
        expect(hostAlias!.into).toBe('127.0.0.1');
      });

      then('is idempotent - a re-declared state applies safely', async () => {
        /**
         * .what = validates that a re-declaration of the same desired state applies safely
         * .why = ensures declastruct operations follow idempotency requirements
         * .note = declastruct rejects a stale plan (state drifts after the first
         *         apply), so idempotency is verified via a fresh plan against
         *         post-apply state: the second plan is an already-satisfied no-op,
         *         which apply must accept without error.
         */

        // generate plan and apply it the first time
        execSync(
          `npx declastruct plan --wish ${resourcesFile} --into ${planFile}`,
          { stdio: 'inherit', env: acceptanceEnv },
        );
        execSync(`npx declastruct apply --plan ${planFile}`, {
          stdio: 'inherit',
          env: acceptanceEnv,
        });

        // regenerate the plan against post-apply state (an already-satisfied no-op)
        execSync(
          `npx declastruct plan --wish ${resourcesFile} --into ${planFile}`,
          { stdio: 'inherit', env: acceptanceEnv },
        );

        // apply the fresh plan a second time - should succeed without errors
        execSync(`npx declastruct apply --plan ${planFile}`, {
          stdio: 'inherit',
          env: acceptanceEnv,
        });
      });
    });
  });
});
