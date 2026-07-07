import type { ContextLogTrail } from 'simple-log-methods';
import { given, then, useBeforeAll, useThen, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';
import type { ContextUnixNetwork } from '@src/domain.objects/ContextUnixNetwork';
import { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { delUnixSshKeypair } from './delUnixSshKeypair';
import { getOneUnixSshKeypair } from './getOneUnixSshKeypair';
import { setUnixSshKeypair } from './setUnixSshKeypair';

describe('setUnixSshKeypair', () => {
  given('a temp keys dir and a target uri', () => {
    const scene = useBeforeAll(async () => {
      const dir = mkdtempSync(join(tmpdir(), 'declastruct-keypair-'));
      const uri = join(dir, 'demo');
      const context: ContextUnixNetwork & ContextLogTrail = {
        log: console,
        ...getSampleUnixNetworkContext({ repo: { sshKeysDir: dir } }),
      };
      return { uri, context };
    });

    when('[t0] the key does not exist yet', () => {
      then('getOne returns null', async () => {
        const found = await getOneUnixSshKeypair(
          { by: { unique: { via: 'ssh-keygen', uri: scene.uri } } },
          scene.context,
        );
        expect(found).toEqual(null);
      });
    });

    when('[t1] findsert mints the key', () => {
      const minted = useThen('findsert succeeds', async () =>
        setUnixSshKeypair(
          {
            findsert: DeclaredUnixSshKeypair.as({
              via: 'ssh-keygen',
              uri: scene.uri,
              algorithm: 'ed25519',
              comment: 'first-comment',
            }),
          },
          scene.context,
        ),
      );

      then('the readonly publicKey is populated', () => {
        expect(minted.publicKey).toContain('ssh-ed25519');
      });

      then('the comment is the first one', () => {
        expect(minted.comment).toEqual('first-comment');
      });

      then('the deterministic keypair shape matches snapshot', () => {
        // note: uri and publicKey are non-deterministic (temp path + random
        // key material), so snapshot only the stable identity fields
        expect({
          via: minted.via,
          algorithm: minted.algorithm,
          comment: minted.comment,
          publicKeyAlgo: minted.publicKey?.split(' ')[0],
        }).toMatchSnapshot();
      });
    });

    when('[t2] findsert again with a different comment', () => {
      const refound = useThen('findsert again succeeds', async () =>
        setUnixSshKeypair(
          {
            findsert: DeclaredUnixSshKeypair.as({
              via: 'ssh-keygen',
              uri: scene.uri,
              algorithm: 'ed25519',
              comment: 'second-comment',
            }),
          },
          scene.context,
        ),
      );

      then('the extant key is returned untouched (never overwritten)', () => {
        expect(refound.comment).toEqual('first-comment');
      });

      then('the reused keypair shape matches snapshot', () => {
        // the findsert-when-present variant: a distinct output (the extant key,
        // not the caller input), so it earns its own snapshot
        expect({
          via: refound.via,
          algorithm: refound.algorithm,
          comment: refound.comment,
          publicKeyAlgo: refound.publicKey?.split(' ')[0],
        }).toMatchSnapshot();
      });
    });

    when('[t3] the key is deleted', () => {
      const after = useThen('del then get succeeds', async () => {
        await delUnixSshKeypair(
          { ref: { via: 'ssh-keygen', uri: scene.uri } },
          scene.context,
        );
        return {
          found: await getOneUnixSshKeypair(
            { by: { unique: { via: 'ssh-keygen', uri: scene.uri } } },
            scene.context,
          ),
        };
      });

      then('getOne returns null again', () => {
        expect(after.found).toEqual(null);
      });
    });
  });
});
