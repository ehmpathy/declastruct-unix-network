import execa from 'execa';
import { given, then, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';

import { setOsUnixSystemdSocatService } from './dop.setOsUnixSystemdSocatService';

jest.mock('execa');
const mockExeca = execa as jest.MockedFunction<typeof execa>;

describe('setOsUnixSystemdSocatService', () => {
  beforeEach(() => {
    mockExeca.mockClear();
    mockExeca.mockResolvedValue({} as any);
  });

  const systemContext = getSampleUnixNetworkContext();

  given('system path is used', () => {
    const service = {
      uri: '/etc/systemd/system/my-forward.service',
      listenHost: '127.0.0.1',
      listenPort: 5432,
      connectHost: '127.0.0.1',
      connectPort: 15432,
    };

    when('setting a service', () => {
      then('writes unit file via sudo tee', async () => {
        await setOsUnixSystemdSocatService({ service }, systemContext);

        expect(mockExeca).toHaveBeenCalledWith(
          'sudo',
          ['tee', '/etc/systemd/system/my-forward.service'],
          expect.objectContaining({
            input: expect.stringContaining('TCP-LISTEN:5432'),
          }),
        );
      });

      then('reloads systemd daemon via sudo', async () => {
        await setOsUnixSystemdSocatService({ service }, systemContext);

        expect(mockExeca).toHaveBeenCalledWith('sudo', [
          'systemctl',
          'daemon-reload',
        ]);
      });

      then('enables the service via sudo', async () => {
        await setOsUnixSystemdSocatService({ service }, systemContext);

        expect(mockExeca).toHaveBeenCalledWith('sudo', [
          'systemctl',
          'enable',
          'my-forward.service',
        ]);
      });

      then('restarts the service via sudo', async () => {
        await setOsUnixSystemdSocatService({ service }, systemContext);

        expect(mockExeca).toHaveBeenCalledWith('sudo', [
          'systemctl',
          'restart',
          'my-forward.service',
        ]);
      });

      then('calls execa four times in correct order', async () => {
        await setOsUnixSystemdSocatService({ service }, systemContext);

        expect(mockExeca).toHaveBeenCalledTimes(4);

        // verify order: sudo tee, daemon-reload, enable, restart
        expect(mockExeca.mock.calls[0]![0]).toBe('sudo');
        expect(mockExeca.mock.calls[0]![1]).toEqual([
          'tee',
          '/etc/systemd/system/my-forward.service',
        ]);

        expect(mockExeca.mock.calls[1]![0]).toBe('sudo');
        expect(mockExeca.mock.calls[1]![1]).toEqual([
          'systemctl',
          'daemon-reload',
        ]);

        expect(mockExeca.mock.calls[2]![0]).toBe('sudo');
        expect(mockExeca.mock.calls[2]![1]).toEqual([
          'systemctl',
          'enable',
          'my-forward.service',
        ]);

        expect(mockExeca.mock.calls[3]![0]).toBe('sudo');
        expect(mockExeca.mock.calls[3]![1]).toEqual([
          'systemctl',
          'restart',
          'my-forward.service',
        ]);
      });
    });
  });
});
