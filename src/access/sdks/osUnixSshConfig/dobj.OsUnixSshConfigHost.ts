/**
 * .what = a parsed `Host` block from ~/.ssh/config in the OS's native format
 * .why = intermediate representation for ssh config operations at the OS layer
 *
 * .note = represents a single `Host <alias>` block:
 *   - keywords are case-insensitive; values kept verbatim
 *   - fields absent in the block parse to null
 *   - we model only the keywords our resource manages
 *
 * @see https://man7.org/linux/man-pages/man5/ssh_config.5.html
 */
export interface OsUnixSshConfigHost {
  /**
   * .what = the `Host` alias label
   */
  alias: string;

  /**
   * .what = the `HostName` target; null if the block omits it
   */
  hostName: string | null;

  /**
   * .what = the `Port` number; null if the block omits it
   */
  port: number | null;

  /**
   * .what = the `User` login; null if the block omits it
   */
  user: string | null;

  /**
   * .what = the `IdentityFile` private key path; null if the block omits it
   */
  identityFile: string | null;
}
