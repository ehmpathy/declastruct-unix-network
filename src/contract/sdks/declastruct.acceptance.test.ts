import { type DeclastructChange, DeclastructChangeAction } from 'declastruct';
import { given, then, when } from 'test-fns';

import { getDeclastructUnixNetworkProvider } from '@src/domain.operations/provider/getDeclastructUnixNetworkProvider';
import { delUnixSshAlias } from '@src/domain.operations/sshAlias/delUnixSshAlias';
import { delUnixSshKeypair } from '@src/domain.operations/sshKeypair/delUnixSshKeypair';

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
 * .note = runs against an isolated sandbox root (temp /etc/hosts + temp systemd dir),
 *         so no sudo is required. the sandbox root is passed to the declastruct CLI
 *         subprocess via the ACCEPTANCE_ROOT env var, which resources.acceptance.ts
 *         reads to derive ROOT/etc/hosts and ROOT/etc/systemd/system for the provider.
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
    const sshConfigPath = join(sandboxRoot, '.ssh', 'config');
    const sshKeysDir = join(sandboxRoot, '.ssh');

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
      mkdirSync(sshKeysDir, { recursive: true });
      writeFileSync(hostsPath, '');
      writeFileSync(sshConfigPath, '');
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

      then(
        'plan includes host, port, ssh keypair, and ssh alias resources',
        async () => {
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
          const sshKeypairResource: DeclastructChange = plan.changes.find(
            (r: DeclastructChange) =>
              r.forResource.class === 'DeclaredUnixSshKeypair',
          );
          const sshAliasResource: DeclastructChange = plan.changes.find(
            (r: DeclastructChange) =>
              r.forResource.class === 'DeclaredUnixSshAlias',
          );

          expect(hostAliasResource).toBeDefined();
          expect(hostAliasResource.forResource.slug).toContain(
            'declastruct-unix-network.test.local',
          );
          expect(portAliasResource).toBeDefined();
          expect(portAliasResource.forResource.slug).toContain('59432');
          expect(sshKeypairResource).toBeDefined();
          expect(sshKeypairResource.forResource.class).toBe(
            'DeclaredUnixSshKeypair',
          );
          expect(sshAliasResource).toBeDefined();
          expect(sshAliasResource.forResource.class).toBe(
            'DeclaredUnixSshAlias',
          );

          // snapshot the deterministic plan structure (class + action per
          // change), so drift in plan shape is caught. the raw plan is not
          // snapshotted directly: it embeds the non-deterministic sandbox path
          // (ACCEPTANCE_ROOT) in the keypair uri.
          // note: order is preserved (not sorted) - declastruct plans in
          // declared array order, so the keypair appears before the alias that
          // refs it, which the snapshot must reflect.
          expect(
            plan.changes.map((r: DeclastructChange) => ({
              class: r.forResource.class,
              action: r.action,
            })),
          ).toMatchSnapshot();
        },
      );
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
          {
            repo: {
              etcHostsPath: hostsPath,
              systemdUnitsDir: systemdDir,
              sshConfigPath,
              sshKeysDir,
            },
          },
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

        // verify the port alias (systemd-socat unit) was applied
        const portAlias =
          await provider.daos.DeclaredUnixPortAlias.get.one.byUnique(
            {
              via: 'systemd-socat',
              from: { host: '127.0.0.1', port: 59432 },
            },
            provider.context,
          );

        expect(portAlias).toBeDefined();
        expect(portAlias!.from.port).toBe(59432);
        expect(portAlias!.into.port).toBe(59433);

        // verify the ssh keypair was minted into the sandbox
        const sshKeypair =
          await provider.daos.DeclaredUnixSshKeypair.get.one.byUnique(
            {
              via: 'ssh-keygen',
              uri: join(sshKeysDir, 'declastruct-unix-network.test'),
            },
            provider.context,
          );

        expect(sshKeypair).toBeDefined();
        expect(sshKeypair!.algorithm).toBe('ed25519');
        expect(sshKeypair!.publicKey).toContain('ssh-ed25519');

        // verify the ssh alias block was written into the sandbox config
        const sshAlias =
          await provider.daos.DeclaredUnixSshAlias.get.one.byUnique(
            {
              via: '~/.ssh/config',
              from: 'declastruct-unix-network.test',
            },
            provider.context,
          );

        expect(sshAlias).toBeDefined();
        expect(sshAlias!.from).toBe('declastruct-unix-network.test');
        expect(sshAlias!.into.port).toBe(2222);
        expect(sshAlias!.user).toBe('ec2-user');

        // snapshot the deterministic shape of the applied resources at the
        // acceptance boundary, so reviewers can vibecheck the applied state.
        // note: keypair uri/publicKey and alias key.uri are non-deterministic
        // (sandbox path + random key material), so snapshot only the stable
        // identity fields. key.via is included so reviewers can confirm the
        // keypair reference is wired end-to-end (its uri is the sandbox path).
        expect({
          hostAlias: {
            via: hostAlias!.via,
            from: hostAlias!.from,
            into: hostAlias!.into,
          },
          portAlias: {
            via: portAlias!.via,
            from: portAlias!.from,
            into: portAlias!.into,
          },
          keypair: {
            via: sshKeypair!.via,
            algorithm: sshKeypair!.algorithm,
            comment: sshKeypair!.comment,
            publicKeyAlgo: sshKeypair!.publicKey?.split(' ')[0],
          },
          alias: {
            via: sshAlias!.via,
            from: sshAlias!.from,
            into: sshAlias!.into,
            user: sshAlias!.user,
            key: { via: sshAlias!.key.via },
          },
        }).toMatchSnapshot();
      });

      then('is idempotent - a re-declared state applies safely', async () => {
        /**
         * .what = validates that a re-declaration of the same desired state applies safely
         * .why = ensures declastruct operations follow idempotency requirements
         * .note = idempotency here is a property of the DESIRED STATE, not of a
         *         single plan artifact. declastruct deliberately rejects a stale
         *         plan: once the first apply mutates reality, the plan's captured
         *         before-state no longer matches, so a re-apply of the SAME plan
         *         is rejected by design (a safety guard against drift). a re-apply
         *         of the SAME PLAN twice is therefore an unsupported usage, not a
         *         valid idempotency contract. the real idempotency guarantee is:
         *         a re-declaration of the same desired state is always safe. we
         *         verify it the way declastruct intends - a fresh plan against
         *         post-apply state, which yields an already-satisfied no-op that
         *         apply must accept without error.
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

        // the fresh plan must be a pure no-op: every change is a KEEP. this is
        // the real idempotency proof - a re-apply that silently mutated again
        // would show CREATE/UPDATE actions here and this assertion would fail.
        const idempotentPlan = JSON.parse(readFileSync(planFile, 'utf-8'));
        const nonKeepChanges = idempotentPlan.changes
          .filter(
            (r: DeclastructChange) => r.action !== DeclastructChangeAction.KEEP,
          )
          .map((r: DeclastructChange) => ({
            class: r.forResource.class,
            action: r.action,
          }));
        expect(nonKeepChanges).toEqual([]);

        // snapshot the deterministic no-op plan structure for review
        // (order preserved - reflects declared/execution order)
        expect(
          idempotentPlan.changes.map((r: DeclastructChange) => ({
            class: r.forResource.class,
            action: r.action,
          })),
        ).toMatchSnapshot();

        // apply the fresh plan a second time - should succeed without errors
        execSync(`npx declastruct apply --plan ${planFile}`, {
          stdio: 'inherit',
          env: acceptanceEnv,
        });
      });
    });

    when('a del is issued via the declastruct provider', () => {
      then(
        'del removes the ssh alias + keypair and get returns null',
        async () => {
          /**
           * .what = validates the del* operations remove an applied resource
           * .why = del* are part of the public sdk surface, so the acceptance
           *        journey must cover set -> verify exists -> del -> verify null
           * .note = the private key uri the alias references
           */
          const keyUri = join(sshKeysDir, 'declastruct-unix-network.test');

          // apply the declared state first, so a resource exists to delete
          execSync(
            `npx declastruct plan --wish ${resourcesFile} --into ${planFile}`,
            { stdio: 'inherit', env: acceptanceEnv },
          );
          execSync(`npx declastruct apply --plan ${planFile}`, {
            stdio: 'inherit',
            env: acceptanceEnv,
          });

          const provider = getDeclastructUnixNetworkProvider(
            {
              repo: {
                etcHostsPath: hostsPath,
                systemdUnitsDir: systemdDir,
                sshConfigPath,
                sshKeysDir,
              },
            },
            { log },
          );

          // sanity: both resources exist after apply
          const aliasBefore =
            await provider.daos.DeclaredUnixSshAlias.get.one.byUnique(
              { via: '~/.ssh/config', from: 'declastruct-unix-network.test' },
              provider.context,
            );
          expect(aliasBefore).toBeDefined();

          const keypairBefore =
            await provider.daos.DeclaredUnixSshKeypair.get.one.byUnique(
              { via: 'ssh-keygen', uri: keyUri },
              provider.context,
            );
          expect(keypairBefore).toBeDefined();

          // snapshot the applied before-state shapes, so the resource structure
          // is visible for review before deletion (mirrors the apply journey;
          // key.uri + keypair uri/publicKey are the non-deterministic sandbox
          // path + random key material, so only stable fields are projected)
          expect({
            alias: {
              via: aliasBefore!.via,
              from: aliasBefore!.from,
              into: aliasBefore!.into,
              user: aliasBefore!.user,
              key: { via: aliasBefore!.key.via },
            },
            keypair: {
              via: keypairBefore!.via,
              algorithm: keypairBefore!.algorithm,
              comment: keypairBefore!.comment,
              publicKeyAlgo: keypairBefore!.publicKey?.split(' ')[0],
            },
          }).toMatchSnapshot();

          // delete both via the provider operations
          await delUnixSshAlias(
            {
              ref: {
                via: '~/.ssh/config',
                from: 'declastruct-unix-network.test',
              },
            },
            provider.context,
          );
          await delUnixSshKeypair(
            { ref: { via: 'ssh-keygen', uri: keyUri } },
            provider.context,
          );

          // verify both are gone
          const aliasAfter =
            await provider.daos.DeclaredUnixSshAlias.get.one.byUnique(
              { via: '~/.ssh/config', from: 'declastruct-unix-network.test' },
              provider.context,
            );
          expect(aliasAfter).toBeNull();

          const keypairAfter =
            await provider.daos.DeclaredUnixSshKeypair.get.one.byUnique(
              { via: 'ssh-keygen', uri: keyUri },
              provider.context,
            );
          expect(keypairAfter).toBeNull();
        },
      );
    });
  });
});
