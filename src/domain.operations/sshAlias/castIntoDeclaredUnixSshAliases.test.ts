import type { OsUnixSshConfigHost } from '@src/access/sdks/osUnixSshConfig';

import { castIntoDeclaredUnixSshAliases } from './castIntoDeclaredUnixSshAliases';

const managed = (alias: string): OsUnixSshConfigHost => ({
  alias,
  hostName: 'localhost',
  port: 2222,
  user: 'ec2-user',
  identityFile: '~/.ssh/k',
});

const partial = (alias: string): OsUnixSshConfigHost => ({
  alias,
  hostName: 'localhost',
  port: null,
  user: 'ec2-user',
  identityFile: '~/.ssh/k',
});

describe('castIntoDeclaredUnixSshAliases', () => {
  test('casts every fully-managed block into a declared alias', () => {
    const aliases = castIntoDeclaredUnixSshAliases({
      hosts: [managed('one'), managed('two')],
    });

    expect(aliases).toHaveLength(2);
    expect(aliases.map((alias) => alias.from)).toEqual(['one', 'two']);
  });

  test('drops blocks that lack the full managed shape', () => {
    const aliases = castIntoDeclaredUnixSshAliases({
      hosts: [managed('keep'), partial('drop')],
    });

    expect(aliases).toHaveLength(1);
    expect(aliases[0]?.from).toEqual('keep');
  });

  test('returns an empty list for no hosts', () => {
    expect(castIntoDeclaredUnixSshAliases({ hosts: [] })).toEqual([]);
  });
});
