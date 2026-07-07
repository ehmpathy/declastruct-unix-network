import { genDeclastructDao } from 'declastruct';
import type { ContextLogTrail } from 'simple-log-methods';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';
import { delUnixSshKeypair } from '@src/domain.operations/sshKeypair/delUnixSshKeypair';
import { getOneUnixSshKeypair } from '@src/domain.operations/sshKeypair/getOneUnixSshKeypair';
import { setUnixSshKeypair } from '@src/domain.operations/sshKeypair/setUnixSshKeypair';

/**
 * .what = declastruct DAO for unix ssh keypair resources
 * .why = wraps the keypair operations to conform to the declastruct interface
 *
 * .note = upsert is null: a private key is never overwritten (findsert-only)
 */
export const DeclaredUnixSshKeypairDao = genDeclastructDao<
  typeof DeclaredUnixSshKeypair,
  ContextUnixNetwork & ContextLogTrail
>({
  dobj: DeclaredUnixSshKeypair,
  get: {
    one: {
      byUnique: async (input, context) => {
        return getOneUnixSshKeypair({ by: { unique: input } }, context);
      },
      byPrimary: null,
    },
  },
  set: {
    findsert: async (input, context) => {
      return setUnixSshKeypair({ findsert: input }, context);
    },
    upsert: null,
    delete: async (input, context) => {
      return delUnixSshKeypair({ ref: input }, context);
    },
  },
});
