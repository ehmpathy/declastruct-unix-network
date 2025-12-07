import type {
  OsUnixHostsFileEntry,
  OsUnixHostsFileLine,
} from './dobj.OsUnixHostsFileEntry';

/**
 * .what = formats an OsUnixHostsFileEntry as a raw hosts file line string
 * .why = casts from domain object to raw OS file format for writing
 */
export const castFromOsUnixHostsFileEntry = (input: {
  entry: OsUnixHostsFileEntry;
}): OsUnixHostsFileLine => {
  const { entry } = input;
  const hostnamesStr = entry.hostnames.join('\t');
  const commentStr = entry.comment ? `\t# ${entry.comment}` : '';
  return `${entry.ip}\t${hostnamesStr}${commentStr}`;
};
