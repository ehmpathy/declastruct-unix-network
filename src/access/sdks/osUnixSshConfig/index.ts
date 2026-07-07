import { delOsUnixSshConfigHost } from './dop.delOsUnixSshConfigHost';
import { getOsUnixSshConfigHosts } from './dop.getOsUnixSshConfigHosts';
import { setOsUnixSshConfigHost } from './dop.setOsUnixSshConfigHost';

export type { OsUnixSshConfigHost } from './dobj.OsUnixSshConfigHost';

/**
 * .what = SDK over the ~/.ssh/config `Host` blocks
 * .why = provides structured, idempotent operations over the ssh config file
 */
export const osUnixSshConfigSdk = {
  getOsUnixSshConfigHosts,
  setOsUnixSshConfigHost,
  delOsUnixSshConfigHost,
};
