import { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

import { castFromDeclaredUnixSshAlias } from './castFromDeclaredUnixSshAlias';

describe('castFromDeclaredUnixSshAlias', () => {
  test('maps declared terms onto the os-level host block fields', () => {
    const alias = DeclaredUnixSshAlias.as({
      via: '~/.ssh/config',
      from: 'grove.ehmpathy',
      into: { host: 'localhost', port: 2222 },
      user: 'ec2-user',
      key: { via: 'ssh-keygen', uri: '~/.ssh/declastruct-demo' },
    });

    const host = castFromDeclaredUnixSshAlias({ alias });

    expect(host.alias).toEqual('grove.ehmpathy');
    expect(host.hostName).toEqual('localhost');
    expect(host.port).toEqual(2222);
    expect(host.user).toEqual('ec2-user');
  });

  test('derives IdentityFile from the keypair ref uri', () => {
    const alias = DeclaredUnixSshAlias.as({
      via: '~/.ssh/config',
      from: 'box',
      into: { host: '10.0.0.1', port: 22 },
      user: 'ubuntu',
      key: { via: 'ssh-keygen', uri: '~/.ssh/box-key' },
    });

    const host = castFromDeclaredUnixSshAlias({ alias });

    expect(host.identityFile).toEqual('~/.ssh/box-key');
  });
});
