import { DeclastructDao } from 'declastruct';
import { isRefByUnique } from 'domain-objects';
import { UnexpectedCodePathError } from 'helpful-errors';
import type { ContextLogTrail } from 'simple-log-methods';

import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclaredUnixHostAlias } from '../../domain.objects/DeclaredUnixHostAlias';
import { getOneUnixHostAlias } from '../../domain.operations/hostAlias/getOneUnixHostAlias';
import { setUnixHostAlias } from '../../domain.operations/hostAlias/setUnixHostAlias';

/**
 * .what = declastruct DAO for unix host alias resources
 * .why = wraps existing host alias operations to conform to declastruct interface
 */
export const DeclaredUnixHostAliasDao = new DeclastructDao<
  DeclaredUnixHostAlias,
  typeof DeclaredUnixHostAlias,
  ContextUnixNetwork & ContextLogTrail
>({
  get: {
    byUnique: async (input, context) => {
      return getOneUnixHostAlias({ by: { unique: input } }, context);
    },
    byRef: async (input, context) => {
      if (isRefByUnique({ of: DeclaredUnixHostAlias })(input))
        return getOneUnixHostAlias({ by: { unique: input } }, context);
      UnexpectedCodePathError.throw('unsupported ref type', { input });
    },
  },
  set: {
    finsert: async (input, context) => {
      return setUnixHostAlias({ finsert: input }, context);
    },
    upsert: async (input, context) => {
      return setUnixHostAlias({ upsert: input }, context);
    },
  },
});
