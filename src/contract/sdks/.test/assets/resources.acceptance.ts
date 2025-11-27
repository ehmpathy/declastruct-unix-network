import {
  DeclaredUnixHostAlias,
  DeclaredUnixPortAlias,
  UnixPortEndpoint,
  getDeclastructUnixNetworkProvider,
} from '../../../../../dist/contract/sdks';

/**
 * .what = provider configuration for acceptance tests
 * .why = enables declastruct CLI to interact with unix network resources
 */
export const getProviders = async () => [
  getDeclastructUnixNetworkProvider(
    {},
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
