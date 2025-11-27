/**
 * .what = public SDK exports for declastruct-unix-network package
 * .why = enables consumers to use the declastruct provider interface and domain objects
 */

// provider
export { getDeclastructUnixNetworkProvider } from '../../domain.operations/provider/getDeclastructUnixNetworkProvider';
export type { DeclastructUnixNetworkProvider } from '../../domain.objects/DeclastructUnixNetworkProvider';

// domain objects
export { DeclaredUnixHostAlias } from '../../domain.objects/DeclaredUnixHostAlias';
export {
  DeclaredUnixPortAlias,
  UnixPortEndpoint,
} from '../../domain.objects/DeclaredUnixPortAlias';

// domain operations
export { getOneUnixHostAlias } from '../../domain.operations/hostAlias/getOneUnixHostAlias';
export { getAllUnixHostAliases } from '../../domain.operations/hostAlias/getAllUnixHostAliases';
export { setUnixHostAlias } from '../../domain.operations/hostAlias/setUnixHostAlias';
export { getOneUnixPortAlias } from '../../domain.operations/portAlias/getOneUnixPortAlias';
export { getAllUnixPortAliases } from '../../domain.operations/portAlias/getAllUnixPortAliases';
export { setUnixPortAlias } from '../../domain.operations/portAlias/setUnixPortAlias';
