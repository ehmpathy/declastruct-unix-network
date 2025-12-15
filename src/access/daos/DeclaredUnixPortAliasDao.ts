import { genDeclastructDao } from 'declastruct';
import type { ContextLogTrail } from 'simple-log-methods';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixPortAlias } from '@src/domain.objects/DeclaredUnixPortAlias';
import { getOneUnixPortAlias } from '@src/domain.operations/portAlias/getOneUnixPortAlias';
import { setUnixPortAlias } from '@src/domain.operations/portAlias/setUnixPortAlias';

/**
 * .what = declastruct DAO for unix port alias resources
 * .why = wraps existing port alias operations to conform to declastruct interface
 */
export const DeclaredUnixPortAliasDao = genDeclastructDao<
  typeof DeclaredUnixPortAlias,
  ContextUnixNetwork & ContextLogTrail
>({
  dobj: DeclaredUnixPortAlias,
  get: {
    one: {
      byUnique: async (input, context) => {
        return getOneUnixPortAlias({ by: { unique: input } }, context);
      },
      byPrimary: null,
    },
  },
  set: {
    findsert: async (input, context) => {
      return setUnixPortAlias({ findsert: input }, context);
    },
    upsert: async (input, context) => {
      return setUnixPortAlias({ upsert: input }, context);
    },
    delete: null,
  },
});
