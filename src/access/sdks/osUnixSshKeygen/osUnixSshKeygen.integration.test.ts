import { given, then, useBeforeAll, useThen, when } from 'test-fns';

import { getSampleUnixNetworkContext } from '@src/.test/assets/getSampleUnixNetworkContext';

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { osUnixSshKeygenSdk } from './index';

describe('osUnixSshKeygen', () => {
  given('a temp keys dir and a target key uri', () => {
    const scene = useBeforeAll(async () => {
      const dir = mkdtempSync(join(tmpdir(), 'declastruct-keygen-'));
      return { dir, uri: join(dir, 'demo') };
    });

    when('[t0] before the key is minted', () => {
      then('get returns null', async () => {
        const found = await osUnixSshKeygenSdk.getOsUnixSshKeypair({
          uri: scene.uri,
        });
        expect(found).toEqual(null);
      });
    });

    when('[t1] the key is minted', () => {
      const minted = useThen('mint then read succeeds', async () => {
        await osUnixSshKeygenSdk.setOsUnixSshKeypair({
          keypair: {
            uri: scene.uri,
            algorithm: 'ed25519',
            comment: 'test-comment',
          },
        });
        return osUnixSshKeygenSdk.getOsUnixSshKeypair({ uri: scene.uri });
      });

      then('the keypair is readable', () => {
        expect(minted).not.toEqual(null);
      });

      then('the algorithm is ed25519', () => {
        expect(minted?.algorithm).toEqual('ed25519');
      });

      then('the comment is preserved', () => {
        expect(minted?.comment).toEqual('test-comment');
      });

      then('the publicKey is an ed25519 line', () => {
        expect(minted?.publicKey).toContain('ssh-ed25519');
      });

      then('the deterministic keypair shape matches snapshot', () => {
        // note: uri and publicKey are non-deterministic (temp path + random
        // key material), so snapshot only the stable identity fields
        expect({
          algorithm: minted?.algorithm,
          comment: minted?.comment,
          publicKeyAlgo: minted?.publicKey?.split(' ')[0],
        }).toMatchSnapshot();
      });

      then('getAll lists the keypair', async () => {
        const context = getSampleUnixNetworkContext({
          repo: { sshKeysDir: scene.dir },
        });
        const all = await osUnixSshKeygenSdk.getOsUnixSshKeypairs({}, context);
        expect(all.map((keypair) => keypair.uri)).toContain(scene.uri);
      });
    });

    when('[t2] the key is deleted', () => {
      const afterDel = useThen('del then read succeeds', async () => {
        await osUnixSshKeygenSdk.delOsUnixSshKeypair({ uri: scene.uri });
        return {
          found: await osUnixSshKeygenSdk.getOsUnixSshKeypair({
            uri: scene.uri,
          }),
        };
      });

      then('get returns null again', () => {
        expect(afterDel.found).toEqual(null);
      });
    });
  });
});
