import { createHash, randomInt } from "crypto";
import * as querystring from "querystring";

export interface SignatureOptions {
  secret: string;
  ttl?: number;
  hash?: string;
}

type SignatureData = {
  exp?: number; // exp timestamp
  rndNumber: string; // random number
};

export class Signature {
  private readonly secret: string;
  private readonly ttl: number;
  private readonly hash: (input: string, secret: string) => string;

  constructor(options: SignatureOptions) {
    const { secret, ttl = 0, hash = "sha1" } = options;

    this.secret = secret;
    this.ttl = ttl;
    this.hash = (input: string, secret: string) =>
      createHash(hash).update(input).update(secret).digest("hex");
  }

  public sign(url: string, signTTL?: number): string {
    const data: SignatureData = {
      rndNumber: crypto.randomUUID(),
    };

    const ttl = signTTL ?? this.ttl;
    if (ttl) {
      data.exp = Date.now() + ttl * 1000;
    }

    const prefixSign = url.indexOf("?") == -1 ? "?" : "&";
    url += `${prefixSign}signed=${querystring.stringify(
      data as Record<string, string | number>,
      "-",
      "_"
    )}`;
    url += `-${this.hash(url, this.secret)}`;

    return url;
  }

  private checkStringSignature(str: string, sign: string): void {
    if (this.hash(str, this.secret) !== sign) {
      throw new Error("Invalid");
    }
  }

  private extractSignature(str: string): [url: string, sign: string] {
    const pos = str.lastIndexOf("-");
    if (pos === -1) {
      throw new Error("Invalid");
    }
    return [str.substring(0, pos), str.substring(pos + 1)];
  }

  private extractSignatureData(
    url: string
  ): [url: string, signatureData: SignatureData] {
    let pos = url.lastIndexOf("&signed=");
    if (pos === -1) {
      pos = url.lastIndexOf("?signed=");
    }
    if (pos === -1) {
      throw new Error("Invalid");
    }

    return [
      url.substring(0, pos),
      querystring.parse(url.substring(pos + 8), "-", "_") as any,
    ];
  }

  public verify(url: string): boolean {
    const [urlWithoutSignature, sign] = this.extractSignature(url);
    this.checkStringSignature(urlWithoutSignature, sign);
    const [originalUrl, data] = this.extractSignatureData(
      urlWithoutSignature
    );

    if (data.exp && data.exp < Date.now()) {
      throw new Error("Expired");
    }

    return Boolean(originalUrl);
  }
}

export default function signed(options: SignatureOptions) {
  return new Signature(options);
}
