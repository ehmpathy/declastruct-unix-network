import type { ContextLogTrail } from 'simple-log-methods';

import { getSampleUnixNetworkContext } from '../../.test/assets/getSampleUnixNetworkContext';
import { ContextUnixNetwork } from '../../domain.objects/ContextUnixNetwork';
import { DeclaredUnixHostAlias } from '../../domain.objects/DeclaredUnixHostAlias';
import * as getUnixHostAliasModule from './getOneUnixHostAlias';
import { setUnixHostAlias } from './setUnixHostAlias';

jest.mock('../../access/sdks/osUnixHostsFile', () => ({
  osUnixHostsFileSdk: {
    addOsUnixHostsFileEntry: jest.fn().mockResolvedValue(undefined),
    replaceOsUnixHostsFileEntry: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('./getOneUnixHostAlias');

const context: ContextUnixNetwork & ContextLogTrail = {
  log: console,
  ...getSampleUnixNetworkContext(),
};

const aliasSample = new DeclaredUnixHostAlias({
  via: '/etc/hosts',
  from: 'myhost.local',
  into: '192.168.1.100',
});

describe('setUnixHostAlias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns found entry for finsert if hostname already exists', async () => {
    const foundBefore = new DeclaredUnixHostAlias({
      via: '/etc/hosts',
      from: 'myhost.local',
      into: '192.168.1.50', // different ip
    });
    (getUnixHostAliasModule.getOneUnixHostAlias as jest.Mock).mockResolvedValue(
      foundBefore,
    );

    const result = await setUnixHostAlias({ finsert: aliasSample }, context);

    // should return foundBefore ip, not the desired one
    expect(result.from).toBe('myhost.local');
    expect(result.into).toBe('192.168.1.50');

    // should not have written anything
    const { osUnixHostsFileSdk } = jest.requireMock(
      '../../access/sdks/osUnixHostsFile',
    );
    expect(osUnixHostsFileSdk.addOsUnixHostsFileEntry).not.toHaveBeenCalled();
  });

  it('returns found entry for upsert if hostname exists with same ip', async () => {
    const foundBefore = new DeclaredUnixHostAlias({
      via: '/etc/hosts',
      from: 'myhost.local',
      into: '192.168.1.100', // same ip
    });
    (getUnixHostAliasModule.getOneUnixHostAlias as jest.Mock).mockResolvedValue(
      foundBefore,
    );

    const result = await setUnixHostAlias({ upsert: aliasSample }, context);

    // should return foundBefore (already correct)
    expect(result.from).toBe('myhost.local');
    expect(result.into).toBe('192.168.1.100');

    // should not have written anything
    const { osUnixHostsFileSdk } = jest.requireMock(
      '../../access/sdks/osUnixHostsFile',
    );
    expect(osUnixHostsFileSdk.addOsUnixHostsFileEntry).not.toHaveBeenCalled();
  });

  it('updates entry for upsert if hostname exists with different ip', async () => {
    const foundBefore = new DeclaredUnixHostAlias({
      via: '/etc/hosts',
      from: 'myhost.local',
      into: '192.168.1.50', // different ip
    });
    (getUnixHostAliasModule.getOneUnixHostAlias as jest.Mock)
      .mockResolvedValueOnce(foundBefore) // first call: check if exists
      .mockResolvedValueOnce(aliasSample); // second call: sanity check after write

    const result = await setUnixHostAlias({ upsert: aliasSample }, context);

    // should return desired (updated)
    expect(result.from).toBe('myhost.local');
    expect(result.into).toBe('192.168.1.100');

    // should have called replace, not add
    const { osUnixHostsFileSdk } = jest.requireMock(
      '../../access/sdks/osUnixHostsFile',
    );
    expect(osUnixHostsFileSdk.addOsUnixHostsFileEntry).not.toHaveBeenCalled();
    expect(osUnixHostsFileSdk.replaceOsUnixHostsFileEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        oldEntry: expect.objectContaining({
          ip: '192.168.1.50',
          hostnames: ['myhost.local'],
        }),
        newEntry: expect.objectContaining({
          ip: '192.168.1.100',
          hostnames: ['myhost.local'],
        }),
      }),
      context,
    );
  });

  it('appends new entry if hostname does not exist', async () => {
    (getUnixHostAliasModule.getOneUnixHostAlias as jest.Mock)
      .mockResolvedValueOnce(null) // first call: check if exists
      .mockResolvedValueOnce(aliasSample); // second call: sanity check after write

    const { osUnixHostsFileSdk } = jest.requireMock(
      '../../access/sdks/osUnixHostsFile',
    );

    const result = await setUnixHostAlias({ finsert: aliasSample }, context);

    expect(result.from).toBe('myhost.local');
    expect(result.into).toBe('192.168.1.100');

    // verify add was called with context
    expect(osUnixHostsFileSdk.addOsUnixHostsFileEntry).toHaveBeenCalledWith(
      {
        entry: expect.objectContaining({
          ip: '192.168.1.100',
          hostnames: ['myhost.local'],
          comment: 'managed by declastruct',
        }),
      },
      context,
    );
  });
});
