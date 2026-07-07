import type { OsUnixSshConfigHost } from '@src/access/sdks/osUnixSshConfig';

import { castIntoDeclaredUnixSshAlias } from './castIntoDeclaredUnixSshAlias';

describe('castIntoDeclaredUnixSshAlias', () => {
  test('casts a fully-specified block into a declared alias', () => {
    const host: OsUnixSshConfigHost = {
      alias: 'grove.ehmpathy',
      hostName: 'localhost',
      port: 2222,
      user: 'ec2-user',
      identityFile: '~/.ssh/declastruct-demo',
    };

    const alias = castIntoDeclaredUnixSshAlias({ host });

    expect(alias).not.toEqual(null);
    expect(alias?.via).toEqual('~/.ssh/config');
    expect(alias?.from).toEqual('grove.ehmpathy');
    expect(alias?.into.host).toEqual('localhost');
    expect(alias?.into.port).toEqual(2222);
    expect(alias?.user).toEqual('ec2-user');
    expect(alias?.key.uri).toEqual('~/.ssh/declastruct-demo');
  });

  const PARTIAL_CASES: { description: string; host: OsUnixSshConfigHost }[] = [
    {
      description: 'hostName absent',
      host: {
        alias: 'x',
        hostName: null,
        port: 22,
        user: 'u',
        identityFile: '~/.ssh/k',
      },
    },
    {
      description: 'port absent',
      host: {
        alias: 'x',
        hostName: 'h',
        port: null,
        user: 'u',
        identityFile: '~/.ssh/k',
      },
    },
    {
      description: 'user absent',
      host: {
        alias: 'x',
        hostName: 'h',
        port: 22,
        user: null,
        identityFile: '~/.ssh/k',
      },
    },
    {
      description: 'identityFile absent',
      host: {
        alias: 'x',
        hostName: 'h',
        port: 22,
        user: 'u',
        identityFile: null,
      },
    },
  ];

  PARTIAL_CASES.forEach((thisCase) =>
    test(`returns null when ${thisCase.description}`, () => {
      expect(castIntoDeclaredUnixSshAlias({ host: thisCase.host })).toEqual(
        null,
      );
    }),
  );
});
