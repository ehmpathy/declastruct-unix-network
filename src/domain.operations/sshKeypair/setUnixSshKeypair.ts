import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';
import type { HasMetadata } from 'type-fns';

import { osUnixSshKeygenSdk } from '@src/access/sdks/osUnixSshKeygen';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import type { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';

import { castFromDeclaredUnixSshKeypair } from './castFromDeclaredUnixSshKeypair';
import { getOneUnixSshKeypair } from './getOneUnixSshKeypair';

/**
 * .what = findserts a unix ssh keypair: mints only if absent, else returns extant
 * .why = a private key is precious; we never overwrite one, so keypairs are
 *        findsert-only (no upsert) per the wish
 */
export const setUnixSshKeypair = async (
  input: { findsert: DeclaredUnixSshKeypair },
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<HasMetadata<DeclaredUnixSshKeypair>> => {
  const desired = input.findsert;

  // if a key already lives at this uri, return it untouched (never overwrite)
  const foundBefore = await getOneUnixSshKeypair(
    { by: { unique: { via: 'ssh-keygen', uri: desired.uri } } },
    context,
  );
  if (foundBefore) return foundBefore as HasMetadata<DeclaredUnixSshKeypair>;

  // otherwise, mint the keypair
  await osUnixSshKeygenSdk.setOsUnixSshKeypair({
    keypair: castFromDeclaredUnixSshKeypair({ keypair: desired }),
  });

  // sanity check: verify the mint produced a readable keypair
  const foundAfter = await getOneUnixSshKeypair(
    { by: { unique: { via: 'ssh-keygen', uri: desired.uri } } },
    context,
  );
  if (!foundAfter)
    throw new UnexpectedCodePathError(
      'sanity check failed: keypair not minted correctly',
      { desired, foundAfter },
    );

  return foundAfter as HasMetadata<DeclaredUnixSshKeypair>;
};
