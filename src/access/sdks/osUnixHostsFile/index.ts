import { addOsUnixHostsFileEntry } from './dop.addOsUnixHostsFileLine';
import { getOsUnixHostsFileEntries } from './dop.getOsUnixHostsFileLines';
import { replaceOsUnixHostsFileEntry } from './dop.replaceOsUnixHostsFileLine';

export {
  OsUnixHostsFileLine,
  OsUnixHostsFileEntry,
} from './dobj.OsUnixHostsFileEntry';

/**
 * .what = SDK for accessing /etc/hosts file
 * .why = provides structured operations on the OS hosts file
 */
export const osUnixHostsFileSdk = {
  getOsUnixHostsFileEntries,
  addOsUnixHostsFileEntry,
  replaceOsUnixHostsFileEntry,
};
