import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { given, when, then } from 'test-fns';

import { getSampleUnixNetworkContext } from '../../../.test/assets/getSampleUnixNetworkContext';
import { getOsUnixHostsFileEntries } from './dop.getOsUnixHostsFileLines';

const TEST_TEMP_DIR = join(__dirname, '.test', '.temp');

describe('getOsUnixHostsFileEntries integration', () => {
  const tempHostsPath = join(TEST_TEMP_DIR, 'hosts');
  const testContext = getSampleUnixNetworkContext({
    repo: { etcHostsPath: tempHostsPath },
  });

  beforeAll(async () => {
    await mkdir(TEST_TEMP_DIR, { recursive: true });
  });

  afterAll(async () => {
    await rm(TEST_TEMP_DIR, { recursive: true, force: true });
  });

  given('a temp hosts file with sample content', () => {
    beforeAll(async () => {
      await writeFile(
        tempHostsPath,
        `# Sample hosts file
127.0.0.1\tlocalhost
::1\tlocalhost\tip6-localhost
192.168.1.100\tmyhost.local\t# managed by declastruct
# Another comment
10.0.0.1\tserver1\tserver2
`,
      );
    });

    when('reading entries', () => {
      then('parses all valid entries', async () => {
        const entries = await getOsUnixHostsFileEntries({}, testContext);

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
    beforeAll(async () => {
      await writeFile(tempHostsPath, '');
    });

    when('reading entries', () => {
      then('returns empty array', async () => {
        const entries = await getOsUnixHostsFileEntries({}, testContext);

        expect(entries).toHaveLength(0);
      });
    });
  });

  given('a hosts file with only comments', () => {
    beforeAll(async () => {
      await writeFile(
        tempHostsPath,
        `# This is a comment
# Another comment
`,
      );
    });

    when('reading entries', () => {
      then('returns empty array', async () => {
        const entries = await getOsUnixHostsFileEntries({}, testContext);

        expect(entries).toHaveLength(0);
      });
    });
  });
});
