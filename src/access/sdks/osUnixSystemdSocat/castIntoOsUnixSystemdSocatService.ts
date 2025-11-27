import { OsUnixSystemdSocatService } from './dobj.OsUnixSystemdSocatService';

/**
 * .what = parses a systemd unit file content to extract socat config
 * .why = casts from raw systemd unit file format into domain object for SDK operations
 */
export const castIntoOsUnixSystemdSocatService = (input: {
  content: string;
  uri: string;
}): OsUnixSystemdSocatService | null => {
  const { content, uri } = input;

  // find the ExecStart line using socat's native TCP-LISTEN and TCP syntax
  const execStartMatch = content.match(
    /ExecStart=.*socat\s+TCP-LISTEN:(\d+),bind=([^,]+),.*TCP:([^:]+):(\d+)/,
  );

  if (!execStartMatch) return null;

  const [, listenPort, listenHost, connectHost, connectPort] = execStartMatch;

  if (!listenPort || !listenHost || !connectHost || !connectPort) return null;

  return {
    uri,
    listenHost,
    listenPort: parseInt(listenPort, 10),
    connectHost,
    connectPort: parseInt(connectPort, 10),
  };
};
