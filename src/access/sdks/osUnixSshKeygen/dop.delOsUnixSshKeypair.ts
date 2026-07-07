import execa from 'execa';
import { MalfunctionError } from 'helpful-errors';

import { asExpandedPath } from '../asExpandedPath';

/**
 * .what = removes a keypair (private + public key files) at the given uri
 * .why = supports declarative deletion of a managed keypair
 *
 * .note = uses `rm -f` for idempotency: a no-op if the files are already absent
 */
export const delOsUnixSshKeypair = async (input: {
  uri: string;
}): Promise<void> => {
  const uriExpanded = asExpandedPath({ uri: input.uri });
  await MalfunctionError.wrap(
    async () => execa('rm', ['-f', uriExpanded, `${uriExpanded}.pub`]),
    {
      message: 'failed to remove ssh keypair files',
      metadata: { uriExpanded },
    },
  )();
};
