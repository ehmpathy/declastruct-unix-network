import type { OsUnixSshKeypair } from '@src/access/sdks/osUnixSshKeygen';

import { castIntoDeclaredUnixSshKeypair } from './castIntoDeclaredUnixSshKeypair';

describe('castIntoDeclaredUnixSshKeypair', () => {
  test('maps every os field onto the declared keypair', () => {
    const os: OsUnixSshKeypair = {
      uri: '~/.ssh/demo',
      algorithm: 'ed25519',
      comment: 'test-comment',
      publicKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1 test-comment',
    };

    const declared = castIntoDeclaredUnixSshKeypair({ keypair: os });

    expect(declared.via).toEqual('ssh-keygen');
    expect(declared.uri).toEqual('~/.ssh/demo');
    expect(declared.algorithm).toEqual('ed25519');
    expect(declared.comment).toEqual('test-comment');
    expect(declared.publicKey).toEqual(
      'ssh-ed25519 AAAAC3NzaC1lZDI1 test-comment',
    );
  });

  test('carries the rsa algorithm through unchanged', () => {
    const os: OsUnixSshKeypair = {
      uri: '~/.ssh/rsa-key',
      algorithm: 'rsa',
      comment: 'rsa-comment',
      publicKey: 'ssh-rsa AAAAB3NzaC1yc2E rsa-comment',
    };

    const declared = castIntoDeclaredUnixSshKeypair({ keypair: os });

    expect(declared.algorithm).toEqual('rsa');
  });
});
