import execa from 'execa';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

import { castIntoOsUnixHostsFileEntry } from './castIntoOsUnixHostsFileEntry';
import type { OsUnixHostsFileEntry } from './dobj.OsUnixHostsFileEntry';

/**
 * .what = reads and parses all entries from /etc/hosts
 * .why = provides access to hosts file content as structured data
 */
export const getOsUnixHostsFileEntries = async (
  _input: unknown,
  context: ContextUnixNetwork,
): Promise<OsUnixHostsFileEntry[]> => {
  // read hosts file via execa
  const hostsPath = context.osUnixNetwork.repo.etcHostsPath;
  const { stdout: content } = await execa('cat', [hostsPath]);

  // parse each line into entries
  const rawLines = content.split('\n');
  const entries: OsUnixHostsFileEntry[] = [];

  for (const rawLine of rawLines) {
    const parsed = castIntoOsUnixHostsFileEntry({ line: rawLine });
    if (parsed) entries.push(parsed);
  }

  return entries;
};
