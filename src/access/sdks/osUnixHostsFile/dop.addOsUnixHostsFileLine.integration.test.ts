import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { given, when, then } from 'test-fns';

import { getSampleUnixNetworkContext } from '../../../.test/assets/getSampleUnixNetworkContext';
import { addOsUnixHostsFileEntry } from './dop.addOsUnixHostsFileLine';

const TEST_TEMP_DIR = join(__dirname, '.test', '.temp');

describe('addOsUnixHostsFileEntry integration', () => {
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

  given('a temp hosts file with initial content', () => {
    beforeAll(async () => {
      await writeFile(tempHostsPath, '127.0.0.1\tlocalhost\n');
    });

    when('adding a line', () => {
      then('appends the formatted line to the file', async () => {
        await addOsUnixHostsFileEntry(
          {
            entry: {
              ip: '192.168.1.100',
              hostnames: ['myhost.local'],
              comment: 'managed by declastruct',
            },
          },
          testContext,
        );

        const content = await readFile(tempHostsPath, 'utf-8');
        expect(content).toMatchInlineSnapshot(`
"127.0.0.1	localhost

192.168.1.100	myhost.local	# managed by declastruct"
`);
      });
    });
  });

  given('an empty temp hosts file', () => {
    beforeAll(async () => {
      await writeFile(tempHostsPath, '');
    });

    when('adding a line without comment', () => {
      then('appends correctly formatted line', async () => {
        await addOsUnixHostsFileEntry(
          {
            entry: {
              ip: '10.0.0.1',
              hostnames: ['server1'],
              comment: undefined,
            },
          },
          testContext,
        );

        const content = await readFile(tempHostsPath, 'utf-8');
        expect(content).toMatchInlineSnapshot(`
"
10.0.0.1	server1"
`);
      });
    });
  });
});
