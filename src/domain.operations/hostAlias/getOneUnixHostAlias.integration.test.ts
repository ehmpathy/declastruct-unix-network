import type { ContextLogTrail } from 'simple-log-methods';
import { given, then, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '../../.test/assets/getSampleUnixNetworkContext';
import type { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { getOneUnixHostAlias } from './getOneUnixHostAlias';

const context: ContextUnixNetwork & ContextLogTrail = {
  log: console,
  ...getSampleUnixNetworkContext(),
};

/**
 * .what = integration tests for getUnixHostAlias
 * .why = validates real /etc/hosts file reading
 * .note = these tests read the actual /etc/hosts file - no mocking
 */
describe('getOneUnixHostAlias', () => {
  given('the /etc/hosts file on this system', () => {
    when('querying for localhost', () => {
      then('returns the localhost entry', async () => {
        const result = await getOneUnixHostAlias(
          {
            by: {
              unique: {
                via: '/etc/hosts',
                from: 'localhost',
              },
            },
          },
          context,
        );

        // localhost should always exist
        expect(result).not.toBeNull();
        expect(result!.from).toBe('localhost');
        expect(result!.via).toBe('/etc/hosts');
        // ip could be 127.0.0.1 or ::1 depending on system
        expect(result!.into).toBeDefined();
      });
    });

    when('querying for a non-existent hostname', () => {
      then('returns null', async () => {
        const result = await getOneUnixHostAlias(
          {
            by: {
              unique: {
                via: '/etc/hosts',
                from: 'this-hostname-definitely-does-not-exist-12345.local',
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
