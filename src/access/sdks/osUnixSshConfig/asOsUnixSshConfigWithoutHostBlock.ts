/**
 * .what = computes the `~/.ssh/config` content with one `Host` block removed
 * .why = keeps the block splice/trim compute pure and testable, so the
 *        communicator dop stays focused on its raw i/o boundary
 *
 * .note = splices out the range, then trims surplus blank lines at the edges;
 *   returns '' when the removal leaves an otherwise empty file
 */
export const asOsUnixSshConfigWithoutHostBlock = (input: {
  content: string;
  range: { start: number; endExclusive: number };
}): string => {
  const { content, range } = input;
  const lines = content.split('\n');

  // splice out the block and trim surplus blank lines at the edges
  const kept = [
    ...lines.slice(0, range.start),
    ...lines.slice(range.endExclusive),
  ];
  const trimmed = `${kept.join('\n').replace(/^\n+/, '').replace(/\n*$/, '')}\n`;

  // an otherwise-empty file collapses to empty content
  return trimmed === '\n' ? '' : trimmed;
};
