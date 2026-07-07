import { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';

import { castFromDeclaredUnixSshKeypair } from './castFromDeclaredUnixSshKeypair';

describe('castFromDeclaredUnixSshKeypair', () => {
  test('maps the mint fields ssh-keygen needs', () => {
    const keypair = DeclaredUnixSshKeypair.as({
      via: 'ssh-keygen',
      uri: '~/.ssh/declastruct-demo',
      algorithm: 'ed25519',
      comment: 'grove.ehmpathy',
    });

    const mintInput = castFromDeclaredUnixSshKeypair({ keypair });

    expect(mintInput.uri).toEqual('~/.ssh/declastruct-demo');
    expect(mintInput.algorithm).toEqual('ed25519');
    expect(mintInput.comment).toEqual('grove.ehmpathy');
  });

  test('drops via and publicKey (not ssh-keygen inputs)', () => {
    const keypair = DeclaredUnixSshKeypair.as({
      via: 'ssh-keygen',
      uri: '~/.ssh/k',
      algorithm: 'rsa',
      comment: 'c',
      publicKey: 'ssh-rsa AAAA... c',
    });

    const mintInput = castFromDeclaredUnixSshKeypair({ keypair });

    expect(mintInput).not.toHaveProperty('via');
    expect(mintInput).not.toHaveProperty('publicKey');
  });
});
