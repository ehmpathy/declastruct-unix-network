import type { ContextLogTrail } from 'simple-log-methods';
import { given, when, then } from 'test-fns';

import { getSampleUnixNetworkContext } from '../../.test/assets/getSampleUnixNetworkContext';
import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclaredUnixHostAlias } from '../../domain.objects/DeclaredUnixHostAlias';
import { getAllUnixHostAliases } from './getUnixHostAliases';

const context: ContextUnixNetwork & ContextLogTrail = {
  log: console,
  ...getSampleUnixNetworkContext(),
};

/**
 * .what = integration tests for getAllUnixHostAliases
 * .why = validates real /etc/hosts file reading
 * .note = these tests read the actual /etc/hosts file - no mocking
 */
describe('getAllUnixHostAliases', () => {
  given('the /etc/hosts file on this system', () => {
    when('listing all aliases', () => {
      then('returns at least localhost', async () => {
        const aliases = await getAllUnixHostAliases({}, context);

        expect(aliases.length).toBeGreaterThan(0);

        const localhost = aliases.find(
          (a: DeclaredUnixHostAlias) => a.from === 'localhost',
        );
        expect(localhost).toBeDefined();
      });
    });
  });
});
