import execa from 'execa';
import { MalfunctionError } from 'helpful-errors';

import { dirname } from 'node:path';
import { asExpandedPath } from '../asExpandedPath';

/**
 * .what = mints a keypair at the given uri via ssh-keygen
 * .why = creates the private + public key files non-interactively
 *
 * .note = ssh-keygen refuses to overwrite an extant key (it would prompt), so
 *   callers MUST guarantee the key is absent first (findsert discipline)
 */
export const setOsUnixSshKeypair = async (input: {
  keypair: { uri: string; algorithm: 'ed25519' | 'rsa'; comment: string };
}): Promise<void> => {
  const uriExpanded = asExpandedPath({ uri: input.keypair.uri });

  // ensure the parent directory exists (ssh-keygen does not create it)
  await MalfunctionError.wrap(
    async () => execa('mkdir', ['-p', dirname(uriExpanded)]),
    {
      message: 'failed to create ssh keys directory',
      metadata: { uriExpanded },
    },
  )();

  // mint the keypair non-interactively with an empty passphrase
  await MalfunctionError.wrap(
    async () =>
      execa('ssh-keygen', [
        '-t',
        input.keypair.algorithm,
        '-f',
        uriExpanded,
        '-N',
        '',
        '-C',
        input.keypair.comment,
      ]),
    {
      message: 'failed to mint ssh keypair via ssh-keygen',
      metadata: {
        uriExpanded,
        algorithm: input.keypair.algorithm,
        comment: input.keypair.comment,
      },
    },
  )();
};
