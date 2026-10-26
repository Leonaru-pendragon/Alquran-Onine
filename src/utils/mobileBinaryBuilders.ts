import { escapeHtml } from './security.ts';

// Dedicated self-signed RSA-2048 X.509 app-signing certificate & PKCS#8 key for APK v1 + v2 signing
// Subject: C=ID, O=Al-Quran Digital, OU=Mobile, CN=Al-Quran Digital
const APK_SIGNING_PKCS8_B64 =
  'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpNQDxA/ANi3HRqnXJixCN6tij8k3pUnjh0+IAXGJ4Uo44oAU+2PmZa6+sHcNortqrm4a+hrz3qHvasn4zX71e+ddCk6XdKIqlw57DvlJixvncOVbkY7qlgu4LdgsmdylSupTnq+IXQEmK1YD9skrwakz1iDlXD596oqXSqAXL/mX3oLXshkXP25sUo3rG/nsZEkczOGv7WIrsyDmFVwevHb9tQAWB9NnxEXL3hQc8VCsZaPuIX8WutnuBT+YWM+tCGRVrF3Hvw96QN8KRwKwTJRckRt1m46HmuHj0q4yxsNferFCgCDoIkSfLOZDIVky6MW3T5CYsNQBbCrSAqxivAgMBAAECggEAMA8D43CQ3+f5PenCZqn+27AWNAqAIoLwHoQFrsCOn0ojZuXcV4tc6TxyutoBRFxVc2RLExZF2bma4/TKb2ED8lPX1esFsxjuuEIld8c4syF8mhYXHetNefEEF3FBnX0+2WZxIJPrNVtnB+24I1ZefoZSsXIthxLC4xwLKRfb/aIexT8jJxJ7S/NtgAJVGtwB/4WBpTbgQ7ERWwglhMNyNOecQV5UTP2d85MybYUzxRUtIoLKr0853sxW6IUwxqwbM90mzHo2OwHIaUdZ5D1MOVLpzoXRmo5VWF1DUmcT6xMQzyMbCFAlqTh7JibDCMhr5W5LQIwxle+EubAU4dxEwQKBgQDrkq0DeACtdrlDBkUnmuXyMQofqvY8lQq/oXpM5pdR7zMqZoOyS8ctzKBDwlLdIPzFqjRlgTaM3YQj3asGmgK+SXaPkgOyHhjGMaaa8ssTdjrwpiAbBci/9QUe/Yv/M3PnBU30a5YKUHE+LxplAMzxpj4BEqgElRgt0RbF1u+UcQKBgQC34R24lg6SIDbC18VgDmbAJS9VrX6moY+2Ry9wnBhST10TC9D1j/y52f6fArMfil7uD9euZaVeXN7BTl+fQpT/T7bsXluyGqtn4Aq3SpTgx9YOKFZX3sgXIam6hECALZOPMwo3aNtJsZqOuIJloZXjpextydoY7I8hBmE03A2PHwKBgAXZJ1htsz6bMvA6CJ96FflURFcS7HgGjzTAsoOUOe97y75iuyRDA1fcu6HTAjGhLwVNO23FrnAC09P8HdHVIvpMYpgf3N2gJ6dL9kHkgywhhEcTKLrjAt/ZGl5xlvcn9NmoZQ4LWbc51gXgL3yQb4YURXfLWcZ7WRVSGomg02PRAoGBAKOBDi+LZutyr57zxHMUezNSHVP/EMZUlPiNNdbZRhsyrN15vVYNsbkE6Y81FFfwb1caSTuu8KwGwqB68zYnO1wG4u4tPTYS1uVn579yFw4FRAaUwaoi1CMVcNoELWKMpFBKH0SD/bH6tidAU9rRIvopGSHKwh81glPoW1lobrobAoGAZWovPmlrgJ+s0/CmMLC8942f9mdQJVxirE/gLdGwDldgI62tqGSS8ATXQfFxxpmsw4og4XS30/VG9OOugNXSkxRu2UhPiUyI+ZLQJy+Ae14HLTSGvMcZ21LZupecyISf8zIrQBv1iyFlBsHP45Om22TL48C0foXyMBYiB+uzTl8=';

const APK_SIGNING_CERT_B64 =
  'MIIDizCCAnOgAwIBAgIUS7nizFNLYyqd3Nx7GipRJjO5GWcwDQYJKoZIhvcNAQELBQAwVDELMAkGA1UEBhMCSUQxGTAXBgNVBAoMEEFsLVF1cmFuIERpZ2l0YWwxDzANBgNVBAsMBk1vYmlsZTEZMBcGA1UEAwwQQWwtUXVyYW4gRGlnaXRhbDAgFw0yNjEwMjYxNDQyMjJaGA8yMDU2MTAxODE0NDIyMlowVDELMAkGA1UEBhMCSUQxGTAXBgNVBAoMEEFsLVF1cmFuIERpZ2l0YWwxDzANBgNVBAsMBk1vYmlsZTEZMBcGA1UEAwwQQWwtUXVyYW4gRGlnaXRhbDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKk1APED8A2LcdGqdcmLEI3q2KPyTelSeOHT4gBcYnhSjjigBT7Y+Zlrr6wdw2iu2qubhr6GvPeoe9qyfjNfvV7510KTpd0oiqXDnsO+UmLG+dw5VuRjuqWC7gt2CyZ3KVK6lOer4hdASYrVgP2ySvBqTPWIOVcPn3qipdKoBcv+ZfegteyGRc/bmxSjesb+exkSRzM4a/tYiuzIOYVXB68dv21ABYH02fERcveFBzxUKxlo+4hfxa62e4FP5hYz60IZFWsXce/D3pA3wpHArBMlFyRG3Wbjoea4ePSrjLGw196sUKAIOgiRJ8s5kMhWTLoxbdPkJiw1AFsKtICrGK8CAwEAAaNTMFEwHQYDVR0OBBYEFFWbAcQM9/SLDZl3q5fiQ7/bmhaaMB8GA1UdIwQYMBaAFFWbAcQM9/SLDZl3q5fiQ7/bmhaaMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAEXdV2Vp4+usesbdVWdSGRWweehyqVyUs6Vs5Slg5Hsmyi16YRQnKu/6VTZ3WppQ17r3HQNqQIylFJz4fjXxewVMTpovENcdybQU/tNLmjSpnynumzsZn9wmM+2V6/r+ixm17DxZcYzh40sUcB/P5h6+6sCASOs6YCRUajIgCOuz5AQxSH5jh7KSrCcRmVqbmuSAR9+mZ6DLFRIEwLCQ9+GmlbymNWVNW6aNNdxNBymkwsKfOW/lY1CejZBzBxOl/JcDWOlg05CX75nWOjpgO4XvrgqNeRtB5cov8AIMGdQOJBJj3TBC5Dvwm36VPsxqzznXuiwbL5ABKFY3cWjYO3Q=';

const APK_SIGNING_SERIAL_B64 = 'AhRLueLMU0tjKp3c3HsaKlEmM7kZZw==';
const APK_SIGNING_ISSUER_B64 =
  'MFQxCzAJBgNVBAYTAklEMRkwFwYDVQQKDBBBbC1RdXJhbiBEaWdpdGFsMQ8wDQYDVQQLDAZNb2JpbGUxGTAXBgNVBAMMEEFsLVF1cmFuIERpZ2l0YWw=';

// Minimal valid 1x1 emerald PNG fallback if pwa-192x192.png is not passed
const FALLBACK_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const utf8Encoder = new TextEncoder();

export function decodeBase64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s+/g, '');
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(clean, 'base64'));
  }
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

export function encodeBytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function concatBytes(arrays: readonly Uint8Array[]): Uint8Array {
  let total = 0;
  for (const a of arrays) total += a.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

class BinaryWriter {
  private chunks: Uint8Array[] = [];
  private length = 0;

  get size(): number {
    return this.length;
  }

  writeBytes(data: Uint8Array): void {
    if (data.length === 0) return;
    this.chunks.push(data);
    this.length += data.length;
  }

  writeU8(v: number): void {
    this.writeBytes(new Uint8Array([v & 0xff]));
  }

  writeU16LE(v: number): void {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, v, true);
    this.writeBytes(b);
  }

  writeU32LE(v: number): void {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, v >>> 0, true);
    this.writeBytes(b);
  }

  writeI32LE(v: number): void {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setInt32(0, v | 0, true);
    this.writeBytes(b);
  }

  writeU64LE(low: number, high = 0): void {
    this.writeU32LE(low >>> 0);
    this.writeU32LE(high >>> 0);
  }

  writeULEB128(value: number): void {
    let v = value >>> 0;
    const out: number[] = [];
    do {
      let byte = v & 0x7f;
      v >>>= 7;
      if (v !== 0) byte |= 0x80;
      out.push(byte);
    } while (v !== 0);
    this.writeBytes(new Uint8Array(out));
  }

  align4(): void {
    const rem = this.length % 4;
    if (rem !== 0) {
      this.writeBytes(new Uint8Array(4 - rem));
    }
  }

  toUint8Array(): Uint8Array {
    return concatBytes(this.chunks);
  }
}

// ============================================================================
// CRC-32 & Adler-32
// ============================================================================

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function computeCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function computeAdler32(data: Uint8Array): number {
  const MOD_ADLER = 65521;
  let a = 1;
  let b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return ((b << 16) | a) >>> 0;
}

function toBufferSource(data: Uint8Array): Uint8Array<ArrayBuffer> {
  return data as Uint8Array<ArrayBuffer>;
}

async function sha1Bytes(data: Uint8Array): Promise<Uint8Array> {
  const digest = await globalThis.crypto.subtle.digest('SHA-1', toBufferSource(data));
  return new Uint8Array(digest);
}

async function sha256Bytes(data: Uint8Array): Promise<Uint8Array> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', toBufferSource(data));
  return new Uint8Array(digest);
}

// ============================================================================
// ZIP Archive Builder (with 4-byte zipalign support & APK Sig Block v2 slot)
// ============================================================================

export interface ZipEntryInput {
  name: string;
  data: Uint8Array;
  align4?: boolean;
  unixMode?: number;
}

export interface BuiltZipLayout {
  bytes: Uint8Array;
  centralDirOffset: number;
  eocdOffset: number;
}

