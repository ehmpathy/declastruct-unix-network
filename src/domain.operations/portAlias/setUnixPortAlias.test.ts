import type { ContextLogTrail } from 'simple-log-methods';
import { given, then, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import {
  DeclaredUnixPortAlias,
  UnixPortEndpoint,
} from '@src/domain.objects/DeclaredUnixPortAlias';

import * as getUnixPortAliasModule from './getOneUnixPortAlias';
import { setUnixPortAlias } from './setUnixPortAlias';

jest.mock('../../access/sdks/osUnixSystemdSocat', () => ({
  osUnixSystemdSocatSdk: {
    setOsUnixSystemdSocatService: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('./getOneUnixPortAlias');

const context: ContextUnixNetwork & ContextLogTrail = {
  log: console,
  ...getSampleUnixNetworkContext(),
};

const aliasSample = new DeclaredUnixPortAlias({
  via: 'systemd-socat',
  from: new UnixPortEndpoint({ host: '127.0.0.1', port: 5432 }),
  into: new UnixPortEndpoint({ host: '127.0.0.1', port: 15432 }),
});

describe('setUnixPortAlias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  given('alias already exists with different target', () => {
    const foundBefore = new DeclaredUnixPortAlias({
      uri: '/etc/systemd/system/declastruct-socat-127-0-0-1-5432.service',
      via: 'systemd-socat',
      from: new UnixPortEndpoint({ host: '127.0.0.1', port: 5432 }),
      into: new UnixPortEndpoint({ host: '127.0.0.1', port: 99999 }),
    });

    when('findsert is called', () => {
      beforeEach(() => {
        (
          getUnixPortAliasModule.getOneUnixPortAlias as jest.Mock
        ).mockResolvedValue(foundBefore);
      });

      then(
        'it should return foundBefore alias without modification',
        async () => {
          const result = await setUnixPortAlias(
            { findsert: aliasSample },
            context,
          );

          // should return foundBefore, not desired
          expect(result.into.port).toBe(99999);

          // should not have written anything
          const { osUnixSystemdSocatSdk } = jest.requireMock(
            '../../access/sdks/osUnixSystemdSocat',
          );
          expect(
            osUnixSystemdSocatSdk.setOsUnixSystemdSocatService,
          ).not.toHaveBeenCalled();
        },
      );
    });

    when('upsert is called', () => {
      const foundAfter = new DeclaredUnixPortAlias({
        uri: '/etc/systemd/system/declastruct-socat-127-0-0-1-5432.service',
        via: 'systemd-socat',
        from: new UnixPortEndpoint({ host: '127.0.0.1', port: 5432 }),
        into: new UnixPortEndpoint({ host: '127.0.0.1', port: 15432 }),
      });

      beforeEach(() => {
        (getUnixPortAliasModule.getOneUnixPortAlias as jest.Mock)
          .mockResolvedValueOnce(foundBefore) // first call: check if exists
          .mockResolvedValueOnce(foundAfter); // second call: sanity check after write
      });

      then('it should overwrite with desired alias', async () => {
        const result = await setUnixPortAlias({ upsert: aliasSample }, context);

        // should return desired (updated) with uri
        expect(result.into.port).toBe(15432);
        expect(result.uri).toContain('declastruct-socat-127-0-0-1-5432');

        // should have called set to overwrite service file
        const { osUnixSystemdSocatSdk } = jest.requireMock(
          '../../access/sdks/osUnixSystemdSocat',
        );
        expect(
          osUnixSystemdSocatSdk.setOsUnixSystemdSocatService,
        ).toHaveBeenCalledWith(
          {
            service: expect.objectContaining({
              uri: expect.stringContaining('declastruct-socat-127-0-0-1-5432'),
              connectPort: 15432,
            }),
          },
          context,
        );
      });
    });
  });

  given('alias already exists with same target', () => {
    const foundBefore = new DeclaredUnixPortAlias({
      uri: '/etc/systemd/system/declastruct-socat-127-0-0-1-5432.service',
      via: 'systemd-socat',
      from: new UnixPortEndpoint({ host: '127.0.0.1', port: 5432 }),
      into: new UnixPortEndpoint({ host: '127.0.0.1', port: 15432 }),
    });

    beforeEach(() => {
      (
        getUnixPortAliasModule.getOneUnixPortAlias as jest.Mock
      ).mockResolvedValue(foundBefore);
    });

    when('upsert is called', () => {
      then(
        'it should return foundBefore alias without modification',
        async () => {
          const result = await setUnixPortAlias(
            { upsert: aliasSample },
            context,
          );

          // should return foundBefore (already correct)
          expect(result.into.port).toBe(15432);

          // should not have written anything
          const { osUnixSystemdSocatSdk } = jest.requireMock(
            '../../access/sdks/osUnixSystemdSocat',
          );
          expect(
            osUnixSystemdSocatSdk.setOsUnixSystemdSocatService,
          ).not.toHaveBeenCalled();
        },
      );
    });
  });

  given('alias does not exist', () => {
    const foundAfter = new DeclaredUnixPortAlias({
      uri: '/etc/systemd/system/declastruct-socat-127-0-0-1-5432.service',
      via: 'systemd-socat',
      from: new UnixPortEndpoint({ host: '127.0.0.1', port: 5432 }),
      into: new UnixPortEndpoint({ host: '127.0.0.1', port: 15432 }),
    });

    beforeEach(() => {
      (getUnixPortAliasModule.getOneUnixPortAlias as jest.Mock)
        .mockResolvedValueOnce(null) // first call: check if exists
        .mockResolvedValueOnce(foundAfter); // second call: sanity check after write
    });

    when('findsert is called', () => {
      then('it should create new service', async () => {
        const { osUnixSystemdSocatSdk } = jest.requireMock(
          '../../access/sdks/osUnixSystemdSocat',
        );

        const result = await setUnixPortAlias(
          { findsert: aliasSample },
          context,
        );

        expect(result.from.port).toBe(5432);
        expect(result.into.port).toBe(15432);
        expect(result.uri).toContain('declastruct-socat-127-0-0-1-5432');

        // verify service was set with context
        expect(
          osUnixSystemdSocatSdk.setOsUnixSystemdSocatService,
        ).toHaveBeenCalledWith(
          {
            service: expect.objectContaining({
              uri: expect.stringContaining('declastruct-socat-127-0-0-1-5432'),
              listenHost: '127.0.0.1',
              listenPort: 5432,
              connectHost: '127.0.0.1',
              connectPort: 15432,
            }),
          },
          context,
        );
      });
    });
  });
});
