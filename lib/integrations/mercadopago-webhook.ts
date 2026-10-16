import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyMercadoPagoSignature(input: {
  dataId: string | null;
  requestId: string | null;
  signature: string | null;
  secret: string;
}): boolean {
  if (!input.signature || !input.requestId) {
    return false;
  }

  const parts = new Map(
    input.signature.split(',').map((part) => {
      const separator = part.indexOf('=');
      return separator < 0
        ? ['', '']
        : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
    }),
  );
  const timestamp = parts.get('ts');
  const receivedSignature = parts.get('v1');
  if (!timestamp || !receivedSignature || !/^[a-f0-9]{64}$/i.test(receivedSignature)) {
    return false;
  }

  const manifest = `${input.dataId ? `id:${input.dataId.toLowerCase()};` : ''}request-id:${input.requestId};ts:${timestamp};`;
  const expectedSignature = createHmac('sha256', input.secret).update(manifest).digest();
  const receivedDigest = Buffer.from(receivedSignature, 'hex');
  return receivedDigest.length === expectedSignature.length &&
    timingSafeEqual(receivedDigest, expectedSignature);
}
