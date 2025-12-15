import execa from 'execa';

import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';

import { castIntoOsUnixSystemdSocatService } from './castIntoOsUnixSystemdSocatService';
import type { OsUnixSystemdSocatService } from './dobj.OsUnixSystemdSocatService';

/**
 * .what = lists all socat service uris in systemd
 * .why = provides service discovery for ALL socat port forwarding services
 */
const listOsUnixSystemdSocatServiceUris = async (
  context: ContextUnixNetwork,
): Promise<string[]> => {
  const unitDir = context.osUnixNetwork.repo.systemdUnitsDir;

  // use ls via bash for consistent behavior
  const { stdout } = await execa('bash', [
    '-c',
    `ls ${unitDir}/*.service 2>/dev/null || true`,
  ]);

  if (!stdout.trim()) return [];

  return stdout.trim().split('\n').filter(Boolean);
};

/**
 * .what = reads a systemd socat service unit file
 * .why = provides raw file access for service parsing
 */
const readOsUnixSystemdSocatServiceContent = async (input: {
  uri: string;
}): Promise<string | null> => {
  try {
    const { stdout } = await execa('cat', [input.uri]);
    return stdout;
  } catch (error) {
    if (!(error instanceof Error)) throw error;

    // handle if service file doesn't exist (ENOENT)
    if (
      error.message.includes('ENOENT') ||
      error.message.includes('No such file')
    )
      return null;

    // otherwise, we don't know what went wrong - fail fast
    throw error;
  }
};

/**
 * .what = reads and parses all socat services from systemd
 * .why = provides access to ALL systemd socat services as structured data (not just declastruct-managed)
 */
export const getOsUnixSystemdSocatServices = async (
  _input: unknown,
  context: ContextUnixNetwork,
): Promise<OsUnixSystemdSocatService[]> => {
  // list all service unit uris in the directory
  const serviceUris = await listOsUnixSystemdSocatServiceUris(context);

  const services: OsUnixSystemdSocatService[] = [];

  for (const uri of serviceUris) {
    // read service unit content
    const content = await readOsUnixSystemdSocatServiceContent({ uri });
    if (!content) continue;

    // parse service unit (only includes services that match socat pattern)
    const parsed = castIntoOsUnixSystemdSocatService({ content, uri });
    if (parsed) services.push(parsed);
  }

  return services;
};
