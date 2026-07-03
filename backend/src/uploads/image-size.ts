/**
 * Dependency-free image dimension reader for the common profile-photo formats
 * (PNG, JPEG, GIF, WebP). Returns null if the format is unrecognized or the
 * header is truncated — callers fall back to provider-reported or client-sent
 * dimensions. Avoids pulling in a native image library (sharp) which is awkward
 * to build on Windows.
 */
export interface Dimensions {
  width: number;
  height: number;
}

export function readImageSize(buffer: Buffer): Dimensions | null {
  return readPng(buffer) ?? readGif(buffer) ?? readWebp(buffer) ?? readJpeg(buffer);
}

function readPng(buf: Buffer): Dimensions | null {
  // \x89PNG\r\n\x1a\n then IHDR; width/height are big-endian u32 at offsets 16/20.
  if (buf.length < 24) return null;
  if (buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function readGif(buf: Buffer): Dimensions | null {
  if (buf.length < 10) return null;
  if (buf.toString('ascii', 0, 3) !== 'GIF') return null;
  // Logical screen descriptor: width/height are little-endian u16 at offsets 6/8.
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

function readWebp(buf: Buffer): Dimensions | null {
  if (buf.length < 30) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    return null;
  }
  const format = buf.toString('ascii', 12, 16);
  if (format === 'VP8 ') {
    // Lossy: 14-bit dimensions at offset 26/28 (after the 0x9d012a start code).
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (format === 'VP8L') {
    const b0 = buf[21];
    const b1 = buf[22];
    const b2 = buf[23];
    const b3 = buf[24];
    const width = 1 + (((b1 & 0x3f) << 8) | b0);
    const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { width, height };
  }
  if (format === 'VP8X') {
    // Extended: 24-bit (value+1) dimensions at offsets 24 and 27.
    const width = 1 + ((buf[24] | (buf[25] << 8) | (buf[26] << 16)) & 0xffffff);
    const height = 1 + ((buf[27] | (buf[28] << 8) | (buf[29] << 16)) & 0xffffff);
    return { width, height };
  }
  return null;
}

function readJpeg(buf: Buffer): Dimensions | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    // SOF0..SOF15 (except DHT 0xc4, JPG 0xc8, DAC 0xcc) carry the frame size.
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    // Skip this segment using its big-endian length.
    const segmentLength = buf.readUInt16BE(offset + 2);
    if (segmentLength < 2) return null;
    offset += 2 + segmentLength;
  }
  return null;
}
