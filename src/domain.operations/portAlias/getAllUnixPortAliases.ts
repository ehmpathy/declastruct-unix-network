import type { ContextLogTrail } from 'simple-log-methods';

import { osUnixSystemdSocatSdk } from '../../access/sdks/osUnixSystemdSocat';
import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclaredUnixPortAlias } from '../../domain.objects/DeclaredUnixPortAlias';
import { castIntoDeclaredUnixPortAlias } from './castIntoDeclaredUnixPortAlias';

/**
 * .what = gets all unix port aliases from systemd
 * .why = retrieves ALL port aliases for full declarative control over system state
 */
export const getAllUnixPortAliases = async (
  _input: unknown,
  context: ContextUnixNetwork & ContextLogTrail,
): Promise<DeclaredUnixPortAlias[]> => {
  // get all socat services via SDK
  const services = await osUnixSystemdSocatSdk.getOsUnixSystemdSocatServices(
    {},
    context,
  );

  // convert to domain objects (uri is included as metadata)
  return services.map((service) => castIntoDeclaredUnixPortAlias({ service }));
};
