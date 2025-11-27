import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { given, when, then } from 'test-fns';

import { getSampleUnixNetworkContext } from '../../../.test/assets/getSampleUnixNetworkContext';
import { getOsUnixSystemdSocatServices } from './dop.getOsUnixSystemdSocatServices';

const TEST_TEMP_DIR = join(__dirname, '.test', '.temp');

describe('getOsUnixSystemdSocatServices integration', () => {
  const testContext = getSampleUnixNetworkContext({
    repo: { systemdUnitsDir: TEST_TEMP_DIR },
  });

  beforeAll(async () => {
    await mkdir(TEST_TEMP_DIR, { recursive: true });
  });

  afterAll(async () => {
    await rm(TEST_TEMP_DIR, { recursive: true, force: true });
  });

  given('a temp systemd directory with socat service files', () => {
    beforeAll(async () => {
      await writeFile(
        join(TEST_TEMP_DIR, 'my-forward.service'),
        `[Unit]
Description=Declastruct socat port forward 127.0.0.1:5432 -> 127.0.0.1:15432
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:5432,bind=127.0.0.1,fork,reuseaddr TCP:127.0.0.1:15432
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
`,
      );
    });

    when('reading services', () => {
      then('parses the socat service file', async () => {
        const services = await getOsUnixSystemdSocatServices({}, testContext);

        expect(services).toHaveLength(1);
        expect(services[0]).toEqual({
          uri: join(TEST_TEMP_DIR, 'my-forward.service'),
          listenHost: '127.0.0.1',
          listenPort: 5432,
          connectHost: '127.0.0.1',
          connectPort: 15432,
        });
      });
    });
  });

  given('a temp systemd directory with mixed service files', () => {
    beforeAll(async () => {
      // create a socat service
      await writeFile(
        join(TEST_TEMP_DIR, 'socat-forward.service'),
        `[Service]
ExecStart=/usr/bin/socat TCP-LISTEN:8080,bind=0.0.0.0,fork,reuseaddr TCP:localhost:80
`,
      );

      // create a non-socat service
      await writeFile(
        join(TEST_TEMP_DIR, 'nginx.service'),
        `[Service]
ExecStart=/usr/sbin/nginx -g 'daemon off;'
`,
      );
    });

    when('reading services', () => {
      then('only includes socat services', async () => {
        const services = await getOsUnixSystemdSocatServices({}, testContext);

        // should only have the socat services (my-forward from previous and socat-forward)
        const socatServices = services.filter(
          (s) =>
            s.uri.includes('socat-forward') || s.uri.includes('my-forward'),
        );
        expect(socatServices.length).toBeGreaterThanOrEqual(1);
        expect(services.find((s) => s.uri.includes('nginx'))).toBeUndefined();
      });
    });
  });

  given('an empty temp systemd directory', () => {
    const emptyDir = join(TEST_TEMP_DIR, 'empty');
    const emptyContext = getSampleUnixNetworkContext({
      repo: { systemdUnitsDir: emptyDir },
    });

    beforeAll(async () => {
      await mkdir(emptyDir, { recursive: true });
    });

    when('reading services', () => {
      then('returns empty array', async () => {
        const services = await getOsUnixSystemdSocatServices({}, emptyContext);

        expect(services).toHaveLength(0);
      });
    });
  });
});