export function buildZipArchive(
  entries: readonly ZipEntryInput[],
  apkSigningBlock?: Uint8Array
): BuiltZipLayout {
  const localSection = new BinaryWriter();
  const centralDir = new BinaryWriter();

  // Fixed DOS timestamp: 2026-01-01 00:00:00 for deterministic reproducible builds
  const dosTime = 0x0000;
  const dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;

  for (const entry of entries) {
    const nameBytes = utf8Encoder.encode(entry.name);
    const crc = computeCrc32(entry.data);
    const localHeaderOffset = localSection.size;

    let extraBytes = new Uint8Array(0);
    if (entry.align4) {
      const unpaddedDataStart = localHeaderOffset + 30 + nameBytes.length;
      const remainder = unpaddedDataStart % 4;
      if (remainder !== 0) {
        const padLen = (4 - remainder) % 4;
        // Official Android zipalign TLV (0xd935): 2B magic + 2B length + padLen zero bytes => (4 + padLen) === padLen (mod 4)
        extraBytes = new Uint8Array(4 + padLen);
        const ev = new DataView(extraBytes.buffer);
        ev.setUint16(0, 0xd935, true);
        ev.setUint16(2, padLen, true);
      }
    }

    // Local File Header (0x04034b50)
    localSection.writeU32LE(0x04034b50);
    localSection.writeU16LE(20); // version needed to extract (2.0)
    localSection.writeU16LE(0x0800); // UTF-8 filename flag
    localSection.writeU16LE(0); // compression method: 0 = STORED
    localSection.writeU16LE(dosTime);
    localSection.writeU16LE(dosDate);
    localSection.writeU32LE(crc);
    localSection.writeU32LE(entry.data.length);
    localSection.writeU32LE(entry.data.length);
    localSection.writeU16LE(nameBytes.length);
    localSection.writeU16LE(extraBytes.length);
    localSection.writeBytes(nameBytes);
    localSection.writeBytes(extraBytes);
    localSection.writeBytes(entry.data);

    // Central Directory File Header (0x02014b50)
    const unixMode = entry.unixMode ?? 0o100644;
    const externalAttrs = (unixMode << 16) >>> 0;
    const versionMadeBy = entry.unixMode ? 0x0314 : 20; // Unix (3) if unixMode specified

    centralDir.writeU32LE(0x02014b50);
    centralDir.writeU16LE(versionMadeBy);
    centralDir.writeU16LE(20);
    centralDir.writeU16LE(0x0800);
    centralDir.writeU16LE(0);
    centralDir.writeU16LE(dosTime);
    centralDir.writeU16LE(dosDate);
    centralDir.writeU32LE(crc);
    centralDir.writeU32LE(entry.data.length);
    centralDir.writeU32LE(entry.data.length);
    centralDir.writeU16LE(nameBytes.length);
    centralDir.writeU16LE(0); // central dir extra len
    centralDir.writeU16LE(0); // file comment len
    centralDir.writeU16LE(0); // disk number start
    centralDir.writeU16LE(0); // internal file attrs
    centralDir.writeU32LE(externalAttrs);
    centralDir.writeU32LE(localHeaderOffset);
    centralDir.writeBytes(nameBytes);
  }

  const localBytes = localSection.toUint8Array();
  const sigBlockBytes = apkSigningBlock ?? new Uint8Array(0);
  const centralBytes = centralDir.toUint8Array();

  const centralDirOffset = localBytes.length + sigBlockBytes.length;

  const eocd = new BinaryWriter();
  eocd.writeU32LE(0x06054b50);
  eocd.writeU16LE(0);
  eocd.writeU16LE(0);
  eocd.writeU16LE(entries.length);
  eocd.writeU16LE(entries.length);
  eocd.writeU32LE(centralBytes.length);
  eocd.writeU32LE(centralDirOffset);
  eocd.writeU16LE(0);
  const eocdBytes = eocd.toUint8Array();

  const eocdOffset = centralDirOffset + centralBytes.length;
  return {
    bytes: concatBytes([localBytes, sigBlockBytes, centralBytes, eocdBytes]),
    centralDirOffset,
    eocdOffset
  };
}

// ============================================================================
// Android Binary XML (AXML) Builder for AndroidManifest.xml
// ============================================================================

function encodeUtf16StringPoolEntry(str: string): Uint8Array {
  const w = new BinaryWriter();
  w.writeU16LE(str.length);
  for (let i = 0; i < str.length; i++) {
    w.writeU16LE(str.charCodeAt(i));
  }
  w.writeU16LE(0); // UTF-16 null terminator
  return w.toUint8Array();
}

function buildResStringPool(strings: readonly string[]): Uint8Array {
  const encodedEntries = strings.map(encodeUtf16StringPoolEntry);
  const offsets: number[] = [];
  let running = 0;
  for (const e of encodedEntries) {
    offsets.push(running);
    running += e.length;
  }

  const stringsStart = 28 + strings.length * 4;
  const body = new BinaryWriter();
  for (const off of offsets) body.writeU32LE(off);
  for (const e of encodedEntries) body.writeBytes(e);
  body.align4();
  const bodyBytes = body.toUint8Array();

  const chunk = new BinaryWriter();
  chunk.writeU16LE(0x0001); // RES_STRING_POOL_TYPE
  chunk.writeU16LE(28); // header size
  chunk.writeU32LE(28 + bodyBytes.length);
  chunk.writeU32LE(strings.length);
  chunk.writeU32LE(0); // styleCount
  chunk.writeU32LE(0); // flags: 0 = UTF-16
  chunk.writeU32LE(stringsStart);
  chunk.writeU32LE(0); // stylesStart
  chunk.writeBytes(bodyBytes);
  return chunk.toUint8Array();
}

interface AxmlAttr {
  nsIdx: number; // -1 for no namespace
  nameIdx: number;
  rawValueIdx: number; // -1 unless string
  dataType: number; // 0x03=string, 0x10=int_dec, 0x11=int_hex, 0x12=int_bool, 0x01=reference
  data: number;
}

function buildAxmlStartElement(
  lineNo: number,
  nsIdx: number,
  nameIdx: number,
  attrs: readonly AxmlAttr[]
): Uint8Array {
  const w = new BinaryWriter();
  const totalSize = 36 + attrs.length * 20;
  w.writeU16LE(0x0102); // RES_XML_START_ELEMENT_TYPE
  w.writeU16LE(16);
  w.writeU32LE(totalSize);
  w.writeU32LE(lineNo);
  w.writeI32LE(-1); // comment

  w.writeI32LE(nsIdx);
  w.writeU32LE(nameIdx);
  w.writeU16LE(20); // attributeStart
  w.writeU16LE(20); // attributeSize
  w.writeU16LE(attrs.length);
  w.writeU16LE(0); // idIndex
  w.writeU16LE(0); // classIndex
  w.writeU16LE(0); // styleIndex

  for (const a of attrs) {
    w.writeI32LE(a.nsIdx);
    w.writeU32LE(a.nameIdx);
    w.writeI32LE(a.rawValueIdx);
    w.writeU16LE(8); // Res_value.size
    w.writeU8(0); // res0
    w.writeU8(a.dataType);
    w.writeU32LE(a.data >>> 0);
  }
  return w.toUint8Array();
}

function buildAxmlEndElement(lineNo: number, nsIdx: number, nameIdx: number): Uint8Array {
  const w = new BinaryWriter();
  w.writeU16LE(0x0103); // RES_XML_END_ELEMENT_TYPE
  w.writeU16LE(16);
  w.writeU32LE(24);
  w.writeU32LE(lineNo);
  w.writeI32LE(-1);
  w.writeI32LE(nsIdx);
  w.writeU32LE(nameIdx);
  return w.toUint8Array();
}

