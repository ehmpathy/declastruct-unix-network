import type {
  OsUnixHostsFileEntry,
  OsUnixHostsFileLine,
} from './dobj.OsUnixHostsFileEntry';

/**
 * .what = parses a raw hosts file line string into structured OsUnixHostsFileEntry
 * .why = casts from raw OS file format into domain object for SDK operations
 */
export const castIntoOsUnixHostsFileEntry = (input: {
  line: OsUnixHostsFileLine;
}): OsUnixHostsFileEntry | null => {
  const { line } = input;

  // skip empty lines
  const trimmed = line.trim();
  if (trimmed === '') return null;

  // skip comment-only lines
  if (trimmed.startsWith('#')) return null;

  // extract comment if present
  const commentIndex = trimmed.indexOf('#');
  const mainPart =
    commentIndex >= 0 ? trimmed.slice(0, commentIndex).trim() : trimmed;
  const comment =
    commentIndex >= 0 ? trimmed.slice(commentIndex + 1).trim() : undefined;

  // split into ip and hostnames
  const parts = mainPart.split(/\s+/).filter((p) => p.length > 0);
  if (parts.length < 2) return null;

  const [ip, ...hostnames] = parts;
  if (!ip || hostnames.length === 0) return null;

  return {
    ip,
    hostnames,
    comment,
  };
};
