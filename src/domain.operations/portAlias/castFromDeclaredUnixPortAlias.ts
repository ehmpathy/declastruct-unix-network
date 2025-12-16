import type { OsUnixSystemdSocatService } from '@src/access/sdks/osUnixSystemdSocat';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import type { DeclaredUnixPortAlias } from '@src/domain.objects/DeclaredUnixPortAlias';

/**
 * .what = generates the systemd service uri for a port alias
 * .why = provides consistent, deterministic naming convention for socat services
 *
 * .note = uri is always derived from the from endpoint, ensuring idempotency
 */
const generateServiceUri = (input: {
  alias: DeclaredUnixPortAlias;
  unitDir: string;
}): string => {
  const { alias, unitDir } = input;

  // generate service name from source endpoint (deterministic)
  const hostPart = alias.from.host.replace(/\./g, '-');
  const serviceName = `declastruct-socat-${hostPart}-${alias.from.port}`;

  return `${unitDir}/${serviceName}.service`;
};

/**
 * .what = casts a DeclaredUnixPortAlias to an OsUnixSystemdSocatService
 * .why = converts domain object to OS-level representation for writing to systemd
 *
 * .note = maps declarative terms to socat's native terminology:
 *   - from.host → listenHost (where to listen)
 *   - from.port → listenPort (what port to listen on)
 *   - into.host → connectHost (where to forward to)
 *   - into.port → connectPort (what port to forward to)
 */
export const castFromDeclaredUnixPortAlias = (
  input: { alias: DeclaredUnixPortAlias },
  context: ContextUnixNetwork,
): OsUnixSystemdSocatService => {
  const unitDir = context.osUnixNetwork.repo.systemdUnitsDir;

  return {
    uri: generateServiceUri({ alias: input.alias, unitDir }),
    listenHost: input.alias.from.host,
    listenPort: input.alias.from.port,
    connectHost: input.alias.into.host,
    connectPort: input.alias.into.port,
  };
};
