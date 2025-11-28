import type { ContextLogTrail } from 'simple-log-methods';
import { given, when, then } from 'test-fns';

import { getSampleUnixNetworkContext } from '../../.test/assets/getSampleUnixNetworkContext';
import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { getAllUnixPortAliases } from './getAllUnixPortAliases';

const context: ContextUnixNetwork & ContextLogTrail = {
  log: console,
  ...getSampleUnixNetworkContext(),
};

/**
 * .what = integration tests for getUnixPortAliases
 * .why = validates real systemd service discovery
 * .note = these tests query actual systemd - no mocking
 */
describe('getAllUnixPortAliases', () => {
  given('the systemd services on this system', () => {
    when('listing all port aliases', () => {
      then('returns an array (may be empty if none exist)', async () => {
        const aliases = await getAllUnixPortAliases({}, context);

        // should return an array (could be empty if no declastruct services exist)
        expect(Array.isArray(aliases)).toBe(true);

        // if any exist, verify they have expected structure
        for (const alias of aliases) {
          expect(alias.via).toBe('systemd-socat');
          expect(alias.from).toBeDefined();
          expect(alias.into).toBeDefined();
        }
      });
    });
  });
});
