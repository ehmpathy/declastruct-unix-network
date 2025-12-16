import { execSync } from 'child_process';
import type { DeclastructChange } from 'declastruct';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { given, then, when } from 'test-fns';

import { getDeclastructUnixNetworkProvider } from '@src/domain.operations/provider/getDeclastructUnixNetworkProvider';

const log = console;

/**
 * .what = acceptance tests for declastruct CLI workflow with unix network provider
 * .why = validates end-to-end usage of declastruct-unix-network with declastruct CLI
 * .note = requires sudo access - run with `sudo -E npm run test:acceptance`
 */
describe('declastruct CLI workflow', () => {
  given('a declastruct resources file', () => {
    const testDir = join(
      __dirname,
      '.test',
      '.temp',
      'acceptance',
      `run.${new Date().toISOString().replace(/:/g, '-')}`,
    );
    const resourcesFile = join(
      __dirname,
      '.test',
      'assets',
      'resources.acceptance.ts',
    );
    const planFile = join(testDir, 'plan.json');

    beforeEach(() => {
      // ensure clean test directory
      mkdirSync(testDir, { recursive: true });
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
          { stdio: 'inherit', env: process.env },
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
          { stdio: 'inherit', env: process.env },
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
         * .note = requires sudo - this test modifies /etc/hosts and creates systemd services
         */

        // generate plan
        execSync(
          `npx declastruct plan --wish ${resourcesFile} --into ${planFile}`,
          { stdio: 'inherit', env: process.env },
        );

        // apply plan
        execSync(`npx declastruct apply --plan ${planFile}`, {
          stdio: 'inherit',
          env: process.env,
        });

        // verify resources exist via provider
        const provider = getDeclastructUnixNetworkProvider({}, { log });

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

      then('is idempotent - applying same plan twice succeeds', async () => {
        /**
         * .what = validates applying the same plan multiple times is safe
         * .why = ensures declastruct operations follow idempotency requirements
         */

        // generate plan
        execSync(
          `npx declastruct plan --wish ${resourcesFile} --into ${planFile}`,
          { stdio: 'inherit', env: process.env },
        );

        // apply plan first time
        execSync(`npx declastruct apply --plan ${planFile}`, {
          stdio: 'inherit',
          env: process.env,
        });

        // apply plan second time - should succeed without errors
        execSync(`npx declastruct apply --plan ${planFile}`, {
          stdio: 'inherit',
          env: process.env,
        });
      });
    });
  });
});
