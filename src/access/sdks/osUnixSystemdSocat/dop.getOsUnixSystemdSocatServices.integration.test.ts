import { given, then, useBeforeAll, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getOsUnixSystemdSocatServices } from './dop.getOsUnixSystemdSocatServices';

/**
 * .what = creates an isolated temp directory for a test case
 * .why = ensures complete test isolation across CI environments
 */
const createIsolatedTestDir = async (suffix: string): Promise<string> => {
  const dir = join(
    tmpdir(),
    'declastruct-unix-network-test',
    `${Date.now()}-${suffix}`,
  );
  await mkdir(dir, { recursive: true });
  return dir;
};

describe('getOsUnixSystemdSocatServices integration', () => {
  given('a temp systemd directory with socat service files', () => {
    const scene = useBeforeAll(async () => {
      const testDir = await createIsolatedTestDir('socat-files');
      const testContext = getSampleUnixNetworkContext({
        repo: { systemdUnitsDir: testDir },
      });

      await writeFile(
        join(testDir, 'my-forward.service'),
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

      return { testDir, testContext };
    });

    afterAll(async () => {
      await rm(scene.testDir, { recursive: true, force: true });
    });

    when('reading services', () => {
      then('parses the socat service file', async () => {
        const services = await getOsUnixSystemdSocatServices(
          {},
          scene.testContext,
        );

        expect(services).toHaveLength(1);
        expect(services[0]).toEqual({
          uri: join(scene.testDir, 'my-forward.service'),
          listenHost: '127.0.0.1',
          listenPort: 5432,
          connectHost: '127.0.0.1',
          connectPort: 15432,
        });
      });
    });
  });

  given('a temp systemd directory with mixed service files', () => {
    const scene = useBeforeAll(async () => {
      const testDir = await createIsolatedTestDir('mixed-files');
      const testContext = getSampleUnixNetworkContext({
        repo: { systemdUnitsDir: testDir },
      });

      // create a socat service
      await writeFile(
        join(testDir, 'socat-forward.service'),
        `[Service]
ExecStart=/usr/bin/socat TCP-LISTEN:8080,bind=0.0.0.0,fork,reuseaddr TCP:localhost:80
`,
      );

      // create a non-socat service
      await writeFile(
        join(testDir, 'nginx.service'),
        `[Service]
ExecStart=/usr/sbin/nginx -g 'daemon off;'
`,
      );

      // verify files were created (defensive check for CI)
      const files = await readdir(testDir);

      return { testDir, testContext, files };
    });

    afterAll(async () => {
      await rm(scene.testDir, { recursive: true, force: true });
    });

    when('reading services', () => {
      then('only includes socat services', async () => {
        // defensive: verify files exist before testing
        expect(scene.files).toContain('socat-forward.service');
        expect(scene.files).toContain('nginx.service');

        const services = await getOsUnixSystemdSocatServices(
          {},
          scene.testContext,
        );

        // should have exactly the socat service (nginx should be filtered out)
        expect(services).toHaveLength(1);
        expect(services[0]?.uri).toContain('socat-forward.service');
        expect(services.find((s) => s.uri.includes('nginx'))).toBeUndefined();
      });
    });
  });

  given('an empty temp systemd directory', () => {
    const scene = useBeforeAll(async () => {
      const testDir = await createIsolatedTestDir('empty');
      const testContext = getSampleUnixNetworkContext({
        repo: { systemdUnitsDir: testDir },
      });
      return { testDir, testContext };
    });

    afterAll(async () => {
      await rm(scene.testDir, { recursive: true, force: true });
    });

    when('reading services', () => {
      then('returns empty array', async () => {
        const services = await getOsUnixSystemdSocatServices(
          {},
          scene.testContext,
        );

        expect(services).toHaveLength(0);
      });
    });
  });
});
