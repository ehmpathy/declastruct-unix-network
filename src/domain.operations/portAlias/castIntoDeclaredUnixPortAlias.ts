import { OsUnixSystemdSocatService } from '../../access/sdks/osUnixSystemdSocat';
import {
  DeclaredUnixPortAlias,
  UnixPortEndpoint,
} from '../../domain.objects/DeclaredUnixPortAlias';

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
    from: new UnixPortEndpoint({
      host: input.service.listenHost,
      port: input.service.listenPort,
    }),
    into: new UnixPortEndpoint({
      host: input.service.connectHost,
      port: input.service.connectPort,
    }),
  });
};
