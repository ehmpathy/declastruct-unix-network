/**
 * .what = public SDK exports for declastruct-unix-network package
 * .why = enables consumers to use the declastruct provider interface and domain objects
 */

// domain objects
export { DeclaredUnixHostAlias } from '@src/domain.objects/DeclaredUnixHostAlias';
export {
  DeclaredUnixPortAlias,
  UnixPortEndpoint,
} from '@src/domain.objects/DeclaredUnixPortAlias';
export type { DeclastructUnixNetworkProvider } from '@src/domain.objects/DeclastructUnixNetworkProvider';
export { getAllUnixHostAliases } from '@src/domain.operations/hostAlias/getAllUnixHostAliases';
// domain operations
export { getOneUnixHostAlias } from '@src/domain.operations/hostAlias/getOneUnixHostAlias';
export { setUnixHostAlias } from '@src/domain.operations/hostAlias/setUnixHostAlias';
export { getAllUnixPortAliases } from '@src/domain.operations/portAlias/getAllUnixPortAliases';
export { getOneUnixPortAlias } from '@src/domain.operations/portAlias/getOneUnixPortAlias';
export { setUnixPortAlias } from '@src/domain.operations/portAlias/setUnixPortAlias';
// provider
export { getDeclastructUnixNetworkProvider } from '@src/domain.operations/provider/getDeclastructUnixNetworkProvider';
