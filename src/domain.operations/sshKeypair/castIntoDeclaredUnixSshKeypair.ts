import type { OsUnixSshKeypair } from '@src/access/sdks/osUnixSshKeygen';
import { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';

/**
 * .what = casts an OsUnixSshKeypair to a DeclaredUnixSshKeypair
 * .why = converts the OS-level representation to the domain object
 *
 * .note = the OS layer always resolves `publicKey`, so it is populated here
 */
export const castIntoDeclaredUnixSshKeypair = (input: {
  keypair: OsUnixSshKeypair;
}): DeclaredUnixSshKeypair => {
  return DeclaredUnixSshKeypair.as({
    via: 'ssh-keygen',
    uri: input.keypair.uri,
    algorithm: input.keypair.algorithm,
    comment: input.keypair.comment,
    publicKey: input.keypair.publicKey,
  });
};
