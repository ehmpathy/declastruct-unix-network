import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

import { castIntoOsUnixSshConfigHosts } from './castIntoOsUnixSshConfigHosts';
import type { OsUnixSshConfigHost } from './dobj.OsUnixSshConfigHost';
import { getOsUnixSshConfigContent } from './getOsUnixSshConfigContent';

/**
 * .what = reads and parses all `Host` blocks from ~/.ssh/config
 * .why = provides access to ssh config content as structured data
 */
export const getOsUnixSshConfigHosts = async (
  _input: unknown,
  context: ContextUnixNetwork,
): Promise<OsUnixSshConfigHost[]> => {
  const content = await getOsUnixSshConfigContent(context);
  return castIntoOsUnixSshConfigHosts({ content });
};