export function buildAndroidBinaryManifestXml(options: {
  packageName: string;
  appLabel: string;
  versionName?: string;
  versionCode?: number;
}): Uint8Array {
  const versionName = options.versionName || '1.0.0';
  const versionCode = options.versionCode || 1;

  // Attribute names placed at indices 0..11 in strictly ascending Android framework resource ID order!
  const attrSpecs: Array<[string, number]> = [
    ['theme', 0x01010000],
    ['label', 0x01010001],
    ['icon', 0x01010002],
    ['name', 0x01010003],
    ['exported', 0x01010010],
    ['configChanges', 0x0101001f],
    ['minSdkVersion', 0x0101020c],
    ['versionCode', 0x0101021b],
    ['versionName', 0x0101021c],
    ['targetSdkVersion', 0x01010270],
    ['hardwareAccelerated', 0x010102d3],
    ['usesCleartextTraffic', 0x010104ec]
  ];

  const strings: string[] = attrSpecs.map(([n]) => n);
  const idxOf = (s: string): number => {
    const existing = strings.indexOf(s);
    if (existing !== -1) return existing;
    strings.push(s);
    return strings.length - 1;
  };

  const iTheme = 0;
  const iLabel = 1;
  const iIcon = 2;
  const iName = 3;
  const iExported = 4;
  const iConfigChanges = 5;
  const iMinSdk = 6;
  const iVersionCode = 7;
  const iVersionName = 8;
  const iTargetSdk = 9;
  const iHwAccel = 10;
  const iCleartext = 11;

  const iNsPrefix = idxOf('android');
  const iNsUri = idxOf('http://schemas.android.com/apk/res/android');
  const iManifest = idxOf('manifest');
  const iPackageAttr = idxOf('package');
  const iPackageVal = idxOf(options.packageName);
  const iVersionNameVal = idxOf(versionName);
  const iUsesSdk = idxOf('uses-sdk');
  const iUsesPermission = idxOf('uses-permission');
  const iPermInternet = idxOf('android.permission.INTERNET');
  const iPermNetState = idxOf('android.permission.ACCESS_NETWORK_STATE');
  const iPermWakeLock = idxOf('android.permission.WAKE_LOCK');
  const iApplication = idxOf('application');
  const iAppLabelVal = idxOf(options.appLabel);
  const iActivity = idxOf('activity');
  const iMainActivityName = idxOf('id.alqurandigital.app.MainActivity');
  const iIntentFilter = idxOf('intent-filter');
  const iAction = idxOf('action');
  const iActionMain = idxOf('android.intent.action.MAIN');
  const iCategory = idxOf('category');
  const iCatLauncher = idxOf('android.intent.category.LAUNCHER');

  const stringPoolChunk = buildResStringPool(strings);

  // Resource ID Map chunk (0x0180)
  const resMap = new BinaryWriter();
  resMap.writeU16LE(0x0180);
  resMap.writeU16LE(8);
  resMap.writeU32LE(8 + attrSpecs.length * 4);
  for (const [, resId] of attrSpecs) {
    resMap.writeU32LE(resId);
  }
  const resMapChunk = resMap.toUint8Array();

  // Start Namespace chunk (0x0100)
  const startNs = new BinaryWriter();
  startNs.writeU16LE(0x0100);
  startNs.writeU16LE(16);
  startNs.writeU32LE(24);
  startNs.writeU32LE(1);
  startNs.writeI32LE(-1);
  startNs.writeU32LE(iNsPrefix);
  startNs.writeU32LE(iNsUri);

  // End Namespace chunk (0x0101)
  const endNs = new BinaryWriter();
  endNs.writeU16LE(0x0101);
  endNs.writeU16LE(16);
  endNs.writeU32LE(24);
  endNs.writeU32LE(30);
  endNs.writeI32LE(-1);
  endNs.writeU32LE(iNsPrefix);
  endNs.writeU32LE(iNsUri);

  const TYPE_REFERENCE = 0x01;
  const TYPE_STRING = 0x03;
  const TYPE_INT_DEC = 0x10;
  const TYPE_INT_HEX = 0x11;
  const TYPE_INT_BOOL = 0x12;

  const xmlBody = concatBytes([
    startNs.toUint8Array(),

    // <manifest android:versionCode="1" android:versionName="1.0.0" package="...">
    buildAxmlStartElement(2, -1, iManifest, [
      { nsIdx: iNsUri, nameIdx: iVersionCode, rawValueIdx: -1, dataType: TYPE_INT_DEC, data: versionCode },
      { nsIdx: iNsUri, nameIdx: iVersionName, rawValueIdx: iVersionNameVal, dataType: TYPE_STRING, data: iVersionNameVal },
      { nsIdx: -1, nameIdx: iPackageAttr, rawValueIdx: iPackageVal, dataType: TYPE_STRING, data: iPackageVal }
    ]),

    // <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />
    buildAxmlStartElement(4, -1, iUsesSdk, [
      { nsIdx: iNsUri, nameIdx: iMinSdk, rawValueIdx: -1, dataType: TYPE_INT_DEC, data: 21 },
      { nsIdx: iNsUri, nameIdx: iTargetSdk, rawValueIdx: -1, dataType: TYPE_INT_DEC, data: 33 }
    ]),
    buildAxmlEndElement(4, -1, iUsesSdk),

    // <uses-permission android:name="android.permission.INTERNET" />
    buildAxmlStartElement(6, -1, iUsesPermission, [
      { nsIdx: iNsUri, nameIdx: iName, rawValueIdx: iPermInternet, dataType: TYPE_STRING, data: iPermInternet }
    ]),
    buildAxmlEndElement(6, -1, iUsesPermission),

    // <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    buildAxmlStartElement(7, -1, iUsesPermission, [
      { nsIdx: iNsUri, nameIdx: iName, rawValueIdx: iPermNetState, dataType: TYPE_STRING, data: iPermNetState }
    ]),
    buildAxmlEndElement(7, -1, iUsesPermission),

    // <uses-permission android:name="android.permission.WAKE_LOCK" />
    buildAxmlStartElement(8, -1, iUsesPermission, [
      { nsIdx: iNsUri, nameIdx: iName, rawValueIdx: iPermWakeLock, dataType: TYPE_STRING, data: iPermWakeLock }
    ]),
    buildAxmlEndElement(8, -1, iUsesPermission),

    // <application android:theme="@android:style/Theme.NoTitleBar" android:label="..." android:icon="@0x7f010000" android:hardwareAccelerated="true" android:usesCleartextTraffic="true">
    buildAxmlStartElement(10, -1, iApplication, [
      { nsIdx: iNsUri, nameIdx: iTheme, rawValueIdx: -1, dataType: TYPE_REFERENCE, data: 0x01030006 },
      { nsIdx: iNsUri, nameIdx: iLabel, rawValueIdx: iAppLabelVal, dataType: TYPE_STRING, data: iAppLabelVal },
      { nsIdx: iNsUri, nameIdx: iIcon, rawValueIdx: -1, dataType: TYPE_REFERENCE, data: 0x7f010000 },
      { nsIdx: iNsUri, nameIdx: iHwAccel, rawValueIdx: -1, dataType: TYPE_INT_BOOL, data: 0xffffffff },
      { nsIdx: iNsUri, nameIdx: iCleartext, rawValueIdx: -1, dataType: TYPE_INT_BOOL, data: 0xffffffff }
    ]),

    // <activity android:label="..." android:name="id.alqurandigital.app.MainActivity" android:exported="true" android:configChanges="0x0da0">
    buildAxmlStartElement(14, -1, iActivity, [
      { nsIdx: iNsUri, nameIdx: iLabel, rawValueIdx: iAppLabelVal, dataType: TYPE_STRING, data: iAppLabelVal },
      { nsIdx: iNsUri, nameIdx: iName, rawValueIdx: iMainActivityName, dataType: TYPE_STRING, data: iMainActivityName },
      { nsIdx: iNsUri, nameIdx: iExported, rawValueIdx: -1, dataType: TYPE_INT_BOOL, data: 0xffffffff },
      { nsIdx: iNsUri, nameIdx: iConfigChanges, rawValueIdx: -1, dataType: TYPE_INT_HEX, data: 0x0da0 }
    ]),

    // <intent-filter>
    buildAxmlStartElement(16, -1, iIntentFilter, []),
    buildAxmlStartElement(17, -1, iAction, [
      { nsIdx: iNsUri, nameIdx: iName, rawValueIdx: iActionMain, dataType: TYPE_STRING, data: iActionMain }
    ]),
    buildAxmlEndElement(17, -1, iAction),
    buildAxmlStartElement(18, -1, iCategory, [
      { nsIdx: iNsUri, nameIdx: iName, rawValueIdx: iCatLauncher, dataType: TYPE_STRING, data: iCatLauncher }
    ]),
    buildAxmlEndElement(18, -1, iCategory),
    buildAxmlEndElement(19, -1, iIntentFilter),

    buildAxmlEndElement(20, -1, iActivity),
    buildAxmlEndElement(22, -1, iApplication),
    buildAxmlEndElement(24, -1, iManifest),
    endNs.toUint8Array()
  ]);

  const totalLen = 8 + stringPoolChunk.length + resMapChunk.length + xmlBody.length;
  const doc = new BinaryWriter();
  doc.writeU16LE(0x0003); // RES_XML_TYPE
  doc.writeU16LE(8);
  doc.writeU32LE(totalLen);
  doc.writeBytes(stringPoolChunk);
  doc.writeBytes(resMapChunk);
  doc.writeBytes(xmlBody);
  return doc.toUint8Array();
}

// ============================================================================
// Android resources.arsc Builder (@0x7f010000 -> res/drawable/icon.png)
// ============================================================================

export function buildAndroidResourcesArsc(packageName: string): Uint8Array {
  const globalPool = buildResStringPool(['res/drawable/icon.png']);
  const typeStringsPool = buildResStringPool(['drawable']);
  const keyStringsPool = buildResStringPool(['icon']);

  // RES_TABLE_TYPE_SPEC_TYPE (0x0202)
  const typeSpec = new BinaryWriter();
  typeSpec.writeU16LE(0x0202);
  typeSpec.writeU16LE(16);
  typeSpec.writeU32LE(20);
  typeSpec.writeU8(1); // type id = 1 (drawable)
  typeSpec.writeU8(0);
  typeSpec.writeU16LE(0);
  typeSpec.writeU32LE(1); // entryCount = 1
  typeSpec.writeU32LE(0); // config flags for entry 0
  const typeSpecBytes = typeSpec.toUint8Array();

  // RES_TABLE_TYPE_TYPE (0x0201)
  // Header size = 20 + 48 (ResTable_config) = 68 bytes
  const typeHeaderSize = 68;
  const entriesStart = typeHeaderSize + 4; // 1 uint32 entry offset
  const entryAndValueSize = 16; // ResTable_entry (8) + Res_value (8)
  const typeChunkTotal = entriesStart + entryAndValueSize;

  const typeChunk = new BinaryWriter();
  typeChunk.writeU16LE(0x0201);
  typeChunk.writeU16LE(typeHeaderSize);
  typeChunk.writeU32LE(typeChunkTotal);
  typeChunk.writeU8(1); // id = 1
  typeChunk.writeU8(0); // flags
  typeChunk.writeU16LE(0); // reserved
  typeChunk.writeU32LE(1); // entryCount = 1
  typeChunk.writeU32LE(entriesStart);
  // ResTable_config (48 bytes)
  typeChunk.writeU32LE(48);
  typeChunk.writeBytes(new Uint8Array(44));
  // entryOffsets[0] = 0
  typeChunk.writeU32LE(0);
  // ResTable_entry (8 bytes)
  typeChunk.writeU16LE(8); // size
  typeChunk.writeU16LE(0); // flags
  typeChunk.writeU32LE(0); // key index 0 -> "icon"
  // Res_value (8 bytes)
  typeChunk.writeU16LE(8); // size
  typeChunk.writeU8(0); // res0
  typeChunk.writeU8(0x03); // TYPE_STRING
  typeChunk.writeU32LE(0); // global string pool index 0 -> "res/drawable/icon.png"
  const typeChunkBytes = typeChunk.toUint8Array();

  // RES_TABLE_PACKAGE_TYPE (0x0200), headerSize = 288 bytes
  const pkgHeaderSize = 288;
  const typeStringsOffset = pkgHeaderSize;
  const keyStringsOffset = typeStringsOffset + typeStringsPool.length;
  const pkgTotalSize =
    pkgHeaderSize +
    typeStringsPool.length +
    keyStringsPool.length +
    typeSpecBytes.length +
    typeChunkBytes.length;

  const pkg = new BinaryWriter();
  pkg.writeU16LE(0x0200);
  pkg.writeU16LE(pkgHeaderSize);
  pkg.writeU32LE(pkgTotalSize);
  pkg.writeU32LE(0x7f); // app package ID = 0x7f
  // uint16_t name[128] (256 bytes UTF-16LE)
  for (let i = 0; i < 128; i++) {
    pkg.writeU16LE(i < packageName.length ? packageName.charCodeAt(i) : 0);
  }
  pkg.writeU32LE(typeStringsOffset);
  pkg.writeU32LE(1); // lastPublicType
  pkg.writeU32LE(keyStringsOffset);
  pkg.writeU32LE(1); // lastPublicKey
  pkg.writeU32LE(0); // typeIdOffset
  pkg.writeBytes(typeStringsPool);
  pkg.writeBytes(keyStringsPool);
  pkg.writeBytes(typeSpecBytes);
  pkg.writeBytes(typeChunkBytes);
  const pkgBytes = pkg.toUint8Array();

  // Top-level RES_TABLE_TYPE (0x0002), headerSize = 12 bytes
  const tableTotal = 12 + globalPool.length + pkgBytes.length;
  const table = new BinaryWriter();
  table.writeU16LE(0x0002);
  table.writeU16LE(12);
  table.writeU32LE(tableTotal);
  table.writeU32LE(1); // packageCount = 1
  table.writeBytes(globalPool);
  table.writeBytes(pkgBytes);
  return table.toUint8Array();
}

