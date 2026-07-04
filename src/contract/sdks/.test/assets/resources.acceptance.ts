import { join } from 'node:path';

import { UnexpectedCodePathError } from 'helpful-errors';

import {
  DeclaredUnixHostAlias,
  DeclaredUnixPortAlias,
  UnixPortEndpoint,
  getDeclastructUnixNetworkProvider,
} from '@src/contract/sdks';

/**
 * .what = resolves the repo paths the acceptance provider should target
 * .why = enforces an explicit choice between sandbox and real-host, with NO
 *        silent fallback to the real system:
 *        - sandbox (default): requires ACCEPTANCE_ROOT; the real /etc paths are
 *          mirrored under it (ACCEPTANCE_ROOT/etc/hosts, .../etc/systemd/system),
 *          so the sandbox matches the production layout. throws loudly if absent.
 *        - real host (opt-in): set ACCEPTANCE_AGAINST_HOST=true to target the
 *          real /etc/hosts + systemd (requires sudo; ci-only host test)
 * .note = the fail-loud throw prevents the footgun where an absent env var would
 *         quietly `sudo tee /etc/hosts` on a developer's real machine.
 */
const getAcceptanceRepoPaths = ():
  | { etcHostsPath: string; systemdUnitsDir: string }
  | undefined => {
  // real-host opt-in: undefined repo => provider defaults to the real system paths
  if (process.env.ACCEPTANCE_AGAINST_HOST === 'true') return undefined;

  // sandbox (default): a single root, no silent fallback; mirror the real /etc layout
  const root =
    process.env.ACCEPTANCE_ROOT ??
    UnexpectedCodePathError.throw(
      'acceptance sandbox requires ACCEPTANCE_ROOT; set it, or set ACCEPTANCE_AGAINST_HOST=true to target the real host',
    );
  return {
    etcHostsPath: join(root, 'etc', 'hosts'),
    systemdUnitsDir: join(root, 'etc', 'systemd', 'system'),
  };
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
        info: () => { },
        debug: () => { },
        warn: console.warn,
        error: console.error,
      },
    },
  ),
];

/**
 * .what = resource declarations for acceptance tests
 * .why = defines desired state of unix network resources for testing
 * .note = uses test-specific hostnames and ports to avoid conflicts
 */
export const getResources = async () => {
  const hostAlias = DeclaredUnixHostAlias.as({
    via: '/etc/hosts',
    from: 'declastruct-unix-network.test.local',
    into: '127.0.0.1',
  });

  const portAlias = DeclaredUnixPortAlias.as({
    via: 'systemd-socat',
    from: UnixPortEndpoint.as({ host: '127.0.0.1', port: 59432 }),
    into: UnixPortEndpoint.as({ host: '127.0.0.1', port: 59433 }),
  });

  return [hostAlias, portAlias];
};
