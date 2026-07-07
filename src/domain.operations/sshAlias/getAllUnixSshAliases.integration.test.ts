import type { ContextLogTrail } from 'simple-log-methods';
import { given, then, useBeforeAll, useThen, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getAllUnixSshAliases } from './getAllUnixSshAliases';
import { setUnixSshAlias } from './setUnixSshAlias';

const asAlias = (input: { from: string; port: number }): DeclaredUnixSshAlias =>
  DeclaredUnixSshAlias.as({
    via: '~/.ssh/config',
    from: input.from,
    into: { host: 'localhost', port: input.port },
    user: 'ec2-user',
    key: { via: 'ssh-keygen', uri: '~/.ssh/demo-key' },
  });

describe('getAllUnixSshAliases', () => {
  given('a temp ssh config path', () => {
    const scene = useBeforeAll(async () => {
      const dir = mkdtempSync(join(tmpdir(), 'declastruct-getall-alias-'));
      const context: ContextUnixNetwork & ContextLogTrail = {
        log: console,
        ...getSampleUnixNetworkContext({
          repo: { sshConfigPath: join(dir, 'config') },
        }),
      };
      return { context };
    });

    when('[t0] before any alias', () => {
      then('getAll returns empty', async () => {
        expect(await getAllUnixSshAliases({}, scene.context)).toEqual([]);
      });
    });

    when('[t1] two aliases are set', () => {
      const result = useThen('set two then getAll', async () => {
        await setUnixSshAlias(
          { findsert: asAlias({ from: 'grove', port: 2222 }) },
          scene.context,
        );
        await setUnixSshAlias(
          { findsert: asAlias({ from: 'meadow', port: 2223 }) },
          scene.context,
        );
        return { aliases: await getAllUnixSshAliases({}, scene.context) };
      });

      then('both managed aliases are returned', () => {
        expect(result.aliases.map((alias) => alias.from).sort()).toEqual([
          'grove',
          'meadow',
        ]);
      });

      then('the full alias list matches snapshot', () => {
        expect(
          [...result.aliases].sort((a, b) => a.from.localeCompare(b.from)),
        ).toMatchSnapshot();
      });
    });
  });
});
