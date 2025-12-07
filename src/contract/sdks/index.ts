/**
 * .what = public SDK exports for declastruct-unix-network package
 * .why = enables consumers to use the declastruct provider interface and domain objects
 */

// domain objects
export { DeclaredUnixHostAlias } from '../../domain.objects/DeclaredUnixHostAlias';
export {
  DeclaredUnixPortAlias,
  UnixPortEndpoint,
} from '../../domain.objects/DeclaredUnixPortAlias';
export type { DeclastructUnixNetworkProvider } from '../../domain.objects/DeclastructUnixNetworkProvider';
export { getAllUnixHostAliases } from '../../domain.operations/hostAlias/getAllUnixHostAliases';

// domain operations
export { getOneUnixHostAlias } from '../../domain.operations/hostAlias/getOneUnixHostAlias';
export { setUnixHostAlias } from '../../domain.operations/hostAlias/setUnixHostAlias';
export { getAllUnixPortAliases } from '../../domain.operations/portAlias/getAllUnixPortAliases';
export { getOneUnixPortAlias } from '../../domain.operations/portAlias/getOneUnixPortAlias';
export { setUnixPortAlias } from '../../domain.operations/portAlias/setUnixPortAlias';
// provider
export { getDeclastructUnixNetworkProvider } from '../../domain.operations/provider/getDeclastructUnixNetworkProvider';
