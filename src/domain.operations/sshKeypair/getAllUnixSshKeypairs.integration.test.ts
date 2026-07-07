import type { ContextLogTrail } from 'simple-log-methods';
import { given, then, useBeforeAll, useThen, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getAllUnixSshKeypairs } from './getAllUnixSshKeypairs';
import { setUnixSshKeypair } from './setUnixSshKeypair';

describe('getAllUnixSshKeypairs', () => {
  given('a temp keys dir', () => {
    const scene = useBeforeAll(async () => {
      const dir = mkdtempSync(join(tmpdir(), 'declastruct-getall-keypair-'));
      const context: ContextUnixNetwork & ContextLogTrail = {
        log: console,
        ...getSampleUnixNetworkContext({ repo: { sshKeysDir: dir } }),
      };
      return { dir, context };
    });

    when('[t0] before any keypair', () => {
      then('getAll returns empty', async () => {
        expect(await getAllUnixSshKeypairs({}, scene.context)).toEqual([]);
      });
    });

    when('[t1] two keypairs are minted', () => {
      const result = useThen('mint two then getAll', async () => {
        await setUnixSshKeypair(
          {
            findsert: DeclaredUnixSshKeypair.as({
              via: 'ssh-keygen',
              uri: join(scene.dir, 'alpha'),
              algorithm: 'ed25519',
              comment: 'alpha-comment',
            }),
          },
          scene.context,
        );
        await setUnixSshKeypair(
          {
            findsert: DeclaredUnixSshKeypair.as({
              via: 'ssh-keygen',
              uri: join(scene.dir, 'beta'),
              algorithm: 'ed25519',
              comment: 'beta-comment',
            }),
          },
          scene.context,
        );
        return { keypairs: await getAllUnixSshKeypairs({}, scene.context) };
      });

      then('both keypairs are returned', () => {
        expect(
          result.keypairs.map((keypair) => keypair.comment).sort(),
        ).toEqual(['alpha-comment', 'beta-comment']);
      });

      then('the deterministic keypair shapes match snapshot', () => {
        // note: uri and publicKey are non-deterministic (temp path + random
        // key material), so snapshot only the stable identity fields
        expect(
          [...result.keypairs]
            .sort((a, b) => a.comment.localeCompare(b.comment))
            .map((keypair) => ({
              via: keypair.via,
              algorithm: keypair.algorithm,
              comment: keypair.comment,
              publicKeyAlgo: keypair.publicKey?.split(' ')[0],
            })),
        ).toMatchSnapshot();
      });
    });
  });
});
