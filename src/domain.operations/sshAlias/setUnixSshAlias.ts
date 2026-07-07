import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';
import type { PickOne } from 'type-fns';

import { osUnixSshConfigSdk } from '@src/access/sdks/osUnixSshConfig';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import type { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

import { castFromDeclaredUnixSshAlias } from './castFromDeclaredUnixSshAlias';
import { getOneUnixSshAlias } from './getOneUnixSshAlias';

/**
 * .what = true when two aliases carry the same target/user/key
 * .why = lets upsert short-circuit when the extant block already matches
 */
const isSameAliasShape = (input: {
  a: DeclaredUnixSshAlias;
  b: DeclaredUnixSshAlias;
}): boolean =>
  input.a.into.host === input.b.into.host &&
  input.a.into.port === input.b.into.port &&
  input.a.user === input.b.user &&
  input.a.key.uri === input.b.key.uri;

/**
 * .what = sets a unix ssh alias: upsert or findsert
 * .why = enables declarative create/update of a `~/.ssh/config` Host block
 */
export const setUnixSshAlias = async (
  input: PickOne<{
    findsert: DeclaredUnixSshAlias;
    upsert: DeclaredUnixSshAlias;
  }>,
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixSshAlias> => {
  const desired = input.findsert ?? input.upsert;
  if (!desired)
    UnexpectedCodePathError.throw('findsert or upsert required', { input });

  // check if a block already exists for this alias
  const foundBefore = await getOneUnixSshAlias(
    { by: { unique: { via: '~/.ssh/config', from: desired.from } } },
    context,
  );

  // if findsert and found, return it untouched
  if (foundBefore && input.findsert) return foundBefore;

  // if upsert and found with the same shape, it is already correct
  if (
    foundBefore &&
    input.upsert &&
    isSameAliasShape({ a: foundBefore, b: desired })
  )
    return foundBefore;

  // write the block (replace in place or append)
  await osUnixSshConfigSdk.setOsUnixSshConfigHost(
    { host: castFromDeclaredUnixSshAlias({ alias: desired }) },
    context,
  );

  // sanity check: verify the write took effect
  const foundAfter = await getOneUnixSshAlias(
    { by: { unique: { via: '~/.ssh/config', from: desired.from } } },
    context,
  );
  if (!foundAfter || !isSameAliasShape({ a: foundAfter, b: desired }))
    throw new UnexpectedCodePathError(
      'sanity check failed: ssh alias not set correctly',
      { desired, foundBefore, foundAfter },
    );

  // return the persisted read-back, not the caller input (declastruct convention)
  return foundAfter;
};
