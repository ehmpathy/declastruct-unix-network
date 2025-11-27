import { RefByUnique } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';
import { PickOne } from 'type-fns';

import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclaredUnixPortAlias } from '../../domain.objects/DeclaredUnixPortAlias';
import { getAllUnixPortAliases } from './getAllUnixPortAliases';

/**
 * .what = gets one unix port alias from systemd
 * .why = retrieves current state of a port alias for declarative management
 */
export const getOneUnixPortAlias = async (
  input: {
    by: PickOne<{
      unique: RefByUnique<typeof DeclaredUnixPortAlias>;
    }>;
  },
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixPortAlias | null> => {
  // determine from endpoint from input
  const { from } = (() => {
    if (input.by.unique) return { from: input.by.unique.from };

    UnexpectedCodePathError.throw('not referenced by unique. how not?', {
      input,
    });
  })();

  // get all aliases and find matching one
  const aliases = await getAllUnixPortAliases({}, context);

  // find entry with matching from endpoint
  return (
    aliases.find(
      (alias) => alias.from.host === from.host && alias.from.port === from.port,
    ) ?? null
  );
};
