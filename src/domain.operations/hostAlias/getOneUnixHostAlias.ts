import type { RefByUnique } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';
import type { PickOne } from 'type-fns';

import type { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import type { DeclaredUnixHostAlias } from '../../domain.objects/DeclaredUnixHostAlias';
import { getAllUnixHostAliases } from './getAllUnixHostAliases';

/**
 * .what = gets one unix host alias from /etc/hosts
 * .why = retrieves current state of a host alias for declarative management
 */
export const getOneUnixHostAlias = async (
  input: {
    by: PickOne<{
      unique: RefByUnique<typeof DeclaredUnixHostAlias>;
    }>;
  },
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixHostAlias | null> => {
  // determine hostname from input
  const hostname = (() => {
    if (input.by.unique) return input.by.unique.from;

    UnexpectedCodePathError.throw('not referenced by unique. how not?', {
      input,
    });
  })();

  // get all aliases and find matching one
  const aliases = await getAllUnixHostAliases({}, context);

  // find entry with matching hostname
  return aliases.find((alias) => alias.from === hostname) ?? null;
};
