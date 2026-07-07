import type { RefByUnique } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';
import type { PickOne } from 'type-fns';

import { osUnixSshKeygenSdk } from '@src/access/sdks/osUnixSshKeygen';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import type { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';

import { castIntoDeclaredUnixSshKeypair } from './castIntoDeclaredUnixSshKeypair';

/**
 * .what = gets one unix ssh keypair by its private key uri
 * .why = retrieves current state of a keypair for declarative management
 */
export const getOneUnixSshKeypair = async (
  input: {
    by: PickOne<{
      unique: RefByUnique<typeof DeclaredUnixSshKeypair>;
    }>;
  },
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixSshKeypair | null> => {
  // determine the private key uri from input
  const uri = (() => {
    if (input.by.unique) return input.by.unique.uri;
    UnexpectedCodePathError.throw('not referenced by unique. how not?', {
      input,
    });
  })();

  // read the keypair directly by its uri
  const found = await osUnixSshKeygenSdk.getOsUnixSshKeypair({ uri });
  if (!found) return null;

  return castIntoDeclaredUnixSshKeypair({ keypair: found });
};
