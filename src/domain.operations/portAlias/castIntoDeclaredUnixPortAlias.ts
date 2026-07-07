import type { OsUnixSystemdSocatService } from '@src/access/sdks/osUnixSystemdSocat';
import { DeclaredUnixPortAlias } from '@src/domain.objects/DeclaredUnixPortAlias';
import { UnixEndpoint } from '@src/domain.objects/UnixEndpoint';

/**
 * .what = casts an OsUnixSystemdSocatService to a DeclaredUnixPortAlias
 * .why = converts OS-level representation to domain object for domain operations
 *
 * .note = maps socat's native terminology to declarative terms:
 *   - listenHost → from.host (where listening from)
 *   - listenPort → from.port (what port listening on)
 *   - connectHost → into.host (where forwarding into)
 *   - connectPort → into.port (what port forwarding into)
 *   - uri → uri (metadata: systemd service file path)
 */
export const castIntoDeclaredUnixPortAlias = (input: {
  service: OsUnixSystemdSocatService;
}): DeclaredUnixPortAlias => {
  return DeclaredUnixPortAlias.as({
    uri: input.service.uri,
    via: 'systemd-socat',
    from: new UnixEndpoint({
      host: input.service.listenHost,
      port: input.service.listenPort,
    }),
    into: new UnixEndpoint({
      host: input.service.connectHost,
      port: input.service.connectPort,
    }),
  });
};