// ============================================================================
// Dalvik Executable (classes.dex) Builder for id.alqurandigital.app.MainActivity
// ============================================================================

export async function buildAndroidClassesDex(): Promise<Uint8Array> {
  // Collect all required strings and sort lexicographically by UTF-16 code units
  const rawStrings = [
    '<init>',
    'L',
    'Landroid/app/Activity;',
    'Landroid/content/Context;',
    'Landroid/os/Bundle;',
    'Landroid/view/View;',
    'Landroid/webkit/WebChromeClient;',
    'Landroid/webkit/WebSettings;',
    'Landroid/webkit/WebView;',
    'Landroid/webkit/WebViewClient;',
    'Lid/alqurandigital/app/MainActivity;',
    'Ljava/lang/Object;',
    'Ljava/lang/String;',
    'MainActivity.java',
    'V',
    'VL',
    'VZ',
    'Z',
    'canGoBack',
    'file:///android_asset/index.html',
    'getSettings',
    'goBack',
    'loadUrl',
    'onBackPressed',
    'onCreate',
    'setContentView',
    'setDomStorageEnabled',
    'setJavaScriptEnabled',
    'setMediaPlaybackRequiresUserGesture',
    'setWebChromeClient',
    'setWebViewClient',
    'webView'
  ].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const strIdx = (s: string): number => {
    const idx = rawStrings.indexOf(s);
    if (idx === -1) throw new Error(`Missing DEX string: ${s}`);
    return idx;
  };

  // Type descriptors sorted by string index
  const typeDescriptors = [
    'Landroid/app/Activity;',
    'Landroid/content/Context;',
    'Landroid/os/Bundle;',
    'Landroid/view/View;',
    'Landroid/webkit/WebChromeClient;',
    'Landroid/webkit/WebSettings;',
    'Landroid/webkit/WebView;',
    'Landroid/webkit/WebViewClient;',
    'Lid/alqurandigital/app/MainActivity;',
    'Ljava/lang/Object;',
    'Ljava/lang/String;',
    'V',
    'Z'
  ].sort((a, b) => strIdx(a) - strIdx(b));

  const typeIdx = (t: string): number => {
    const idx = typeDescriptors.indexOf(t);
    if (idx === -1) throw new Error(`Missing DEX type: ${t}`);
    return idx;
  };

  interface ProtoDef {
    key: string;
    shorty: string;
    returnType: string;
    params: string[];
  }

  const protos: ProtoDef[] = [
    { key: '()Landroid/webkit/WebSettings;', shorty: 'L', returnType: 'Landroid/webkit/WebSettings;', params: [] },
    { key: '()V', shorty: 'V', returnType: 'V', params: [] },
    { key: '(Landroid/content/Context;)V', shorty: 'VL', returnType: 'V', params: ['Landroid/content/Context;'] },
    { key: '(Landroid/os/Bundle;)V', shorty: 'VL', returnType: 'V', params: ['Landroid/os/Bundle;'] },
    { key: '(Landroid/view/View;)V', shorty: 'VL', returnType: 'V', params: ['Landroid/view/View;'] },
    { key: '(Landroid/webkit/WebChromeClient;)V', shorty: 'VL', returnType: 'V', params: ['Landroid/webkit/WebChromeClient;'] },
    { key: '(Landroid/webkit/WebViewClient;)V', shorty: 'VL', returnType: 'V', params: ['Landroid/webkit/WebViewClient;'] },
    { key: '(Ljava/lang/String;)V', shorty: 'VL', returnType: 'V', params: ['Ljava/lang/String;'] },
    { key: '(Z)V', shorty: 'VZ', returnType: 'V', params: ['Z'] },
    { key: '()Z', shorty: 'Z', returnType: 'Z', params: [] }
  ].sort((a, b) => {
    const rDiff = typeIdx(a.returnType) - typeIdx(b.returnType);
    if (rDiff !== 0) return rDiff;
    const minLen = Math.min(a.params.length, b.params.length);
    for (let i = 0; i < minLen; i++) {
      const pDiff = typeIdx(a.params[i]) - typeIdx(b.params[i]);
      if (pDiff !== 0) return pDiff;
    }
    return a.params.length - b.params.length;
  });

  const protoIdx = (key: string): number => {
    const idx = protos.findIndex((p) => p.key === key);
    if (idx === -1) throw new Error(`Missing DEX proto: ${key}`);
    return idx;
  };

  // Single instance field: MainActivity.webView: Landroid/webkit/WebView;
  const fields = [
    {
      classDesc: 'Lid/alqurandigital/app/MainActivity;',
      typeDesc: 'Landroid/webkit/WebView;',
      name: 'webView'
    }
  ];

  interface MethodDef {
    key: string;
    classDesc: string;
    protoKey: string;
    name: string;
  }

  const methods: MethodDef[] = [
    { key: 'Activity.<init>', classDesc: 'Landroid/app/Activity;', protoKey: '()V', name: '<init>' },
    { key: 'Activity.onBackPressed', classDesc: 'Landroid/app/Activity;', protoKey: '()V', name: 'onBackPressed' },
    { key: 'Activity.onCreate', classDesc: 'Landroid/app/Activity;', protoKey: '(Landroid/os/Bundle;)V', name: 'onCreate' },
    { key: 'Activity.setContentView', classDesc: 'Landroid/app/Activity;', protoKey: '(Landroid/view/View;)V', name: 'setContentView' },
    { key: 'WebChromeClient.<init>', classDesc: 'Landroid/webkit/WebChromeClient;', protoKey: '()V', name: '<init>' },
    { key: 'WebSettings.setDomStorageEnabled', classDesc: 'Landroid/webkit/WebSettings;', protoKey: '(Z)V', name: 'setDomStorageEnabled' },
    { key: 'WebSettings.setJavaScriptEnabled', classDesc: 'Landroid/webkit/WebSettings;', protoKey: '(Z)V', name: 'setJavaScriptEnabled' },
    { key: 'WebSettings.setMediaPlaybackRequiresUserGesture', classDesc: 'Landroid/webkit/WebSettings;', protoKey: '(Z)V', name: 'setMediaPlaybackRequiresUserGesture' },
    { key: 'WebView.<init>', classDesc: 'Landroid/webkit/WebView;', protoKey: '(Landroid/content/Context;)V', name: '<init>' },
    { key: 'WebView.canGoBack', classDesc: 'Landroid/webkit/WebView;', protoKey: '()Z', name: 'canGoBack' },
    { key: 'WebView.getSettings', classDesc: 'Landroid/webkit/WebView;', protoKey: '()Landroid/webkit/WebSettings;', name: 'getSettings' },
    { key: 'WebView.goBack', classDesc: 'Landroid/webkit/WebView;', protoKey: '()V', name: 'goBack' },
    { key: 'WebView.loadUrl', classDesc: 'Landroid/webkit/WebView;', protoKey: '(Ljava/lang/String;)V', name: 'loadUrl' },
    { key: 'WebView.setWebChromeClient', classDesc: 'Landroid/webkit/WebView;', protoKey: '(Landroid/webkit/WebChromeClient;)V', name: 'setWebChromeClient' },
    { key: 'WebView.setWebViewClient', classDesc: 'Landroid/webkit/WebView;', protoKey: '(Landroid/webkit/WebViewClient;)V', name: 'setWebViewClient' },
    { key: 'WebViewClient.<init>', classDesc: 'Landroid/webkit/WebViewClient;', protoKey: '()V', name: '<init>' },
    { key: 'MainActivity.<init>', classDesc: 'Lid/alqurandigital/app/MainActivity;', protoKey: '()V', name: '<init>' },
    { key: 'MainActivity.onBackPressed', classDesc: 'Lid/alqurandigital/app/MainActivity;', protoKey: '()V', name: 'onBackPressed' },
    { key: 'MainActivity.onCreate', classDesc: 'Lid/alqurandigital/app/MainActivity;', protoKey: '(Landroid/os/Bundle;)V', name: 'onCreate' }
  ].sort((a, b) => {
    const cDiff = typeIdx(a.classDesc) - typeIdx(b.classDesc);
    if (cDiff !== 0) return cDiff;
    const nDiff = strIdx(a.name) - strIdx(b.name);
    if (nDiff !== 0) return nDiff;
    return protoIdx(a.protoKey) - protoIdx(b.protoKey);
  });

  const methodIdx = (key: string): number => {
    const idx = methods.findIndex((m) => m.key === key);
    if (idx === -1) throw new Error(`Missing DEX method: ${key}`);
    return idx;
  };

  // Encode Dalvik 16-bit code units helper
  const buildCodeItem = (
    registersSize: number,
    insSize: number,
    outsSize: number,
    insns16: readonly number[]
  ): Uint8Array => {
    const w = new BinaryWriter();
    w.writeU16LE(registersSize);
    w.writeU16LE(insSize);
    w.writeU16LE(outsSize);
    w.writeU16LE(0); // tries_size
    w.writeU32LE(0); // debug_info_off
    w.writeU32LE(insns16.length);
    for (const u of insns16) w.writeU16LE(u);
    return w.toUint8Array();
  };

  // 1) public MainActivity.<init>()V
  // invoke-direct {v0}, Activity.<init>()V ; return-void
  const codeInit = buildCodeItem(1, 1, 1, [
    0x1070,
    methodIdx('Activity.<init>'),
    0x0000,
    0x000e
  ]);

  // 2) public MainActivity.onBackPressed()V (registers=2, ins=1 -> v1 = this)
  // 00: iget-object v0, v1, field@0        (2 units)
  // 02: if-eqz v0, +12 (-> 14)             (2 units)
  // 04: invoke-virtual {v0}, canGoBack()Z  (3 units)
  // 07: move-result v0                     (1 unit)
  // 08: if-eqz v0, +6  (-> 14)             (2 units)
  // 10: iget-object v0, v1, field@0        (2 units)
  // 12: invoke-virtual {v0}, goBack()V     (3 units)  <-- wait: 10+2=12, 12+3=15, return-void at 15 => super is at 16!
  // Let's verify exact 16-bit unit offsets:
  //   0: 54 10 0000               (2 units -> next 2)
  //   2: 38 00 000e               (2 units -> branch target 2 + 14 = 16!)
  //   4: 6e 10 <canGoBack> 0000   (3 units -> next 7)
  //   7: 0a 00                    (1 unit  -> next 8)
  //   8: 38 00 0008               (2 units -> branch target 8 + 8 = 16!)
  //  10: 54 10 0000               (2 units -> next 12)
  //  12: 6e 10 <goBack> 0000      (3 units -> next 15)
  //  15: 0e 00                    (1 unit  -> next 16)
  //  16: 6f 10 <super.onBack> 0001(3 units -> next 19)
  //  19: 0e 00                    (1 unit  -> total 20 units)
  const codeOnBackPressed = buildCodeItem(2, 1, 1, [
    0x1054,
    0x0000,
    0x0038,
    0x000e,
    0x106e,
    methodIdx('WebView.canGoBack'),
    0x0000,
    0x000a,
    0x0038,
    0x0008,
    0x1054,
    0x0000,
    0x106e,
    methodIdx('WebView.goBack'),
    0x0000,
    0x000e,
    0x106f,
    methodIdx('Activity.onBackPressed'),
    0x0001,
    0x000e
  ]);

  // 3) protected MainActivity.onCreate(Bundle)V (registers=5, ins=2 -> v3 = this, v4 = savedInstanceState)
  const codeOnCreate = buildCodeItem(5, 2, 2, [
    // invoke-super {v3, v4}, Activity.onCreate(Bundle)V
    0x206f,
    methodIdx('Activity.onCreate'),
    0x0043,
    // new-instance v0, WebView
    0x0022,
    typeIdx('Landroid/webkit/WebView;'),
    // invoke-direct {v0, v3}, WebView.<init>(Context)V
    0x2070,
    methodIdx('WebView.<init>'),
    0x0030,
    // iput-object v0, v3, MainActivity.webView
    0x305b,
    0x0000,
    // invoke-virtual {v0}, WebView.getSettings()WebSettings
    0x106e,
    methodIdx('WebView.getSettings'),
    0x0000,
    // move-result-object v1
    0x010c,
    // const/4 v2, 1
    0x1212,
    // invoke-virtual {v1, v2}, WebSettings.setJavaScriptEnabled(Z)V
    0x206e,
    methodIdx('WebSettings.setJavaScriptEnabled'),
    0x0021,
    // invoke-virtual {v1, v2}, WebSettings.setDomStorageEnabled(Z)V
    0x206e,
    methodIdx('WebSettings.setDomStorageEnabled'),
    0x0021,
    // const/4 v2, 0
    0x0212,
    // invoke-virtual {v1, v2}, WebSettings.setMediaPlaybackRequiresUserGesture(Z)V
    0x206e,
    methodIdx('WebSettings.setMediaPlaybackRequiresUserGesture'),
    0x0021,
    // new-instance v1, WebViewClient
    0x0122,
    typeIdx('Landroid/webkit/WebViewClient;'),
    // invoke-direct {v1}, WebViewClient.<init>()V
    0x1070,
    methodIdx('WebViewClient.<init>'),
    0x0001,
    // invoke-virtual {v0, v1}, WebView.setWebViewClient(WebViewClient)V
    0x206e,
    methodIdx('WebView.setWebViewClient'),
    0x0010,
    // new-instance v1, WebChromeClient
    0x0122,
    typeIdx('Landroid/webkit/WebChromeClient;'),
    // invoke-direct {v1}, WebChromeClient.<init>()V
    0x1070,
    methodIdx('WebChromeClient.<init>'),
    0x0001,
    // invoke-virtual {v0, v1}, WebView.setWebChromeClient(WebChromeClient)V
    0x206e,
    methodIdx('WebView.setWebChromeClient'),
    0x0010,
    // invoke-virtual {v3, v0}, Activity.setContentView(View)V
    0x206e,
    methodIdx('Activity.setContentView'),
    0x0003,
    // const-string v1, "file:///android_asset/index.html"
    0x011a,
    strIdx('file:///android_asset/index.html'),
    // invoke-virtual {v0, v1}, WebView.loadUrl(String)V
    0x206e,
    methodIdx('WebView.loadUrl'),
    0x0010,
    // return-void
    0x000e
  ]);

  // Fixed section sizes before data section:
  const headerSize = 0x70; // 112
  const stringIdsOff = headerSize;
  const stringIdsSize = rawStrings.length * 4;
  const typeIdsOff = stringIdsOff + stringIdsSize;
  const typeIdsSize = typeDescriptors.length * 4;
  const protoIdsOff = typeIdsOff + typeIdsSize;
  const protoIdsSize = protos.length * 12;
  const fieldIdsOff = protoIdsOff + protoIdsSize;
  const fieldIdsSize = fields.length * 8;
  const methodIdsOff = fieldIdsOff + fieldIdsSize;
  const methodIdsSize = methods.length * 8;
  const classDefsOff = methodIdsOff + methodIdsSize;
  const classDefsSize = 32; // 1 class_def_item
  const dataOff = classDefsOff + classDefsSize;

  const data = new BinaryWriter();

  // 1) type_list items for protos with parameters (4-byte aligned)
  const protoParamOffsets = new Map<string, number>();
  let typeListCount = 0;
  const firstTypeListOff = dataOff;
  for (const p of protos) {
    if (p.params.length === 0) continue;
    const paramKey = p.params.join(',');
    if (protoParamOffsets.has(paramKey)) continue;
    data.align4();
    const off = dataOff + data.size;
    protoParamOffsets.set(paramKey, off);
    typeListCount++;
    data.writeU32LE(p.params.length);
    for (const pt of p.params) {
      data.writeU16LE(typeIdx(pt));
    }
  }

  // 2) code_item section (4-byte aligned)
  data.align4();
  const codeInitOff = dataOff + data.size;
  data.writeBytes(codeInit);

  data.align4();
  const codeOnBackOff = dataOff + data.size;
  data.writeBytes(codeOnBackPressed);

  data.align4();
  const codeOnCreateOff = dataOff + data.size;
  data.writeBytes(codeOnCreate);

  // 3) string_data_item section (unaligned byte stream)
  const stringDataOffStart = dataOff + data.size;
  const stringDataOffsets: number[] = [];
  for (const s of rawStrings) {
    stringDataOffsets.push(dataOff + data.size);
    const utf8Bytes = utf8Encoder.encode(s);
    data.writeULEB128(s.length); // utf16_size
    data.writeBytes(utf8Bytes);
    data.writeU8(0);
  }

  // 4) class_data_item section (unaligned ULEB128 stream)
  const classDataOff = dataOff + data.size;
  data.writeULEB128(0); // static_fields_size = 0
  data.writeULEB128(1); // instance_fields_size = 1
  data.writeULEB128(1); // direct_methods_size = 1 (<init>)
  data.writeULEB128(2); // virtual_methods_size = 2 (onBackPressed, onCreate)

  // instance_field[0]: field_idx_diff = 0, access_flags = ACC_PRIVATE (0x0002)
  data.writeULEB128(0);
  data.writeULEB128(0x0002);

  // direct_method[0]: MainActivity.<init>, access_flags = ACC_PUBLIC | ACC_CONSTRUCTOR (0x10001)
  data.writeULEB128(methodIdx('MainActivity.<init>'));
  data.writeULEB128(0x10001);
  data.writeULEB128(codeInitOff);

  // virtual_method[0]: MainActivity.onBackPressed, access_flags = ACC_PUBLIC (0x0001)
  const mOnBack = methodIdx('MainActivity.onBackPressed');
  const mOnCreate = methodIdx('MainActivity.onCreate');
  data.writeULEB128(mOnBack);
  data.writeULEB128(0x0001);
  data.writeULEB128(codeOnBackOff);

  // virtual_method[1]: MainActivity.onCreate, access_flags = ACC_PROTECTED (0x0004)
  data.writeULEB128(mOnCreate - mOnBack);
  data.writeULEB128(0x0004);
  data.writeULEB128(codeOnCreateOff);

  // 5) map_list section (4-byte aligned, must be at end of data)
  data.align4();
  const mapOff = dataOff + data.size;
  const mapEntries: Array<[number, number, number]> = [
    [0x0000, 1, 0], // TYPE_HEADER_ITEM
    [0x0001, rawStrings.length, stringIdsOff], // TYPE_STRING_ID_ITEM
    [0x0002, typeDescriptors.length, typeIdsOff], // TYPE_TYPE_ID_ITEM
    [0x0003, protos.length, protoIdsOff], // TYPE_PROTO_ID_ITEM
    [0x0004, fields.length, fieldIdsOff], // TYPE_FIELD_ID_ITEM
    [0x0005, methods.length, methodIdsOff], // TYPE_METHOD_ID_ITEM
    [0x0006, 1, classDefsOff], // TYPE_CLASS_DEF_ITEM
    [0x1001, typeListCount, firstTypeListOff], // TYPE_TYPE_LIST
    [0x2001, 3, codeInitOff], // TYPE_CODE_ITEM
    [0x2002, rawStrings.length, stringDataOffStart], // TYPE_STRING_DATA_ITEM
    [0x2000, 1, classDataOff], // TYPE_CLASS_DATA_ITEM
    [0x1000, 1, mapOff] // TYPE_MAP_LIST
  ];
  data.writeU32LE(mapEntries.length);
  for (const [t, count, off] of mapEntries) {
    data.writeU16LE(t);
    data.writeU16LE(0);
    data.writeU32LE(count);
    data.writeU32LE(off);
  }
  data.align4();

  const dataBytes = data.toUint8Array();
  const fileSize = dataOff + dataBytes.length;

  const dex = new BinaryWriter();
  // Header (112 bytes)
  dex.writeBytes(new Uint8Array([0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00])); // "dex\n035\0"
  dex.writeU32LE(0); // checksum placeholder (bytes 8..11)
  dex.writeBytes(new Uint8Array(20)); // SHA-1 signature placeholder (bytes 12..31)
  dex.writeU32LE(fileSize);
  dex.writeU32LE(0x70); // header_size
  dex.writeU32LE(0x12345678); // endian_tag
  dex.writeU32LE(0); // link_size
  dex.writeU32LE(0); // link_off
  dex.writeU32LE(mapOff);
  dex.writeU32LE(rawStrings.length);
  dex.writeU32LE(stringIdsOff);
  dex.writeU32LE(typeDescriptors.length);
  dex.writeU32LE(typeIdsOff);
  dex.writeU32LE(protos.length);
  dex.writeU32LE(protoIdsOff);
  dex.writeU32LE(fields.length);
  dex.writeU32LE(fieldIdsOff);
  dex.writeU32LE(methods.length);
  dex.writeU32LE(methodIdsOff);
  dex.writeU32LE(1); // class_defs_size
  dex.writeU32LE(classDefsOff);
  dex.writeU32LE(dataBytes.length);
  dex.writeU32LE(dataOff);

  // string_ids
  for (const off of stringDataOffsets) dex.writeU32LE(off);
  // type_ids
  for (const t of typeDescriptors) dex.writeU32LE(strIdx(t));
  // proto_ids
  for (const p of protos) {
    dex.writeU32LE(strIdx(p.shorty));
    dex.writeU32LE(typeIdx(p.returnType));
    dex.writeU32LE(p.params.length ? protoParamOffsets.get(p.params.join(','))! : 0);
  }
  // field_ids
  for (const f of fields) {
    dex.writeU16LE(typeIdx(f.classDesc));
    dex.writeU16LE(typeIdx(f.typeDesc));
    dex.writeU32LE(strIdx(f.name));
  }
  // method_ids
  for (const m of methods) {
    dex.writeU16LE(typeIdx(m.classDesc));
    dex.writeU16LE(protoIdx(m.protoKey));
    dex.writeU32LE(strIdx(m.name));
  }
  // class_defs (1 item = 32 bytes)
  dex.writeU32LE(typeIdx('Lid/alqurandigital/app/MainActivity;'));
  dex.writeU32LE(0x0001); // ACC_PUBLIC
  dex.writeU32LE(typeIdx('Landroid/app/Activity;')); // superclass_idx
  dex.writeU32LE(0); // interfaces_off
  dex.writeU32LE(strIdx('MainActivity.java')); // source_file_idx
  dex.writeU32LE(0); // annotations_off
  dex.writeU32LE(classDataOff);
  dex.writeU32LE(0); // static_values_off

  dex.writeBytes(dataBytes);

  const out = dex.toUint8Array();
  // Compute SHA-1 over bytes [32..end) and store at [12..31]
  const sha1 = await sha1Bytes(out.subarray(32));
  out.set(sha1, 12);
  // Compute Adler-32 over bytes [12..end) and store LE at [8..11]
  const adler = computeAdler32(out.subarray(12));
  new DataView(out.buffer, out.byteOffset, out.byteLength).setUint32(8, adler, true);

  return out;
}

