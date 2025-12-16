import { DeclastructDao } from 'declastruct';
import { isRefByUnique, type Ref } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixHostAlias } from '@src/domain.objects/DeclaredUnixHostAlias';
import { getOneUnixHostAlias } from '@src/domain.operations/hostAlias/getOneUnixHostAlias';
import { setUnixHostAlias } from '@src/domain.operations/hostAlias/setUnixHostAlias';

/**
 * .what = declastruct DAO for unix host alias resources
 * .why = wraps existing host alias operations to conform to declastruct interface
 */
export const DeclaredUnixHostAliasDao = new DeclastructDao<
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
      byRef: async (
        input: Ref<typeof DeclaredUnixHostAlias>,
        context: ContextUnixNetwork & ContextLogTrail,
      ) => {
        if (isRefByUnique({ of: DeclaredUnixHostAlias })(input))
          return getOneUnixHostAlias({ by: { unique: input } }, context);
        UnexpectedCodePathError.throw('unsupported ref type', { input });
      },
    },
    ref: {
      byPrimary: null,
      byUnique: null,
    },
  },
  set: {
    finsert: async (input, context) => {
      return setUnixHostAlias({ finsert: input }, context);
    },
    upsert: async (input, context) => {
      return setUnixHostAlias({ upsert: input }, context);
    },
    delete: null,
  },
});
