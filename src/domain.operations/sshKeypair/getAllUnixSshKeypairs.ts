import type { ContextLogTrail } from 'simple-log-methods';

import { osUnixSshKeygenSdk } from '@src/access/sdks/osUnixSshKeygen';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import type { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';

import { castIntoDeclaredUnixSshKeypair } from './castIntoDeclaredUnixSshKeypair';

/**
 * .what = gets all unix ssh keypairs in the configured keys directory
 * .why = retrieves ALL keypairs for full declarative visibility of system state
 */
export const getAllUnixSshKeypairs = async (
  _input: unknown,
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixSshKeypair[]> => {
  const found = await osUnixSshKeygenSdk.getOsUnixSshKeypairs({}, context);
  return found.map((keypair) => castIntoDeclaredUnixSshKeypair({ keypair }));
};
