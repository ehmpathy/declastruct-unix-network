import { DeclastructDao } from 'declastruct';
import { isRefByUnique, type Ref } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';

import type { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclaredUnixPortAlias } from '../../domain.objects/DeclaredUnixPortAlias';
import { getOneUnixPortAlias } from '../../domain.operations/portAlias/getOneUnixPortAlias';
import { setUnixPortAlias } from '../../domain.operations/portAlias/setUnixPortAlias';

/**
 * .what = declastruct DAO for unix port alias resources
 * .why = wraps existing port alias operations to conform to declastruct interface
 */
export const DeclaredUnixPortAliasDao = new DeclastructDao<
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
      byRef: async (
        input: Ref<typeof DeclaredUnixPortAlias>,
        context: ContextUnixNetwork & ContextLogTrail,
      ) => {
        if (isRefByUnique({ of: DeclaredUnixPortAlias })(input))
          return getOneUnixPortAlias({ by: { unique: input } }, context);
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
      return setUnixPortAlias({ finsert: input }, context);
    },
    upsert: async (input, context) => {
      return setUnixPortAlias({ upsert: input }, context);
    },
    delete: null,
  },
});
