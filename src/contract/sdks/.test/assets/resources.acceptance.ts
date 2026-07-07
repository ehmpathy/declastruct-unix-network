import { join } from 'node:path';

import { UnexpectedCodePathError } from 'helpful-errors';

import {
  DeclaredUnixHostAlias,
  DeclaredUnixPortAlias,
  DeclaredUnixSshAlias,
  DeclaredUnixSshKeypair,
  UnixEndpoint,
  getDeclastructUnixNetworkProvider,
} from '@src/contract/sdks';

/**
 * .what = resolves the repo paths the acceptance provider should target
 * .why = enforces an explicit choice between sandbox and real-host, with NO
 *        silent fallback to the real system:
 *        - sandbox (default): requires ACCEPTANCE_ROOT; the real /etc + ~/.ssh
 *          paths are mirrored under it, so the sandbox matches the production
 *          layout. throws loudly if absent.
 *        - real host (opt-in): set ACCEPTANCE_AGAINST_HOST=true to target the
 *          real /etc + ~/.ssh (ci-only host test)
 * .note = the fail-loud throw prevents the footgun where an absent env var would
 *         quietly touch a developer's real files.
 */
const getAcceptanceRepoPaths = ():
  | {
      etcHostsPath: string;
      systemdUnitsDir: string;
      sshConfigPath: string;
      sshKeysDir: string;
    }
  | undefined => {
  // real-host opt-in: undefined repo => provider defaults to the real system paths
  if (process.env.ACCEPTANCE_AGAINST_HOST === 'true') return undefined;

  // sandbox (default): a single root, no silent fallback; mirror the real layout
  const root =
    process.env.ACCEPTANCE_ROOT ??
    UnexpectedCodePathError.throw(
      'acceptance sandbox requires ACCEPTANCE_ROOT; set it, or set ACCEPTANCE_AGAINST_HOST=true to target the real host',
    );
  return {
    etcHostsPath: join(root, 'etc', 'hosts'),
    systemdUnitsDir: join(root, 'etc', 'systemd', 'system'),
    sshConfigPath: join(root, '.ssh', 'config'),
    sshKeysDir: join(root, '.ssh'),
  };
};

/**
 * .what = the private key uri the acceptance keypair/alias share
 * .why = keypair and alias must reference the same path; sandbox vs real-host
 *        determines where that path lives
 */
const getAcceptanceKeyUri = (): string => {
  if (process.env.ACCEPTANCE_AGAINST_HOST === 'true')
    return '~/.ssh/declastruct-unix-network.test';
  const root =
    process.env.ACCEPTANCE_ROOT ??
    UnexpectedCodePathError.throw('acceptance sandbox requires ACCEPTANCE_ROOT');
  return join(root, '.ssh', 'declastruct-unix-network.test');
};

/**
 * .what = provider configuration for acceptance tests
 * .why = enables declastruct CLI to interact with unix network resources
 * .note = targets an isolated sandbox by default; opt into the real host via
 *         ACCEPTANCE_AGAINST_HOST=true. never silently touches the real system.
 */
export const getProviders = async () => [
  getDeclastructUnixNetworkProvider(
    { repo: getAcceptanceRepoPaths() },
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
 * .what = resource declarations for acceptance tests
 * .why = defines desired state of unix network resources for tests
 * .note = uses test-specific hostnames, ports, and key paths to avoid conflicts
 */
export const getResources = async () => {
  const hostAlias = DeclaredUnixHostAlias.as({
    via: '/etc/hosts',
    from: 'declastruct-unix-network.test.local',
    into: '127.0.0.1',
  });

  const portAlias = DeclaredUnixPortAlias.as({
    via: 'systemd-socat',
    from: UnixEndpoint.as({ host: '127.0.0.1', port: 59432 }),
    into: UnixEndpoint.as({ host: '127.0.0.1', port: 59433 }),
  });

  const keyUri = getAcceptanceKeyUri();

  const keypair = DeclaredUnixSshKeypair.as({
    via: 'ssh-keygen',
    uri: keyUri,
    algorithm: 'ed25519',
    comment: 'declastruct-unix-network.test',
  });

  const sshAlias = DeclaredUnixSshAlias.as({
    via: '~/.ssh/config',
    from: 'declastruct-unix-network.test',
    into: UnixEndpoint.as({ host: 'localhost', port: 2222 }),
    user: 'ec2-user',
    key: { via: 'ssh-keygen', uri: keyUri },
  });

  // apply order: keypair before the alias that refs it
  return [hostAlias, portAlias, keypair, sshAlias];
};
