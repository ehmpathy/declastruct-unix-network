import { isRefByUnique, type Ref } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';

import { osUnixSshKeygenSdk } from '@src/access/sdks/osUnixSshKeygen';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';

/**
 * .what = deletes a unix ssh keypair (private + public key files) by ref
 * .why = supports declarative removal of a managed keypair
 */
export const delUnixSshKeypair = async (
  input: { ref: Ref<typeof DeclaredUnixSshKeypair> },
  _context: ContextUnixNetwork & ContextLogTrail,
): Promise<void> => {
  const { ref } = input;

  // the keypair has no primary key, so the ref is always by-unique with a `uri`
  if (!isRefByUnique({ of: DeclaredUnixSshKeypair })(ref))
    return UnexpectedCodePathError.throw('keypair ref must be by-unique', {
      ref,
    });

  await osUnixSshKeygenSdk.delOsUnixSshKeypair({ uri: ref.uri });
};
