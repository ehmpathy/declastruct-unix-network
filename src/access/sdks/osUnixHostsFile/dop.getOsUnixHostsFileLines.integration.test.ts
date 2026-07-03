import { given, then, useBeforeAll, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getOsUnixHostsFileEntries } from './dop.getOsUnixHostsFileLines';

/**
 * .what = creates an isolated temp hosts file for a single test case
 * .why = ensures complete test isolation across ci environments; each given
 *        gets its own dir + file, so cases never stomp on shared state
 */
const createIsolatedHostsFile = async (
  suffix: string,
  content: string,
): Promise<{ dir: string; hostsPath: string }> => {
  const dir = join(
    tmpdir(),
    'declastruct-unix-network-test',
    `${Date.now()}-${suffix}`,
  );
  await mkdir(dir, { recursive: true });
  const hostsPath = join(dir, 'hosts');
  await writeFile(hostsPath, content);
  return { dir, hostsPath };
};

describe('getOsUnixHostsFileEntries integration', () => {
  given('a temp hosts file with sample content', () => {
    const scene = useBeforeAll(async () => {
      const { dir, hostsPath } = await createIsolatedHostsFile(
        'sample',
        `# Sample hosts file
127.0.0.1\tlocalhost
::1\tlocalhost\tip6-localhost
192.168.1.100\tmyhost.local\t# managed by declastruct
# Another comment
10.0.0.1\tserver1\tserver2
`,
      );
      const testContext = getSampleUnixNetworkContext({
        repo: { etcHostsPath: hostsPath },
      });
      return { dir, testContext };
    });

    afterAll(async () => {
      await rm(scene.dir, { recursive: true, force: true });
    });

    when('reading entries', () => {
      then('parses all valid entries', async () => {
        const entries = await getOsUnixHostsFileEntries({}, scene.testContext);

        expect(entries).toHaveLength(4);
        expect(entries[0]).toEqual({
          ip: '127.0.0.1',
          hostnames: ['localhost'],
          comment: undefined,
        });
        expect(entries[1]).toEqual({
          ip: '::1',
          hostnames: ['localhost', 'ip6-localhost'],
          comment: undefined,
        });
        expect(entries[2]).toEqual({
          ip: '192.168.1.100',
          hostnames: ['myhost.local'],
          comment: 'managed by declastruct',
        });
        expect(entries[3]).toEqual({
          ip: '10.0.0.1',
          hostnames: ['server1', 'server2'],
          comment: undefined,
        });
      });
    });
  });

  given('an empty hosts file', () => {
    const scene = useBeforeAll(async () => {
      const { dir, hostsPath } = await createIsolatedHostsFile('empty', '');
      const testContext = getSampleUnixNetworkContext({
        repo: { etcHostsPath: hostsPath },
      });
      return { dir, testContext };
    });

    afterAll(async () => {
      await rm(scene.dir, { recursive: true, force: true });
    });

    when('reading entries', () => {
      then('returns empty array', async () => {
        const entries = await getOsUnixHostsFileEntries({}, scene.testContext);

        expect(entries).toHaveLength(0);
      });
    });
  });

  given('a hosts file with only comments', () => {
    const scene = useBeforeAll(async () => {
      const { dir, hostsPath } = await createIsolatedHostsFile(
        'comments',
        `# This is a comment
# Another comment
`,
      );
      const testContext = getSampleUnixNetworkContext({
        repo: { etcHostsPath: hostsPath },
      });
      return { dir, testContext };
    });

    afterAll(async () => {
      await rm(scene.dir, { recursive: true, force: true });
    });

    when('reading entries', () => {
      then('returns empty array', async () => {
        const entries = await getOsUnixHostsFileEntries({}, scene.testContext);

        expect(entries).toHaveLength(0);
      });
    });
  });
});
