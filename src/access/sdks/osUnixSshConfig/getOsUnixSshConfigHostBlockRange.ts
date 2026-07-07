/**
 * .what = finds the line range of a `Host <alias>` block within config lines
 * .why = enables in-place replace/removal of one block without change to others
 *
 * .note = the block spans from its `Host` line up to but excludes the next
 *   `Host`/`Match` line or end of file. returns null if the alias is absent.
 */
export const getOsUnixSshConfigHostBlockRange = (input: {
  lines: string[];
  alias: string;
}): { start: number; endExclusive: number } | null => {
  // true when the trimmed line begins a block (`Host` or `Match`)
  const isBlockStart = (line: string): boolean => {
    const keyword = line.trim().split(/\s+/)[0]?.toLowerCase();
    return keyword === 'host' || keyword === 'match';
  };

  // true when the line is `Host <alias>` for the exact alias
  const isTargetHostLine = (line: string): boolean => {
    const [keyword, ...rest] = line.trim().split(/\s+/);
    if (keyword?.toLowerCase() !== 'host') return false;
    return rest.join(' ') === input.alias;
  };

  const start = input.lines.findIndex((line) => isTargetHostLine(line));
  if (start === -1) return null;

  let endExclusive = start + 1;
  while (
    endExclusive < input.lines.length &&
    !isBlockStart(input.lines[endExclusive]!)
  )
    endExclusive++;

  return { start, endExclusive };
};
