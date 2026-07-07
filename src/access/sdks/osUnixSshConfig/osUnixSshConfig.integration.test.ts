import { given, then, useBeforeAll, useThen, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { OsUnixSshConfigHost } from './dobj.OsUnixSshConfigHost';
import { osUnixSshConfigSdk } from './index';

const groveBlock: OsUnixSshConfigHost = {
  alias: 'grove',
  hostName: 'localhost',
  port: 2222,
  user: 'ec2-user',
  identityFile: '~/.ssh/k',
};

describe('osUnixSshConfig', () => {
  given('a temp ssh config path', () => {
    const scene = useBeforeAll(async () => {
      const dir = mkdtempSync(join(tmpdir(), 'declastruct-sshconfig-'));
      return { path: join(dir, 'config') };
    });

    const getContext = () =>
      getSampleUnixNetworkContext({ repo: { sshConfigPath: scene.path } });

    when('[t0] before any block', () => {
      const result = useThen('read empty config', async () => ({
        hosts: await osUnixSshConfigSdk.getOsUnixSshConfigHosts(
          {},
          getContext(),
        ),
      }));

      then('getHosts returns empty', () => {
        expect(result.hosts).toEqual([]);
      });

      then('the empty-config output matches snapshot', () => {
        expect(result.hosts).toMatchSnapshot();
      });
    });

    when('[t1] a block is set', () => {
      const result = useThen('set then read', async () => {
        await osUnixSshConfigSdk.setOsUnixSshConfigHost(
          { host: groveBlock },
          getContext(),
        );
        return {
          hosts: await osUnixSshConfigSdk.getOsUnixSshConfigHosts(
            {},
            getContext(),
          ),
        };
      });

      then('the block is present with its fields', () => {
        expect(result.hosts).toContainEqual(groveBlock);
      });

      then('the parsed hosts match snapshot', () => {
        expect(result.hosts).toMatchSnapshot();
      });
    });

    when('[t2] the same block is set again', () => {
      const result = useThen('re-set then read', async () => {
        await osUnixSshConfigSdk.setOsUnixSshConfigHost(
          { host: groveBlock },
          getContext(),
        );
        return {
          hosts: await osUnixSshConfigSdk.getOsUnixSshConfigHosts(
            {},
            getContext(),
          ),
        };
      });

      then('there is exactly one block for the alias (no duplicate)', () => {
        expect(
          result.hosts.filter((host) => host.alias === 'grove').length,
        ).toEqual(1);
      });

      then('the re-set hosts match snapshot', () => {
        expect(result.hosts).toMatchSnapshot();
      });
    });

    when('[t3] the block is updated in place', () => {
      const result = useThen('update then read', async () => {
        await osUnixSshConfigSdk.setOsUnixSshConfigHost(
          { host: { ...groveBlock, port: 3333 } },
          getContext(),
        );
        return {
          hosts: await osUnixSshConfigSdk.getOsUnixSshConfigHosts(
            {},
            getContext(),
          ),
        };
      });

      then('the port is updated', () => {
        expect(
          result.hosts.find((host) => host.alias === 'grove')?.port,
        ).toEqual(3333);
      });

      then('there is still exactly one block for the alias', () => {
        expect(
          result.hosts.filter((host) => host.alias === 'grove').length,
        ).toEqual(1);
      });

      then('the updated hosts match snapshot', () => {
        expect(result.hosts).toMatchSnapshot();
      });
    });

    when('[t4] a peer exists and the block is deleted', () => {
      const result = useThen('set peer, del grove, read', async () => {
        await osUnixSshConfigSdk.setOsUnixSshConfigHost(
          {
            host: {
              alias: 'other',
              hostName: 'other.host',
              port: 22,
              user: 'u',
              identityFile: '~/.ssh/o',
            },
          },
          getContext(),
        );
        await osUnixSshConfigSdk.delOsUnixSshConfigHost(
          { alias: 'grove' },
          getContext(),
        );
        return {
          hosts: await osUnixSshConfigSdk.getOsUnixSshConfigHosts(
            {},
            getContext(),
          ),
        };
      });

      then('the deleted block is gone', () => {
        expect(result.hosts.find((host) => host.alias === 'grove')).toEqual(
          undefined,
        );
      });

      then('the peer block survives untouched', () => {
        expect(
          result.hosts.find((host) => host.alias === 'other')?.hostName,
        ).toEqual('other.host');
      });

      then('the remnant hosts match snapshot', () => {
        expect(result.hosts).toMatchSnapshot();
      });
    });
  });
});
