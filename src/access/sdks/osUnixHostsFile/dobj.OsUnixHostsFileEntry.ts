/**
 * .what = a raw line string from /etc/hosts file
 * .why = type alias for clarity when passing raw line strings
 */
export type OsUnixHostsFileLine = string;

/**
 * .what = parsed entry from /etc/hosts file using the OS's native format
 * .why = intermediate representation for hosts file operations at the OS access layer
 *
 * .note = represents the raw structure of a hosts file entry:
 *   - format: `<ip> <hostname1> [hostname2...] [# comment]`
 *   - no usecase-specific attributes; only what the OS exposes
 *
 * @see https://man7.org/linux/man-pages/man5/hosts.5.html
 */
export interface OsUnixHostsFileEntry {
  /**
   * .what = the IP address for this hosts entry
   * .why = first field in a hosts file line, maps hostnames to this address
   *
   * @see https://man7.org/linux/man-pages/man5/hosts.5.html
   */
  ip: string;

  /**
   * .what = list of hostnames associated with the IP
   * .why = second+ fields in a hosts file line, resolved to the IP address
   *
   * @see https://man7.org/linux/man-pages/man5/hosts.5.html
   */
  hostnames: string[];

  /**
   * .what = optional inline comment after the `#` character
   * .why = hosts file allows trailing comments for documentation
   *
   * @see https://man7.org/linux/man-pages/man5/hosts.5.html
   */
  comment?: string;
}
