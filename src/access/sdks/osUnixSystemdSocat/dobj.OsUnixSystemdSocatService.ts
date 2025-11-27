/**
 * .what = parsed systemd socat service data using socat's native terminology
 * .why = intermediate representation for systemd socat service operations at the OS access layer
 *
 * .note = uses socat's native terms:
 *   - listenHost + listenPort = the TCP-LISTEN:<port>,bind=<host> side
 *   - connectHost + connectPort = the TCP:<host>:<port> side
 *
 * @see https://manpages.debian.org/testing/socat/socat.1.en.html
 */
export interface OsUnixSystemdSocatService {
  /**
   * .what = systemd service unit file path
   * .why = identifies the exact location of the service file in /etc/systemd/system/
   */
  uri: string;

  /**
   * .what = local host/address to listen on
   * .why = socat's `bind=<host>` option on TCP-LISTEN specifies which interface to accept connections on
   *
   * @see https://manpages.debian.org/testing/socat/socat.1.en.html - "bind=<sockname>" option
   */
  listenHost: string;

  /**
   * .what = local port to listen for incoming connections
   * .why = socat's `TCP-LISTEN:<port>` address type opens a server socket on this port
   *
   * @see https://manpages.debian.org/testing/socat/socat.1.en.html - "TCP-LISTEN" address type
   */
  listenPort: number;

  /**
   * .what = remote host to forward connections to
   * .why = socat's `TCP:<host>:<port>` address type establishes outbound connection to this host
   *
   * @see https://manpages.debian.org/testing/socat/socat.1.en.html - "TCP" address type
   */
  connectHost: string;

  /**
   * .what = remote port to forward connections to
   * .why = socat's `TCP:<host>:<port>` address type establishes outbound connection on this port
   *
   * @see https://manpages.debian.org/testing/socat/socat.1.en.html - "TCP" address type
   */
  connectPort: number;
}
