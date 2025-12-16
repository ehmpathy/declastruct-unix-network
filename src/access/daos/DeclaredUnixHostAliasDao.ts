import { genDeclastructDao } from 'declastruct';
import type { ContextLogTrail } from 'simple-log-methods';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixHostAlias } from '@src/domain.objects/DeclaredUnixHostAlias';
import { getOneUnixHostAlias } from '@src/domain.operations/hostAlias/getOneUnixHostAlias';
import { setUnixHostAlias } from '@src/domain.operations/hostAlias/setUnixHostAlias';

/**
 * .what = declastruct DAO for unix host alias resources
 * .why = wraps existing host alias operations to conform to declastruct interface
 */
export const DeclaredUnixHostAliasDao = genDeclastructDao<
  typeof DeclaredUnixHostAlias,
  ContextUnixNetwork & ContextLogTrail
>({
  dobj: DeclaredUnixHostAlias,
  get: {
    one: {
      byUnique: async (input, context) => {
        return getOneUnixHostAlias({ by: { unique: input } }, context);
      },
      byPrimary: null,
    },
  },
  set: {
    findsert: async (input, context) => {
      return setUnixHostAlias({ findsert: input }, context);
    },
    upsert: async (input, context) => {
      return setUnixHostAlias({ upsert: input }, context);
    },
    delete: null,
  },
});
