import type { DeclastructProvider } from 'declastruct';
import type { DomainEntity } from 'domain-objects';

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  DeclaredUnixPortAlias,
  DeclaredUnixSshAlias,
  DeclaredUnixSshKeypair,
  getDeclastructUnixNetworkProvider,
  UnixEndpoint,
} from '../../src/contract/sdks';

/**
 * .what = the sandbox root the preview mode writes into
 * .why = a real dir under this provision folder that mirrors the real layout
 *        (etc/systemd/system + .ssh), so a preview exercises the full
 *        filesystem lifecycle with no sudo and no systemctl side effects
 */
const SANDBOX_ROOT = join(__dirname, '.temp', 'root');

/**
 * .what = the target the demo provisions against: provider repo paths + key uri
 * .why = dogfood the full lifecycle against a real target by default, the same
 *        way declastruct-aws provisions a real demo account:
 *        - real host (default): undefined repo => the provider uses the real
 *          `/etc/systemd/system` + `~/.ssh` (needs sudo for the socat unit;
 *          mints a real key + writes a real `~/.ssh/config` block)
 *        - sandbox (opt-in): set OS_DEMO_SANDBOX=true for a no-sudo preview that
 *          writes all artifacts under SANDBOX_ROOT (no systemctl side effects)
 */
const getDemoTarget = (): {
  repo?: { systemdUnitsDir: string; sshConfigPath: string; sshKeysDir: string };
  keyUri: string;
} => {
  // sandbox opt-in: a no-sudo preview against a temp root under this folder
  if (process.env.OS_DEMO_SANDBOX === 'true') {
    const systemdUnitsDir = join(SANDBOX_ROOT, 'etc', 'systemd', 'system');
    const sshKeysDir = join(SANDBOX_ROOT, '.ssh');
    // ensure the dirs exist (on a real host these always exist; the sandbox
    // root is a demo harness we must create ourselves - and the socat sdk
    // writes its unit via `tee` with no prior mkdir)
    mkdirSync(systemdUnitsDir, { recursive: true });
    mkdirSync(sshKeysDir, { recursive: true });
    return {
      repo: {
        systemdUnitsDir,
        sshConfigPath: join(sshKeysDir, 'config'),
        sshKeysDir,
      },
      keyUri: join(sshKeysDir, 'declastruct-unix-network.demo'),
    };
  }

  // real host (default): undefined repo => provider uses the real system paths;
  // the key uri is `~`-based (the sdks expand it to the real home dir)
  return { keyUri: '~/.ssh/declastruct-unix-network.demo' };
};

const target = getDemoTarget();

/**
 * .what = declastruct provider for the unix-network demo
 * .why = dogfood our own package - the same provider consumers import
 * @see readme.md for prereqs and apply instructions
 */
export const getProviders = async (): Promise<DeclastructProvider[]> => [
  getDeclastructUnixNetworkProvider(
    { repo: target.repo },
    {
      log: {
        info: () => {},
        debug: () => {},
        warn: console.warn,
        error: console.error,
      },
    },
  ),
];

/**
 * .what = demo unix-network resources: a port alias, an ssh keypair, and an
 *         ssh alias that references the keypair
 * .why = dogfood every resource this package manages, end-to-end:
 *        - DeclaredUnixPortAlias: a socat forward 127.0.0.1:9432 -> :8432
 *        - DeclaredUnixSshKeypair: a minted ed25519 key (findsert-only)
 *        - DeclaredUnixSshAlias: an `~/.ssh/config` Host block that uses the key
 * .note = loopback ports + a demo-scoped key name, so it is safe on any host
 */
export const getResources = async (): Promise<DomainEntity<any>[]> => {
  // a socat port forward: expose a local proxy port, route to a downstream port
  const portAliasDemo = DeclaredUnixPortAlias.as({
    via: 'systemd-socat',
    from: UnixEndpoint.as({ host: '127.0.0.1', port: 9432 }),
    into: UnixEndpoint.as({ host: '127.0.0.1', port: 8432 }),
  });

  // an ed25519 keypair minted at the demo uri (findsert-only, never overwritten)
  const keypairDemo = DeclaredUnixSshKeypair.as({
    via: 'ssh-keygen',
    uri: target.keyUri,
    algorithm: 'ed25519',
    comment: 'declastruct-unix-network.demo',
  });

  // an ssh alias `ssh declastruct-unix-network.demo` -> localhost:2222 as ec2-user,
  // authenticated with the keypair above (its private uri becomes IdentityFile)
  const sshAliasDemo = DeclaredUnixSshAlias.as({
    via: '~/.ssh/config',
    from: 'declastruct-unix-network.demo',
    into: UnixEndpoint.as({ host: 'localhost', port: 2222 }),
    user: 'ec2-user',
    key: { via: 'ssh-keygen', uri: target.keyUri },
  });

  // apply order: keypair before the alias that refs it (declared array order)
  return [portAliasDemo, keypairDemo, sshAliasDemo];
};
