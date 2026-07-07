import type { ContextLogTrail } from 'simple-log-methods';
import { given, then, useBeforeAll, useThen, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { delUnixSshAlias } from './delUnixSshAlias';
import { getOneUnixSshAlias } from './getOneUnixSshAlias';
import { setUnixSshAlias } from './setUnixSshAlias';

const KEY_URI = '~/.ssh/demo-key';

const asAlias = (input: { port: number }): DeclaredUnixSshAlias =>
  DeclaredUnixSshAlias.as({
    via: '~/.ssh/config',
    from: 'grove',
    into: { host: 'localhost', port: input.port },
    user: 'ec2-user',
    key: { via: 'ssh-keygen', uri: KEY_URI },
  });

describe('setUnixSshAlias', () => {
  given('a temp ssh config path', () => {
    const scene = useBeforeAll(async () => {
      const dir = mkdtempSync(join(tmpdir(), 'declastruct-sshalias-'));
      const context: ContextUnixNetwork & ContextLogTrail = {
        log: console,
        ...getSampleUnixNetworkContext({
          repo: { sshConfigPath: join(dir, 'config') },
        }),
      };
      return { context };
    });

    const getFound = () =>
      getOneUnixSshAlias(
        { by: { unique: { via: '~/.ssh/config', from: 'grove' } } },
        scene.context,
      );

    when('[t0] before any alias', () => {
      then('getOne returns null', async () => {
        expect(await getFound()).toEqual(null);
      });
    });

    when('[t1] findsert creates the alias', () => {
      const result = useThen('findsert then read', async () => {
        await setUnixSshAlias(
          { findsert: asAlias({ port: 2222 }) },
          scene.context,
        );
        return { found: await getFound() };
      });

      then('the alias is present', () => {
        expect(result.found).not.toEqual(null);
      });

      then('the target port matches', () => {
        expect(result.found?.into.port).toEqual(2222);
      });

      then('the user matches', () => {
        expect(result.found?.user).toEqual('ec2-user');
      });

      then('the IdentityFile is derived from key.uri', () => {
        expect(result.found?.key.uri).toEqual(KEY_URI);
      });

      then('the found alias matches snapshot', () => {
        expect(result.found).toMatchSnapshot();
      });
    });

    when('[t2] upsert changes the port', () => {
      const result = useThen('upsert then read', async () => {
        await setUnixSshAlias(
          { upsert: asAlias({ port: 3333 }) },
          scene.context,
        );
        return { found: await getFound() };
      });

      then('the port is updated in place', () => {
        expect(result.found?.into.port).toEqual(3333);
      });

      then('the updated alias matches snapshot', () => {
        expect(result.found).toMatchSnapshot();
      });
    });

    when('[t3] the alias is deleted', () => {
      const result = useThen('del then read', async () => {
        await delUnixSshAlias(
          { ref: { via: '~/.ssh/config', from: 'grove' } },
          scene.context,
        );
        return { found: await getFound() };
      });

      then('getOne returns null again', () => {
        expect(result.found).toEqual(null);
      });
    });
  });
});