// ============================================================================
// DER ASN.1 Helpers & APK v1 (PKCS#7) + APK Signature Scheme v2 Signer
// ============================================================================

function derLen(len: number): Uint8Array {
  if (len < 128) return new Uint8Array([len]);
  const bytes: number[] = [];
  let v = len;
  while (v > 0) {
    bytes.unshift(v & 0xff);
    v >>>= 8;
  }
  return new Uint8Array([0x80 | bytes.length, ...bytes]);
}

function derTlv(tag: number, content: Uint8Array): Uint8Array {
  return concatBytes([new Uint8Array([tag]), derLen(content.length), content]);
}

function buildPkcs7CertRsa(
  certDer: Uint8Array,
  issuerDer: Uint8Array,
  serialDer: Uint8Array,
  signatureBytes: Uint8Array
): Uint8Array {
  // OID 1.2.840.113549.1.7.2 (signedData)
  const oidSignedData = new Uint8Array([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x02]);
  // OID 1.2.840.113549.1.7.1 (data)
  const oidData = new Uint8Array([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x01]);
  // AlgorithmIdentifier SHA-256: 2.16.840.1.101.3.4.2.1 + NULL
  const algSha256 = derTlv(
    0x30,
    new Uint8Array([0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00])
  );
  // AlgorithmIdentifier rsaEncryption: 1.2.840.113549.1.1.1 + NULL
  const algRsaEnc = derTlv(
    0x30,
    new Uint8Array([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00])
  );

  const version1 = new Uint8Array([0x02, 0x01, 0x01]);
  const digestAlgorithms = derTlv(0x31, algSha256);
  const encapContentInfo = derTlv(0x30, oidData);
  const certificates = derTlv(0xa0, certDer);

  const issuerAndSerial = derTlv(0x30, concatBytes([issuerDer, serialDer]));
  const encryptedDigest = derTlv(0x04, signatureBytes);
  const signerInfo = derTlv(
    0x30,
    concatBytes([version1, issuerAndSerial, algSha256, algRsaEnc, encryptedDigest])
  );
  const signerInfos = derTlv(0x31, signerInfo);

  const signedData = derTlv(
    0x30,
    concatBytes([version1, digestAlgorithms, encapContentInfo, certificates, signerInfos])
  );

  return derTlv(0x30, concatBytes([oidSignedData, derTlv(0xa0, signedData)]));
}

