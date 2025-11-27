import { DeclastructDao } from 'declastruct';
import { isRefByUnique } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';

import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclaredUnixPortAlias } from '../../domain.objects/DeclaredUnixPortAlias';
import { getOneUnixPortAlias } from '../../domain.operations/portAlias/getOneUnixPortAlias';
import { setUnixPortAlias } from '../../domain.operations/portAlias/setUnixPortAlias';

/**
 * .what = declastruct DAO for unix port alias resources
 * .why = wraps existing port alias operations to conform to declastruct interface
 */
export const DeclaredUnixPortAliasDao = new DeclastructDao<
  DeclaredUnixPortAlias,
  typeof DeclaredUnixPortAlias,
  ContextUnixNetwork & ContextLogTrail
>({
  get: {
    byUnique: async (input, context) => {
      return getOneUnixPortAlias({ by: { unique: input } }, context);
    },
    byRef: async (input, context) => {
      if (isRefByUnique({ of: DeclaredUnixPortAlias })(input))
        return getOneUnixPortAlias({ by: { unique: input } }, context);
      UnexpectedCodePathError.throw('unsupported ref type', { input });
    },
  },
  set: {
    finsert: async (input, context) => {
      return setUnixPortAlias({ finsert: input }, context);
    },
    upsert: async (input, context) => {
      return setUnixPortAlias({ upsert: input }, context);
    },
  },
});
