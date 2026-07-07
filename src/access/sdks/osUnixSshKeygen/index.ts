import { delOsUnixSshKeypair } from './dop.delOsUnixSshKeypair';
import { getOsUnixSshKeypair } from './dop.getOsUnixSshKeypair';
import { getOsUnixSshKeypairs } from './dop.getOsUnixSshKeypairs';
import { setOsUnixSshKeypair } from './dop.setOsUnixSshKeypair';

export type { OsUnixSshKeypair } from './dobj.OsUnixSshKeypair';

/**
 * .what = SDK to mint/read ssh keypairs via ssh-keygen
 * .why = provides structured, idempotent operations over local key files
 */
export const osUnixSshKeygenSdk = {
  getOsUnixSshKeypair,
  getOsUnixSshKeypairs,
  setOsUnixSshKeypair,
  delOsUnixSshKeypair,
};