let cachedCryptoSigningKey: CryptoKey | null = null;

async function getApkSigningKey(): Promise<CryptoKey> {
  if (cachedCryptoSigningKey) return cachedCryptoSigningKey;
  const pkcs8Bytes = decodeBase64ToBytes(APK_SIGNING_PKCS8_B64);
  cachedCryptoSigningKey = await globalThis.crypto.subtle.importKey(
    'pkcs8',
    toBufferSource(pkcs8Bytes),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return cachedCryptoSigningKey;
}

async function computeApkV2ContentDigest(sections: readonly Uint8Array[]): Promise<Uint8Array> {
  const CHUNK_SIZE = 1024 * 1024; // 1 MiB
  const chunkDigests: Uint8Array[] = [];

  for (const section of sections) {
    let offset = 0;
    while (offset < section.length) {
      const slice = section.subarray(offset, Math.min(offset + CHUNK_SIZE, section.length));
      const chunkPrefix = new Uint8Array(5);
      chunkPrefix[0] = 0xa5;
      new DataView(chunkPrefix.buffer).setUint32(1, slice.length, true);
      chunkDigests.push(await sha256Bytes(concatBytes([chunkPrefix, slice])));
      offset += slice.length;
    }
  }

  const topPrefix = new Uint8Array(5);
  topPrefix[0] = 0x5a;
  new DataView(topPrefix.buffer).setUint32(1, chunkDigests.length, true);
  return sha256Bytes(concatBytes([topPrefix, ...chunkDigests]));
}

function lenPrefixed(data: Uint8Array): Uint8Array {
  const b = new Uint8Array(4 + data.length);
  new DataView(b.buffer).setUint32(0, data.length, true);
  b.set(data, 4);
  return b;
}

async function buildApkSignatureSchemeV2Block(
  beforeCentralDir: Uint8Array,
  centralDir: Uint8Array,
  eocdTemplate: Uint8Array,
  signingKey: CryptoKey,
  certDer: Uint8Array
): Promise<Uint8Array> {
  // Modify EOCD copy so bytes 16..19 hold offset of APK Signing Block (= beforeCentralDir.length)
  const eocdForDigest = new Uint8Array(eocdTemplate);
  new DataView(eocdForDigest.buffer).setUint32(16, beforeCentralDir.length, true);

  const topDigest = await computeApkV2ContentDigest([beforeCentralDir, centralDir, eocdForDigest]);

  // Signature algorithm ID: 0x0103 = RSASSA-PKCS1-v1_5 with SHA2-256
  const SIG_ALG_RSA_PKCS1_V1_5_SHA256 = 0x0103;

  const digestEntry = new BinaryWriter();
  digestEntry.writeU32LE(SIG_ALG_RSA_PKCS1_V1_5_SHA256);
  digestEntry.writeBytes(lenPrefixed(topDigest));
  const digestsSeq = lenPrefixed(lenPrefixed(digestEntry.toUint8Array()));

  const certsSeq = lenPrefixed(lenPrefixed(certDer));
  const additionalAttrsSeq = lenPrefixed(new Uint8Array(0));

  const signedDataBytes = concatBytes([digestsSeq, certsSeq, additionalAttrsSeq]);

  const rawSig = new Uint8Array(
    await globalThis.crypto.subtle.sign('RSASSA-PKCS1-v1_5', signingKey, toBufferSource(signedDataBytes))
  );

  // Extract SubjectPublicKeyInfo from certDer or sign verification key bytes:
  // In X.509 certDer, SubjectPublicKeyInfo is the SEQUENCE starting with rsaEncryption OID.
  const spkiDer = extractSpkiFromCertDer(certDer);

  const sigEntry = new BinaryWriter();
  sigEntry.writeU32LE(SIG_ALG_RSA_PKCS1_V1_5_SHA256);
  sigEntry.writeBytes(lenPrefixed(rawSig));
  const signaturesSeq = lenPrefixed(lenPrefixed(sigEntry.toUint8Array()));

  const signerBytes = lenPrefixed(
    concatBytes([lenPrefixed(signedDataBytes), signaturesSeq, lenPrefixed(spkiDer)])
  );
  const v2Payload = lenPrefixed(signerBytes); // signers sequence

  // ID-value pair inside APK Signing Block: uint64 pairLen, uint32 id (0x7109871a), bytes value
  const pairLen = 4 + v2Payload.length;
  const pairWriter = new BinaryWriter();
  pairWriter.writeU64LE(pairLen, 0);
  pairWriter.writeU32LE(0x7109871a);
  pairWriter.writeBytes(v2Payload);

  // Pad APK Signing Block to multiple of 4096 bytes using Android verity padding block (0x42726577) if desired,
  // or standard 8-byte aligned block: size_of_block (uint64) + pairs + size_of_block (uint64) + "APK Sig Block 42" (16 bytes)
  const pairsBytes = pairWriter.toUint8Array();
  const sizeOfBlockField = pairsBytes.length + 8 + 16;

  const fullBlock = new BinaryWriter();
  fullBlock.writeU64LE(sizeOfBlockField, 0);
  fullBlock.writeBytes(pairsBytes);
  fullBlock.writeU64LE(sizeOfBlockField, 0);
  fullBlock.writeBytes(utf8Encoder.encode('APK Sig Block 42'));
  return fullBlock.toUint8Array();
}

function readAsn1Header(buf: Uint8Array, offset: number): { headerLen: number; contentLen: number; totalLen: number } {
  const b1 = buf[offset + 1];
  if ((b1 & 0x80) === 0) {
    return { headerLen: 2, contentLen: b1, totalLen: 2 + b1 };
  }
  const numBytes = b1 & 0x7f;
  let len = 0;
  for (let i = 0; i < numBytes; i++) {
    len = (len << 8) | buf[offset + 2 + i];
  }
  return { headerLen: 2 + numBytes, contentLen: len, totalLen: 2 + numBytes + len };
}

function extractSpkiFromCertDer(certDer: Uint8Array): Uint8Array {
  // Certificate ::= SEQUENCE { tbsCertificate SEQUENCE, ... }
  const outer = readAsn1Header(certDer, 0);
  let pos = outer.headerLen;
  const tbs = readAsn1Header(certDer, pos);
  pos += tbs.headerLen;
  // Inside TBSCertificate:
  // [0] version, serialNumber, signature, issuer, validity, subject, subjectPublicKeyInfo (7th element, index 6)
  for (let idx = 0; idx < 6; idx++) {
    const el = readAsn1Header(certDer, pos);
    pos += el.totalLen;
  }
  const spki = readAsn1Header(certDer, pos);
  return certDer.subarray(pos, pos + spki.totalLen);
}

// ============================================================================
// Complete Signed Android APK Builder (.apk)
// ============================================================================

function buildEmbeddedWebShellHtml(appUrl: string, deviceName: string, iconBase64: string): string {
  const safeHtmlUrl = escapeHtml(appUrl);
  const safeJsUrl = JSON.stringify(appUrl);
  const iconSrc = iconBase64 ? `data:image/png;base64,${iconBase64}` : '';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#059669" />
  <title>Al-Qur'an Digital</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #0b1118;
      color: #f8fafc;
    }
    .box {
      width: 100%;
      max-width: 400px;
      text-align: center;
      padding: 28px 22px;
      border-radius: 22px;
      background: #111a24;
      border: 1px solid rgba(16, 185, 129, 0.28);
    }
    .icon {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      margin: 0 auto 16px;
      background: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      overflow: hidden;
    }
    .icon img { width: 100%; height: 100%; object-fit: cover; }
    h1 { font-size: 19px; margin-bottom: 8px; }
    p { font-size: 13px; line-height: 1.6; color: #94a3b8; margin-bottom: 18px; }
    a.btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 46px;
      border-radius: 12px;
      background: #059669;
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">${iconSrc ? `<img src="${iconSrc}" alt="Al-Qur'an Digital" />` : 'ق'}</div>
    <h1>Al-Qur'an Digital</h1>
    <p id="msg">Memuat Al-Qur'an Digital 30 Juz, Tajwid Qira'ati &amp; Murottal untuk ${escapeHtml(deviceName)}...</p>
    <a class="btn" href="${safeHtmlUrl}">Muat Aplikasi</a>
  </div>
  <script>
    (function () {
      var url = ${safeJsUrl};
      if (navigator.onLine === false) {
        var m = document.getElementById('msg');
        if (m) m.textContent = 'Tidak ada koneksi internet. Sambungkan perangkat lalu ketuk Muat Aplikasi.';
        return;
      }
      window.location.replace(url);
    })();
  </script>
</body>
</html>`;
}

export async function buildSignedAndroidApk(options: {
  appUrl: string;
  isTablet: boolean;
  iconPngBytes?: Uint8Array;
}): Promise<Uint8Array> {
  const packageName = 'id.alqurandigital.app';
  const appLabel = "Al-Qur'an Digital";
  const deviceName = options.isTablet ? 'Tablet Android' : 'HP Android';
  const iconBytes =
    options.iconPngBytes && options.iconPngBytes.length > 0
      ? options.iconPngBytes
      : decodeBase64ToBytes(FALLBACK_PNG_B64);
  const iconB64 = encodeBytesToBase64(iconBytes);

  const manifestBytes = buildAndroidBinaryManifestXml({
    packageName,
    appLabel,
    versionName: '1.0.0',
    versionCode: 1
  });
  const resourcesBytes = buildAndroidResourcesArsc(packageName);
  const classesDexBytes = await buildAndroidClassesDex();
  const assetHtmlBytes = utf8Encoder.encode(
    buildEmbeddedWebShellHtml(options.appUrl, deviceName, iconB64)
  );

  const coreFiles: ZipEntryInput[] = [
    { name: 'AndroidManifest.xml', data: manifestBytes },
    { name: 'resources.arsc', data: resourcesBytes, align4: true },
    { name: 'res/drawable/icon.png', data: iconBytes, align4: true },
    { name: 'classes.dex', data: classesDexBytes, align4: true },
    { name: 'assets/index.html', data: assetHtmlBytes }
  ];

  // Build JAR Signature v1 (META-INF/MANIFEST.MF, CERT.SF, CERT.RSA)
  const mfLines: string[] = [
    'Manifest-Version: 1.0',
    'Created-By: Al-Quran Digital Builder 1.0',
    ''
  ];
  for (const f of coreFiles) {
    const digestB64 = encodeBytesToBase64(await sha256Bytes(f.data));
    mfLines.push(`Name: ${f.name}`);
    mfLines.push(`SHA-256-Digest: ${digestB64}`);
    mfLines.push('');
  }
  const manifestMfBytes = utf8Encoder.encode(mfLines.join('\r\n'));
  const mfMainDigestB64 = encodeBytesToBase64(await sha256Bytes(manifestMfBytes));

  const sfLines: string[] = [
    'Signature-Version: 1.0',
    'Created-By: Al-Quran Digital Builder 1.0',
    'X-Android-APK-Signed: 2',
    `SHA-256-Digest-Manifest: ${mfMainDigestB64}`,
    ''
  ];
  for (const f of coreFiles) {
    const sectionStr = `Name: ${f.name}\r\nSHA-256-Digest: ${encodeBytesToBase64(
      await sha256Bytes(f.data)
    )}\r\n\r\n`;
    const sectionDigest = encodeBytesToBase64(await sha256Bytes(utf8Encoder.encode(sectionStr)));
    sfLines.push(`Name: ${f.name}`);
    sfLines.push(`SHA-256-Digest: ${sectionDigest}`);
    sfLines.push('');
  }
  const certSfBytes = utf8Encoder.encode(sfLines.join('\r\n'));

  const signingKey = await getApkSigningKey();
  const certDer = decodeBase64ToBytes(APK_SIGNING_CERT_B64);
  const issuerDer = decodeBase64ToBytes(APK_SIGNING_ISSUER_B64);
  const serialDer = decodeBase64ToBytes(APK_SIGNING_SERIAL_B64);

  const v1Sig = new Uint8Array(
    await globalThis.crypto.subtle.sign('RSASSA-PKCS1-v1_5', signingKey, toBufferSource(certSfBytes))
  );
  const certRsaBytes = buildPkcs7CertRsa(certDer, issuerDer, serialDer, v1Sig);

  const allEntries: ZipEntryInput[] = [
    ...coreFiles,
    { name: 'META-INF/MANIFEST.MF', data: manifestMfBytes },
    { name: 'META-INF/CERT.SF', data: certSfBytes },
    { name: 'META-INF/CERT.RSA', data: certRsaBytes }
  ];

  // Pass 1: build unsigned-v2 ZIP to get exact Local section, Central Directory, and EOCD
  const unsignedLayout = buildZipArchive(allEntries);
  const beforeCentral = unsignedLayout.bytes.subarray(0, unsignedLayout.centralDirOffset);
  const centralDir = unsignedLayout.bytes.subarray(
    unsignedLayout.centralDirOffset,
    unsignedLayout.eocdOffset
  );
  const eocd = unsignedLayout.bytes.subarray(unsignedLayout.eocdOffset);

  // Pass 2: compute APK Signature Scheme v2 block and splice before Central Directory
  const apkSigBlock = await buildApkSignatureSchemeV2Block(
    beforeCentral,
    centralDir,
    eocd,
    signingKey,
    certDer
  );

  return buildZipArchive(allEntries, apkSigBlock).bytes;
}

// ============================================================================
// Genuine Apple iOS / iPadOS Application Archive (.ipa) Builder
// ============================================================================

function buildMachOArm64Executable(): Uint8Array {
  // Valid 64-bit ARM64 Mach-O MH_EXECUTE (0xfeedfacf, CPU_TYPE_ARM64 = 0x0100000c)
  // Load commands: LC_SEGMENT_64 (__PAGEZERO), LC_SEGMENT_64 (__TEXT + __text),
  // LC_SEGMENT_64 (__LINKEDIT), LC_BUILD_VERSION (iOS 14.0 / SDK 17.0),
  // LC_LOAD_DYLIB (/usr/lib/libSystem.B.dylib), LC_MAIN, LC_UUID
  const pageSize = 0x4000; // 16 KB iOS ARM64 page size
  const fileSize = pageSize * 2; // 32 KB minimal valid ARM64 Mach-O image
  const buf = new Uint8Array(fileSize);
  const dv = new DataView(buf.buffer);

  // Load Command 1: LC_SEGMENT_64 __PAGEZERO (72 bytes)
  const lcPageZero = new BinaryWriter();
  lcPageZero.writeU32LE(0x19); // LC_SEGMENT_64
  lcPageZero.writeU32LE(72);
  const pzName = new Uint8Array(16);
  pzName.set(utf8Encoder.encode('__PAGEZERO'));
  lcPageZero.writeBytes(pzName);
  lcPageZero.writeU64LE(0, 0); // vmaddr
  lcPageZero.writeU64LE(0, 1); // vmsize = 4 GiB
  lcPageZero.writeU64LE(0, 0); // fileoff
  lcPageZero.writeU64LE(0, 0); // filesize
  lcPageZero.writeU32LE(0); // maxprot
  lcPageZero.writeU32LE(0); // initprot
  lcPageZero.writeU32LE(0); // nsects
  lcPageZero.writeU32LE(0); // flags

  // Load Command 2: LC_SEGMENT_64 __TEXT with 1 section __text (72 + 80 = 152 bytes)
  const entryOff = 0x1000;
  const lcText = new BinaryWriter();
  lcText.writeU32LE(0x19);
  lcText.writeU32LE(152);
  const txtSegName = new Uint8Array(16);
  txtSegName.set(utf8Encoder.encode('__TEXT'));
  lcText.writeBytes(txtSegName);
  lcText.writeU64LE(0, 1); // vmaddr = 0x100000000
  lcText.writeU64LE(pageSize, 0); // vmsize
  lcText.writeU64LE(0, 0); // fileoff
  lcText.writeU64LE(pageSize, 0); // filesize
  lcText.writeU32LE(5); // VM_PROT_READ | VM_PROT_EXECUTE
  lcText.writeU32LE(5);
  lcText.writeU32LE(1); // nsects = 1
  lcText.writeU32LE(0);
  // Section __text (80 bytes)
  const sectName = new Uint8Array(16);
  sectName.set(utf8Encoder.encode('__text'));
  lcText.writeBytes(sectName);
  lcText.writeBytes(txtSegName);
  lcText.writeU64LE(entryOff, 1); // addr = 0x100001000
  lcText.writeU64LE(8, 0); // size = 8 bytes (2 ARM64 instructions)
  lcText.writeU32LE(entryOff); // offset
  lcText.writeU32LE(2); // align = 2^2
  lcText.writeU32LE(0); // reloff
  lcText.writeU32LE(0); // nreloc
  lcText.writeU32LE(0x80000400); // S_REGULAR | S_ATTR_PURE_INSTRUCTIONS | S_ATTR_SOME_INSTRUCTIONS
  lcText.writeU32LE(0);
  lcText.writeU32LE(0);
  lcText.writeU32LE(0);

  // Load Command 3: LC_SEGMENT_64 __LINKEDIT (72 bytes)
  const lcLinkEdit = new BinaryWriter();
  lcLinkEdit.writeU32LE(0x19);
  lcLinkEdit.writeU32LE(72);
  const leName = new Uint8Array(16);
  leName.set(utf8Encoder.encode('__LINKEDIT'));
  lcLinkEdit.writeBytes(leName);
  lcLinkEdit.writeU64LE(pageSize, 1); // vmaddr
  lcLinkEdit.writeU64LE(pageSize, 0); // vmsize
  lcLinkEdit.writeU64LE(pageSize, 0); // fileoff
  lcLinkEdit.writeU64LE(pageSize, 0); // filesize
  lcLinkEdit.writeU32LE(1); // VM_PROT_READ
  lcLinkEdit.writeU32LE(1);
  lcLinkEdit.writeU32LE(0);
  lcLinkEdit.writeU32LE(0);

  // Load Command 4: LC_BUILD_VERSION (24 bytes) - PLATFORM_IOS = 2
  const lcBuild = new BinaryWriter();
  lcBuild.writeU32LE(0x32); // LC_BUILD_VERSION
  lcBuild.writeU32LE(24);
  lcBuild.writeU32LE(2); // PLATFORM_IOS
  lcBuild.writeU32LE(0x000e0000); // minos 14.0.0
  lcBuild.writeU32LE(0x00110000); // sdk 17.0.0
  lcBuild.writeU32LE(0); // ntools

  // Load Command 5: LC_LOAD_DYLIB (/usr/lib/libSystem.B.dylib)
  const dylibPath = utf8Encoder.encode('/usr/lib/libSystem.B.dylib\0');
  const dylibCmdSize = Math.ceil((24 + dylibPath.length) / 8) * 8;
  const lcDylib = new BinaryWriter();
  lcDylib.writeU32LE(0x0c); // LC_LOAD_DYLIB
  lcDylib.writeU32LE(dylibCmdSize);
  lcDylib.writeU32LE(24); // name offset
  lcDylib.writeU32LE(2); // timestamp
  lcDylib.writeU32LE(0x05480000); // current_version
  lcDylib.writeU32LE(0x00010000); // compatibility_version
  lcDylib.writeBytes(dylibPath);
  while (lcDylib.size < dylibCmdSize) lcDylib.writeU8(0);

  // Load Command 6: LC_MAIN (0x80000028, 24 bytes)
  const lcMain = new BinaryWriter();
  lcMain.writeU32LE(0x80000028);
  lcMain.writeU32LE(24);
  lcMain.writeU64LE(entryOff, 0); // entryoff
  lcMain.writeU64LE(0, 0); // stacksize

  // Load Command 7: LC_UUID (0x1b, 24 bytes)
  const lcUuid = new BinaryWriter();
  lcUuid.writeU32LE(0x1b);
  lcUuid.writeU32LE(24);
  lcUuid.writeBytes(
    new Uint8Array([
      0x41, 0x6c, 0x51, 0x75, 0x72, 0x61, 0x6e, 0x44,
      0x69, 0x67, 0x69, 0x74, 0x61, 0x6c, 0x01, 0x00
    ])
  );

  const cmds = concatBytes([
    lcPageZero.toUint8Array(),
    lcText.toUint8Array(),
    lcLinkEdit.toUint8Array(),
    lcBuild.toUint8Array(),
    lcDylib.toUint8Array(),
    lcMain.toUint8Array(),
    lcUuid.toUint8Array()
  ]);

  // mach_header_64 (32 bytes)
  dv.setUint32(0, 0xfeedfacf, true); // MH_MAGIC_64
  dv.setUint32(4, 0x0100000c, true); // CPU_TYPE_ARM64
  dv.setUint32(8, 0, true); // CPU_SUBTYPE_ARM64_ALL
  dv.setUint32(12, 2, true); // MH_EXECUTE
  dv.setUint32(16, 7, true); // ncmds = 7
  dv.setUint32(20, cmds.length, true); // sizeofcmds
  dv.setUint32(24, 0x00200085, true); // MH_NOUNDEFS | MH_DYLDLINK | MH_TWOLEVEL | MH_PIE
  dv.setUint32(28, 0, true); // reserved

  buf.set(cmds, 32);

  // ARM64 machine code at entryOff (mov w0, #0 ; ret):
  dv.setUint32(entryOff, 0x52800000, true); // mov w0, #0
  dv.setUint32(entryOff + 4, 0xd65f03c0, true); // ret

  return buf;
}

export async function buildAppleIpaArchive(options: {
  appUrl: string;
  isIPad: boolean;
  iconPngBytes?: Uint8Array;
}): Promise<Uint8Array> {
  const safeXmlUrl = escapeHtml(options.appUrl);
  const bundleId = options.isIPad ? 'id.alqurandigital.ipad' : 'id.alqurandigital.ios';
  const deviceLabel = options.isIPad ? 'iPad (iPadOS)' : 'iPhone (iOS)';
  const iconBytes =
    options.iconPngBytes && options.iconPngBytes.length > 0
      ? options.iconPngBytes
      : decodeBase64ToBytes(FALLBACK_PNG_B64);
  const iconB64 = encodeBytesToBase64(iconBytes);

  const deviceFamilyXml = options.isIPad
    ? '    <integer>2</integer>\n    <integer>1</integer>'
    : '    <integer>1</integer>\n    <integer>2</integer>';

  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>id</string>
  <key>CFBundleDisplayName</key>
  <string>Al-Qur'an Digital</string>
  <key>CFBundleExecutable</key>
  <string>AlQuranDigital</string>
  <key>CFBundleIdentifier</key>
  <string>${bundleId}</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>AlQuranDigital</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSRequiresIPhoneOS</key>
  <true/>
  <key>MinimumOSVersion</key>
  <string>14.0</string>
  <key>UIDeviceFamily</key>
  <array>
${deviceFamilyXml}
  </array>
  <key>UIRequiresFullScreen</key>
  <false/>
  <key>UIBackgroundModes</key>
  <array>
    <string>audio</string>
  </array>
  <key>CFBundleIcons</key>
  <dict>
    <key>CFBundlePrimaryIcon</key>
    <dict>
      <key>CFBundleIconFiles</key>
      <array>
        <string>AppIcon60x60</string>
      </array>
      <key>UIPrerenderedIcon</key>
      <true/>
    </dict>
  </dict>
  <key>CFBundleIcons~ipad</key>
  <dict>
    <key>CFBundlePrimaryIcon</key>
    <dict>
      <key>CFBundleIconFiles</key>
      <array>
        <string>AppIcon76x76</string>
        <string>AppIcon60x60</string>
      </array>
      <key>UIPrerenderedIcon</key>
      <true/>
    </dict>
  </dict>
  <key>UISupportedInterfaceOrientations</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
  </array>
  <key>UISupportedInterfaceOrientations~ipad</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationPortraitUpsideDown</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
  </array>
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
  </dict>
  <key>AlQuranWebAppURL</key>
  <string>${safeXmlUrl}</string>
</dict>
</plist>
`;

  const infoPlistBytes = utf8Encoder.encode(infoPlist);
  const pkgInfoBytes = utf8Encoder.encode('APPL????');
  const machOBytes = buildMachOArm64Executable();
  const webShellBytes = utf8Encoder.encode(
    buildEmbeddedWebShellHtml(options.appUrl, deviceLabel, iconB64)
  );

  const resourceFiles: Array<{ relPath: string; data: Uint8Array }> = [
    { relPath: 'AppIcon60x60@2x.png', data: iconBytes },
    { relPath: 'AppIcon60x60@3x.png', data: iconBytes },
    { relPath: 'AppIcon76x76@2x~ipad.png', data: iconBytes },
    { relPath: 'Info.plist', data: infoPlistBytes },
    { relPath: 'PkgInfo', data: pkgInfoBytes },
    { relPath: 'www/index.html', data: webShellBytes }
  ];

  // Build _CodeSignature/CodeResources plist with real SHA-1 & SHA-256 digests
  const files2Entries: string[] = [];
  for (const rf of resourceFiles) {
    if (rf.relPath === 'Info.plist') continue;
    const h1 = encodeBytesToBase64(await sha1Bytes(rf.data));
    const h2 = encodeBytesToBase64(await sha256Bytes(rf.data));
    files2Entries.push(`    <key>${escapeHtml(rf.relPath)}</key>
    <dict>
      <key>hash</key>
      <data>${h1}</data>
      <key>hash2</key>
      <data>${h2}</data>
    </dict>`);
  }

  const codeResourcesXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>files2</key>
  <dict>
${files2Entries.join('\n')}
  </dict>
  <key>rules2</key>
  <dict>
    <key>.*</key>
    <true/>
    <key>^Info\\.plist$</key>
    <dict>
      <key>omit</key>
      <true/>
      <key>weight</key>
      <real>20</real>
    </dict>
  </dict>
</dict>
</plist>
`;

  const appPrefix = 'Payload/AlQuranDigital.app';
  const ipaEntries: ZipEntryInput[] = [
    { name: `${appPrefix}/Info.plist`, data: infoPlistBytes, unixMode: 0o100644 },
    { name: `${appPrefix}/PkgInfo`, data: pkgInfoBytes, unixMode: 0o100644 },
    { name: `${appPrefix}/AlQuranDigital`, data: machOBytes, unixMode: 0o100755 },
    { name: `${appPrefix}/AppIcon60x60@2x.png`, data: iconBytes, unixMode: 0o100644 },
    { name: `${appPrefix}/AppIcon60x60@3x.png`, data: iconBytes, unixMode: 0o100644 },
    { name: `${appPrefix}/AppIcon76x76@2x~ipad.png`, data: iconBytes, unixMode: 0o100644 },
    { name: `${appPrefix}/www/index.html`, data: webShellBytes, unixMode: 0o100644 },
    {
      name: `${appPrefix}/_CodeSignature/CodeResources`,
      data: utf8Encoder.encode(codeResourcesXml),
      unixMode: 0o100644
    }
  ];

  return buildZipArchive(ipaEntries).bytes;
}
