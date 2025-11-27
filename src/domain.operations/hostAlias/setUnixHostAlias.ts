import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';
import { PickOne } from 'type-fns';

import { osUnixHostsFileSdk } from '../../access/sdks/osUnixHostsFile';
import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclaredUnixHostAlias } from '../../domain.objects/DeclaredUnixHostAlias';
import { castFromDeclaredUnixHostAlias } from './castFromDeclaredUnixHostAlias';
import { getOneUnixHostAlias } from './getOneUnixHostAlias';

/**
 * .what = sets a unix host alias: upsert or finsert
 * .why = enables declarative creation/update of host aliases following declastruct patterns
 */
export const setUnixHostAlias = async (
  input: PickOne<{
    finsert: DeclaredUnixHostAlias;
    upsert: DeclaredUnixHostAlias;
  }>,
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixHostAlias> => {
  const desired = input.finsert ?? input.upsert;
  if (!desired) throw new Error('finsert or upsert required');

  // check if entry exists via domain-level operation
  const foundBefore = await getOneUnixHostAlias(
    { by: { unique: { via: '/etc/hosts', from: desired.from } } },
    context,
  );

  // if finsert and foundBefore, return foundBefore (don't modify)
  if (foundBefore && input.finsert) return foundBefore;

  // if upsert and foundBefore with same ip, return foundBefore (already correct)
  if (foundBefore && input.upsert && foundBefore.into === desired.into)
    return foundBefore;

  // if upsert and foundBefore with different ip, update via safe replace
  if (foundBefore && input.upsert && foundBefore.into !== desired.into) {
    const oldEntry = castFromDeclaredUnixHostAlias({ alias: foundBefore });
    const newEntry = castFromDeclaredUnixHostAlias({ alias: desired });
    await osUnixHostsFileSdk.replaceOsUnixHostsFileEntry(
      { oldEntry, newEntry },
      context,
    );

    // sanity check: verify write succeeded
    const foundAfter = await getOneUnixHostAlias(
      { by: { unique: { via: '/etc/hosts', from: desired.from } } },
      context,
    );
    if (foundAfter?.into !== desired.into)
      throw new UnexpectedCodePathError(
        'sanity check failed: host alias not updated correctly',
        { desired, foundBefore, foundAfter },
      );

    return desired;
  }

  // not foundBefore - cast to OS-level representation and add via SDK
  const entry = castFromDeclaredUnixHostAlias({ alias: desired });
  await osUnixHostsFileSdk.addOsUnixHostsFileEntry({ entry }, context);

  // sanity check: verify write succeeded
  const foundAfter = await getOneUnixHostAlias(
    { by: { unique: { via: '/etc/hosts', from: desired.from } } },
    context,
  );
  if (foundAfter?.into !== desired.into)
    throw new UnexpectedCodePathError(
      'sanity check failed: host alias not created correctly',
      { desired, foundBefore, foundAfter },
    );

  return desired;
};
