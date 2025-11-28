import type { ContextLogTrail } from 'simple-log-methods';
import { given, when, then } from 'test-fns';

import { getSampleUnixNetworkContext } from '../../.test/assets/getSampleUnixNetworkContext';
import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { UnixPortEndpoint } from '../../domain.objects/DeclaredUnixPortAlias';
import { getOneUnixPortAlias } from './getOneUnixPortAlias';

const context: ContextUnixNetwork & ContextLogTrail = {
  log: console,
  ...getSampleUnixNetworkContext(),
};

/**
 * .what = integration tests for getUnixPortAlias
 * .why = validates real systemd service discovery
 * .note = these tests query actual systemd - no mocking
 */
describe('getOneUnixPortAlias', () => {
  given('the systemd services on this system', () => {
    when('querying for a non-existent port alias', () => {
      then('returns null', async () => {
        const result = await getOneUnixPortAlias(
          {
            by: {
              unique: {
                via: 'systemd-socat',
                from: new UnixPortEndpoint({ host: '127.0.0.1', port: 99999 }),
              },
            },
          },
          context,
        );

        expect(result).toBeNull();
      });
    });
  });
});
