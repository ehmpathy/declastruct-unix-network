import type { ContextLogTrail } from 'simple-log-methods';

import { osUnixSshConfigSdk } from '@src/access/sdks/osUnixSshConfig';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import type { DeclaredUnixSshAlias } from '@src/domain.objects/DeclaredUnixSshAlias';

import { castIntoDeclaredUnixSshAliases } from './castIntoDeclaredUnixSshAliases';

/**
 * .what = gets all unix ssh aliases from ~/.ssh/config
 * .why = retrieves ALL aliases for full declarative visibility of system state
 *
 * .note = blocks that lack the full managed shape are skipped
 */
export const getAllUnixSshAliases = async (
  _input: unknown,
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixSshAlias[]> => {
  const hosts = await osUnixSshConfigSdk.getOsUnixSshConfigHosts({}, context);
  return castIntoDeclaredUnixSshAliases({ hosts });
};
