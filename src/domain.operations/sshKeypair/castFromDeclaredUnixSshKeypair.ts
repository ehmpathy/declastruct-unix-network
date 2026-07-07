import type { DeclaredUnixSshKeypair } from '@src/domain.objects/DeclaredUnixSshKeypair';

/**
 * .what = casts a DeclaredUnixSshKeypair to the ssh-keygen mint input
 * .why = converts the domain object to the fields ssh-keygen needs to mint
 *
 * .note = drops `via` (mechanism) and `publicKey` (readonly, known post-mint)
 */
export const castFromDeclaredUnixSshKeypair = (input: {
  keypair: DeclaredUnixSshKeypair;
}): { uri: string; algorithm: 'ed25519' | 'rsa'; comment: string } => {
  return {
    uri: input.keypair.uri,
    algorithm: input.keypair.algorithm,
    comment: input.keypair.comment,
  };
};
