import type { OsUnixSshConfigHost } from './dobj.OsUnixSshConfigHost';

/**
 * .what = parses ~/.ssh/config content into its `Host` blocks
 * .why = converts the raw file into structured blocks for operations
 *
 * .note = scope is plain `Host <alias>` blocks; we deliberately do not handle
 *   `Match`/`Include`/wildcard patterns. a `Match` line ends the current block.
 */
export const castIntoOsUnixSshConfigHosts = (input: {
  content: string;
}): OsUnixSshConfigHost[] => {
  const lines = input.content.split('\n');
  const hosts: OsUnixSshConfigHost[] = [];
  let current: OsUnixSshConfigHost | null = null;

  // commit the in-progress block, if any
  const commit = () => {
    if (current) hosts.push(current);
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // skip blanks and comments
    if (!line || line.startsWith('#')) continue;

    // split keyword from value
    const [keywordRaw, ...valueParts] = line.split(/\s+/);
    const keyword = (keywordRaw ?? '').toLowerCase();
    const value = valueParts.join(' ');

    // a `Host` line starts a new block
    if (keyword === 'host') {
      commit();
      current = {
        alias: value,
        hostName: null,
        port: null,
        user: null,
        identityFile: null,
      };
      continue;
    }

    // a `Match` line ends the current block (Match blocks are out of scope)
    if (keyword === 'match') {
      commit();
      continue;
    }

    // keywords outside a block are ignored
    if (!current) continue;

    // capture the keywords our resource models
    if (keyword === 'hostname') current.hostName = value;
    else if (keyword === 'port') {
      const parsed = Number(value);
      current.port = Number.isFinite(parsed) ? parsed : null;
    } else if (keyword === 'user') current.user = value;
    else if (keyword === 'identityfile') current.identityFile = value;
  }

  commit();
  return hosts;
};
