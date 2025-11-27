import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';
import { PickOne } from 'type-fns';

import { osUnixSystemdSocatSdk } from '../../access/sdks/osUnixSystemdSocat';
import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclaredUnixPortAlias } from '../../domain.objects/DeclaredUnixPortAlias';
import { castFromDeclaredUnixPortAlias } from './castFromDeclaredUnixPortAlias';
import { getOneUnixPortAlias } from './getOneUnixPortAlias';

/**
 * .what = sets a unix port alias: upsert or finsert
 * .why = enables declarative creation/update of systemd-socat services following declastruct patterns
 */
export const setUnixPortAlias = async (
  input: PickOne<{
    finsert: DeclaredUnixPortAlias;
    upsert: DeclaredUnixPortAlias;
  }>,
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixPortAlias> => {
  const desired = input.finsert ?? input.upsert;
  if (!desired) throw new Error('finsert or upsert required');

  // check if service already exists via domain-level operation
  const foundBefore = await getOneUnixPortAlias(
    {
      by: {
        unique: {
          via: 'systemd-socat',
          from: desired.from,
        },
      },
    },
    context,
  );

  // if finsert and foundBefore, return foundBefore (don't modify)
  if (foundBefore && input.finsert) return foundBefore;

  // if upsert and foundBefore with same target, return foundBefore (already correct)
  if (
    foundBefore &&
    input.upsert &&
    foundBefore.into.host === desired.into.host &&
    foundBefore.into.port === desired.into.port
  )
    return foundBefore;

  // cast to OS-level representation (unitDir comes from context)
  const service = castFromDeclaredUnixPortAlias({ alias: desired }, context);

  // create or update service via SDK (idempotent - safe to overwrite)
  await osUnixSystemdSocatSdk.setOsUnixSystemdSocatService(
    { service },
    context,
  );

  // sanity check: verify write succeeded
  const foundAfter = await getOneUnixPortAlias(
    {
      by: {
        unique: {
          via: 'systemd-socat',
          from: desired.from,
        },
      },
    },
    context,
  );
  if (
    foundAfter?.into.host !== desired.into.host ||
    foundAfter?.into.port !== desired.into.port
  )
    throw new UnexpectedCodePathError(
      'sanity check failed: port alias not set correctly',
      { desired, foundBefore, foundAfter },
    );

  return new DeclaredUnixPortAlias({ ...desired, uri: service.uri });
};
