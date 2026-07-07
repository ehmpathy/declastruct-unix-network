/**
 * .what = computes the `~/.ssh/config` content with one `Host` block set
 * .why = keeps the block splice/append compute pure and testable, so the
 *        communicator dop stays focused on its raw i/o boundary
 *
 * .note = replaces the block in place when `range` is present, else appends it
 *   after a blank-line separator (or as the sole block for empty content)
 */
export const asOsUnixSshConfigWithHostBlock = (input: {
  content: string;
  blockText: string;
  range: { start: number; endExclusive: number } | null;
}): string => {
  const { content, blockText, range } = input;
  const lines = content.length ? content.split('\n') : [];

  // replace the block in place; all peer blocks stay untouched
  if (range) {
    const spliced = [
      ...lines.slice(0, range.start),
      ...blockText.split('\n'),
      ...lines.slice(range.endExclusive),
    ];
    return `${spliced.join('\n').replace(/\n*$/, '')}\n`;
  }

  // append after a blank-line separator, or as the sole block
  const base = content.replace(/\n*$/, '');
  return base.length ? `${base}\n\n${blockText}\n` : `${blockText}\n`;
};
