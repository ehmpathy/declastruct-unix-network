import { getError } from 'helpful-errors';

import { castIntoOsUnixSshKeypair } from './castIntoOsUnixSshKeypair';
import type { OsUnixSshKeypair } from './dobj.OsUnixSshKeypair';

const TEST_CASES: {
  description: string;
  given: { uri: string; publicKeyLine: string };
  expect: { keypair: OsUnixSshKeypair };
}[] = [
  {
    description: 'parses an ed25519 public key line',
    given: {
      uri: '~/.ssh/demo',
      publicKeyLine: 'ssh-ed25519 AAAAC3NzaC1lZDI1 grove.ehmpathy',
    },
    expect: {
      keypair: {
        uri: '~/.ssh/demo',
        algorithm: 'ed25519',
        comment: 'grove.ehmpathy',
        publicKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1 grove.ehmpathy',
      },
    },
  },
  {
    description: 'parses an rsa public key line',
    given: {
      uri: '/tmp/rsa-key',
      publicKeyLine: 'ssh-rsa AAAAB3NzaC1yc2E my-comment',
    },
    expect: {
      keypair: {
        uri: '/tmp/rsa-key',
        algorithm: 'rsa',
        comment: 'my-comment',
        publicKey: 'ssh-rsa AAAAB3NzaC1yc2E my-comment',
      },
    },
  },
  {
    description: 'keeps multi-word comments intact',
    given: {
      uri: '/tmp/k',
      publicKeyLine: 'ssh-ed25519 AAAAC3 first second third',
    },
    expect: {
      keypair: {
        uri: '/tmp/k',
        algorithm: 'ed25519',
        comment: 'first second third',
        publicKey: 'ssh-ed25519 AAAAC3 first second third',
      },
    },
  },
  {
    description: 'parses a key with no comment',
    given: { uri: '/tmp/k', publicKeyLine: 'ssh-ed25519 AAAAC3' },
    expect: {
      keypair: {
        uri: '/tmp/k',
        algorithm: 'ed25519',
        comment: '',
        publicKey: 'ssh-ed25519 AAAAC3',
      },
    },
  },
];

describe('castIntoOsUnixSshKeypair', () => {
  TEST_CASES.forEach((thisCase) =>
    test(thisCase.description, () => {
      const keypair = castIntoOsUnixSshKeypair({
        uri: thisCase.given.uri,
        publicKeyLine: thisCase.given.publicKeyLine,
      });
      expect(keypair).toEqual(thisCase.expect.keypair);
    }),
  );

  test('throws on an unsupported key type', () => {
    const error = getError(() =>
      castIntoOsUnixSshKeypair({
        uri: '/tmp/k',
        publicKeyLine: 'ssh-dss AAAAB3 legacy',
      }),
    );
    expect(error.message).toContain('unsupported ssh key type');
  });

  test('throws on a malformed line', () => {
    const error = getError(() =>
      castIntoOsUnixSshKeypair({ uri: '/tmp/k', publicKeyLine: 'ssh-ed25519' }),
    );
    expect(error.message).toContain('malformed ssh public key line');
  });
});
