import { ready } from "libsodium-wrappers";
import Decryption from "./src/decryption";
import Encryption from "./src/encryption";
import { INNCrypto, IStreamable } from "./src/interfaces";
import KeyUtils from "./src/keyutils";
import Password from "./src/password";
import {
  Cipher,
  EncryptionKey,
  OutputFormat,
  Plaintext,
  SerializedKey,
} from "./src/types";

export class NNCrypto implements INNCrypto {
  private isReady: boolean = false;

  private async init() {
    if (this.isReady) return;
    await ready;
    this.isReady = true;
  }

  async encrypt(
    key: SerializedKey,
    plaintext: Plaintext,
    outputFormat: OutputFormat = "uint8array"
  ): Promise<Cipher> {
    await this.init();
    return Encryption.encrypt(key, plaintext, outputFormat);
  }

  async decrypt(
    key: SerializedKey,
    cipherData: Cipher,
    outputFormat: OutputFormat = "text"
  ): Promise<Plaintext> {
    await this.init();
    return Decryption.decrypt(key, cipherData, outputFormat);
  }

  async hash(password: string, salt: string): Promise<string> {
    await this.init();
    return Password.hash(password, salt);
  }

  async deriveKey(password: string, salt: string): Promise<EncryptionKey> {
    await this.init();
    return KeyUtils.deriveKey(password, salt);
  }

  async exportKey(password: string, salt: string): Promise<string> {
    await this.init();
    return KeyUtils.exportKey(password, salt);
  }

  async createEncryptionStream(
    key: SerializedKey,
    stream: IStreamable
  ): Promise<string> {
    await this.init();
    const encryptionStream = Encryption.createStream(key);
    while (true) {
      const chunk = await stream.read();
      if (!chunk) break;

      const { data, final } = chunk;
      await stream.write(encryptionStream.write(data, final));

      if (final) break;
    }
    return encryptionStream.header;
  }

  async createDecryptionStream(
    iv: string,
    key: SerializedKey,
    stream: IStreamable
  ) {
    await this.init();
    const decryptionStream = Decryption.createStream(iv, key);
    while (true) {
      const chunk = await stream.read();
      if (!chunk) break;

      const { data, final } = chunk;
      await stream.write(decryptionStream.read(data));

      if (!final) break;
    }
  }

  async encryptStream(
    key: SerializedKey,
    stream: IStreamable,
    _filename?: string
  ): Promise<string> {
    await this.init();
    return await this.createEncryptionStream(key, stream);
  }
}
