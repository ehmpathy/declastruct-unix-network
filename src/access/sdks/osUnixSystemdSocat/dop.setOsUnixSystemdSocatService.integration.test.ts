import { mkdir, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { given, then, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';

import { setOsUnixSystemdSocatService } from './dop.setOsUnixSystemdSocatService';

const TEST_TEMP_DIR = join(__dirname, '.test', '.temp');

describe('setOsUnixSystemdSocatService integration', () => {
  const testContext = getSampleUnixNetworkContext({
    repo: { systemdUnitsDir: TEST_TEMP_DIR },
  });

  beforeAll(async () => {
    await mkdir(TEST_TEMP_DIR, { recursive: true });
  });

  afterAll(async () => {
    await rm(TEST_TEMP_DIR, { recursive: true, force: true });
  });

  given('a temp systemd directory', () => {
    when('creating a service', () => {
      then('creates the service file with correct content', async () => {
        const serviceUri = join(TEST_TEMP_DIR, 'my-forward.service');
        await setOsUnixSystemdSocatService(
          {
            service: {
              uri: serviceUri,
              listenHost: '127.0.0.1',
              listenPort: 5432,
              connectHost: '127.0.0.1',
              connectPort: 15432,
            },
          },
          testContext,
        );

        const content = await readFile(serviceUri, 'utf-8');

        expect(content).toMatchInlineSnapshot(`
"[Unit]
Description=Declastruct socat port forward 127.0.0.1:5432 -> 127.0.0.1:15432
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:5432,bind=127.0.0.1,fork,reuseaddr TCP:127.0.0.1:15432
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
"
`);
      });
    });

    when('updating an existing service', () => {
      then('overwrites with new target', async () => {
        const serviceUri = join(TEST_TEMP_DIR, 'update-test.service');

        // create initial service
        await setOsUnixSystemdSocatService(
          {
            service: {
              uri: serviceUri,
              listenHost: '127.0.0.1',
              listenPort: 3306,
              connectHost: '127.0.0.1',
              connectPort: 13306,
            },
          },
          testContext,
        );

        // update to new target
        await setOsUnixSystemdSocatService(
          {
            service: {
              uri: serviceUri,
              listenHost: '127.0.0.1',
              listenPort: 3306,
              connectHost: '192.168.1.100',
              connectPort: 3306,
            },
          },
          testContext,
        );

        const content = await readFile(serviceUri, 'utf-8');

        // should have new target
        expect(content).toContain('TCP:192.168.1.100:3306');
        expect(content).not.toContain('TCP:127.0.0.1:13306');
      });
    });

    when('creating multiple services', () => {
      then('creates separate files for each', async () => {
        const serviceUriA = join(TEST_TEMP_DIR, 'forward-a.service');
        const serviceUriB = join(TEST_TEMP_DIR, 'forward-b.service');

        await setOsUnixSystemdSocatService(
          {
            service: {
              uri: serviceUriA,
              listenHost: '127.0.0.1',
              listenPort: 5432,
              connectHost: '127.0.0.1',
              connectPort: 15432,
            },
          },
          testContext,
        );

        await setOsUnixSystemdSocatService(
          {
            service: {
              uri: serviceUriB,
              listenHost: '0.0.0.0',
              listenPort: 8080,
              connectHost: 'localhost',
              connectPort: 80,
            },
          },
          testContext,
        );

        const contentA = await readFile(serviceUriA, 'utf-8');
        const contentB = await readFile(serviceUriB, 'utf-8');

        expect(contentA).toContain('TCP-LISTEN:5432');
        expect(contentB).toContain('TCP-LISTEN:8080');
      });
    });
  });
});
