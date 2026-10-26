import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import {
  INSTALLER_FORMATS,
  detectMobileDeviceTarget,
  getPrimaryFormatForMobileDevice,
  isValidInstallerFormatId,
  sanitizeInstallerAppUrl,
  buildInstallerFilePayload
} from '../deviceInstaller';
import { computeAdler32 } from '../mobileBinaryBuilders';
import { createAppServer } from '../../../server';

test('detectMobileDeviceTarget classifies HP Android, Tablet Android, iPhone, and iPad while returning null for Desktop OSes', () => {
  // 1. Android Phone -> android-phone
  assert.equal(
    detectMobileDeviceTarget(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
      5,
      'Linux armv8l',
      390
    ),
    'android-phone'
  );

  // 2. Android Tablet -> android-tablet
  assert.equal(
    detectMobileDeviceTarget(
      'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      5,
      'Linux armv8l',
      800
    ),
    'android-tablet'
  );

  // 3. iPhone (iOS) -> ios-iphone
  assert.equal(
    detectMobileDeviceTarget(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      5,
      'iPhone',
      390
    ),
    'ios-iphone'
  );

  // 4a. Classic iPad User-Agent -> ios-ipad
  assert.equal(
    detectMobileDeviceTarget(
      'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      5,
      'iPad',
      768
    ),
    'ios-ipad'
  );

  // 4b. Modern iPadOS 13+ reporting MacIntel with multi-touch -> ios-ipad
  assert.equal(
    detectMobileDeviceTarget(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      5,
      'MacIntel',
      820
    ),
    'ios-ipad'
  );

  // 5. Desktop OSes -> strictly null (hidden from Desktop users!)
  assert.equal(
    detectMobileDeviceTarget(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      0,
      'Win32',
      1080
    ),
    null
  );
  assert.equal(
    detectMobileDeviceTarget(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      0,
      'MacIntel',
      900
    ),
    null
  );
  assert.equal(
    detectMobileDeviceTarget(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      0,
      'Linux x86_64',
      900
    ),
    null
  );
});

test('getPrimaryFormatForMobileDevice maps Android & Tablet to .apk and iPhone & iPad to .ipa', () => {
  assert.equal(INSTALLER_FORMATS.length, 4);
  assert.equal(getPrimaryFormatForMobileDevice('android-phone'), 'android-apk');
  assert.equal(getPrimaryFormatForMobileDevice('android-tablet'), 'android-tablet-apk');
  assert.equal(getPrimaryFormatForMobileDevice('ios-iphone'), 'ios-ipa');
  assert.equal(getPrimaryFormatForMobileDevice('ios-ipad'), 'ipados-ipa');
});

test('sanitizeInstallerAppUrl normalizes GitHub Pages subpaths and blocks dangerous schemes', () => {
  assert.equal(
    sanitizeInstallerAppUrl('https://user.github.io/quran-digital/index.html#/surah/36?ayat=5'),
    'https://user.github.io/quran-digital/'
  );
  assert.equal(
    sanitizeInstallerAppUrl('javascript:alert(1)', 'https://example.com/app'),
    'https://example.com/app/'
  );
  assert.equal(
    sanitizeInstallerAppUrl('https://evil.example.com/"&calc.exe', 'https://example.com/quran'),
    'https://example.com/quran/'
  );
});

function parseZipEntries(zipBytes: Uint8Array): Map<string, { data: Uint8Array; dataOffset: number }> {
  const dv = new DataView(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength);
  // Find EOCD (0x06054b50) from end
  let eocdOff = -1;
  for (let i = zipBytes.length - 22; i >= 0; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocdOff = i;
      break;
    }
  }
  assert.ok(eocdOff > 0, 'Valid ZIP EOCD header must exist');
  const totalEntries = dv.getUint16(eocdOff + 10, true);
  const cdOffset = dv.getUint32(eocdOff + 16, true);

  const map = new Map<string, { data: Uint8Array; dataOffset: number }>();
  let pos = cdOffset;
  const decoder = new TextDecoder();
  for (let idx = 0; idx < totalEntries; idx++) {
    assert.equal(dv.getUint32(pos, true), 0x02014b50, 'Central dir header signature');
    const compSize = dv.getUint32(pos + 20, true);
    const nameLen = dv.getUint16(pos + 28, true);
    const cdExtraLen = dv.getUint16(pos + 30, true);
    const commentLen = dv.getUint16(pos + 32, true);
    const localHeaderOff = dv.getUint32(pos + 42, true);
    const name = decoder.decode(zipBytes.subarray(pos + 46, pos + 46 + nameLen));

    assert.equal(dv.getUint32(localHeaderOff, true), 0x04034b50, 'Local header signature');
    const lhNameLen = dv.getUint16(localHeaderOff + 26, true);
    const lhExtraLen = dv.getUint16(localHeaderOff + 28, true);
    const dataOffset = localHeaderOff + 30 + lhNameLen + lhExtraLen;
    const data = zipBytes.subarray(dataOffset, dataOffset + compSize);
    map.set(name, { data, dataOffset });

    pos += 46 + nameLen + cdExtraLen + commentLen;
  }
  return map;
}

test('buildInstallerFilePayload generates genuine signed Android .apk (AXML, 4-byte aligned ARSC, DEX, APK Sig Block v2) and Apple .ipa (Mach-O ARM64, Info.plist, CodeResources)', async () => {
  const targetUrl = 'https://user.github.io/al-quran-digital/';

  for (const spec of INSTALLER_FORMATS) {
    assert.equal(isValidInstallerFormatId(spec.formatId), true);
  }

  // 1. Verify Android Phone & Tablet .apk
  for (const apkFormat of ['android-apk', 'android-tablet-apk'] as const) {
    const apkPayload = await buildInstallerFilePayload(apkFormat, targetUrl);
    assert.equal(apkPayload.spec.fileExtension, '.apk');
    assert.equal(apkPayload.spec.fileName.endsWith('.apk'), true);
    assert.ok(apkPayload.bytes.length > 4000);

    // Must contain APK Signature Scheme v2 magic
    const rawAscii = Buffer.from(apkPayload.bytes).toString('latin1');
    assert.ok(rawAscii.includes('APK Sig Block 42'), 'APK must contain APK Sig Block 42');

    const entries = parseZipEntries(apkPayload.bytes);
    assert.ok(entries.has('AndroidManifest.xml'));
    assert.ok(entries.has('resources.arsc'));
    assert.ok(entries.has('res/drawable/icon.png'));
    assert.ok(entries.has('classes.dex'));
    assert.ok(entries.has('assets/index.html'));
    assert.ok(entries.has('META-INF/MANIFEST.MF'));
    assert.ok(entries.has('META-INF/CERT.SF'));
    assert.ok(entries.has('META-INF/CERT.RSA'));

    // Android 11+ (API 30+) requires resources.arsc uncompressed & 4-byte aligned
    assert.equal(entries.get('resources.arsc')!.dataOffset % 4, 0);
    assert.equal(entries.get('res/drawable/icon.png')!.dataOffset % 4, 0);
    assert.equal(entries.get('classes.dex')!.dataOffset % 4, 0);

    // Binary AXML header (0x0003) & ARSC header (0x0002)
    const manifestDv = new DataView(
      entries.get('AndroidManifest.xml')!.data.buffer,
      entries.get('AndroidManifest.xml')!.data.byteOffset,
      entries.get('AndroidManifest.xml')!.data.byteLength
    );
    assert.equal(manifestDv.getUint16(0, true), 0x0003);

    const arscDv = new DataView(
      entries.get('resources.arsc')!.data.buffer,
      entries.get('resources.arsc')!.data.byteOffset,
      entries.get('resources.arsc')!.data.byteLength
    );
    assert.equal(arscDv.getUint16(0, true), 0x0002);

    // Dalvik classes.dex header, SHA-1, and Adler-32
    const dex = entries.get('classes.dex')!.data;
    assert.equal(Buffer.from(dex.subarray(0, 8)).toString('ascii'), 'dex\n035\0');
    const expectedSha1 = crypto.createHash('sha1').update(dex.subarray(32)).digest();
    assert.deepEqual(Buffer.from(dex.subarray(12, 32)), expectedSha1);
    const dexDv = new DataView(dex.buffer, dex.byteOffset, dex.byteLength);
    assert.equal(dexDv.getUint32(8, true), computeAdler32(dex.subarray(12)));

    // Embedded shell points to targetUrl
    const html = new TextDecoder().decode(entries.get('assets/index.html')!.data);
    assert.ok(html.includes(targetUrl));
  }

  // 2. Verify iPhone & iPad .ipa
  for (const ipaFormat of ['ios-ipa', 'ipados-ipa'] as const) {
    const ipaPayload = await buildInstallerFilePayload(ipaFormat, targetUrl);
    assert.equal(ipaPayload.spec.fileExtension, '.ipa');
    assert.equal(ipaPayload.spec.fileName.endsWith('.ipa'), true);
    assert.ok(ipaPayload.bytes.length > 32000);

    const entries = parseZipEntries(ipaPayload.bytes);
    assert.ok(entries.has('Payload/AlQuranDigital.app/Info.plist'));
    assert.ok(entries.has('Payload/AlQuranDigital.app/PkgInfo'));
    assert.ok(entries.has('Payload/AlQuranDigital.app/AlQuranDigital'));
    assert.ok(entries.has('Payload/AlQuranDigital.app/AppIcon60x60@3x.png'));
    assert.ok(entries.has('Payload/AlQuranDigital.app/AppIcon76x76@2x~ipad.png'));
    assert.ok(entries.has('Payload/AlQuranDigital.app/www/index.html'));
    assert.ok(entries.has('Payload/AlQuranDigital.app/_CodeSignature/CodeResources'));

    // Verify 64-bit ARM64 Mach-O magic (0xfeedfacf) & CPU_TYPE_ARM64 (0x0100000c)
    const macho = entries.get('Payload/AlQuranDigital.app/AlQuranDigital')!.data;
    const machoDv = new DataView(macho.buffer, macho.byteOffset, macho.byteLength);
    assert.equal(machoDv.getUint32(0, true), 0xfeedfacf);
    assert.equal(machoDv.getUint32(4, true), 0x0100000c);

    const plistXml = new TextDecoder().decode(
      entries.get('Payload/AlQuranDigital.app/Info.plist')!.data
    );
    assert.ok(plistXml.includes('<string>AlQuranDigital</string>'));
    assert.ok(plistXml.includes(targetUrl));
  }
});

test('Express GET /api/download-installer serves .apk for Android/Tablet, .ipa for iPhone/iPad, and blocks Desktop auto-downloads with 403', async () => {
  const prevEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const app = await createAppServer();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Android Phone UA -> .apk
    const androidRes = await fetch(`${baseUrl}/api/download-installer`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36'
      }
    });
    assert.equal(androidRes.status, 200);
    assert.equal(androidRes.headers.get('x-detected-device'), 'android-phone');
    assert.equal(androidRes.headers.get('x-installer-format'), 'android-apk');
    assert.match(
      androidRes.headers.get('content-disposition') || '',
      /Al-Quran-Digital-Android\.apk/
    );
    const androidBuf = new Uint8Array(await androidRes.arrayBuffer());
    assert.equal(androidBuf[0], 0x50); // 'P'
    assert.equal(androidBuf[1], 0x4b); // 'K'

    // 2. Android Tablet UA -> .apk
    const tabRes = await fetch(`${baseUrl}/api/download-installer`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    assert.equal(tabRes.status, 200);
    assert.equal(tabRes.headers.get('x-detected-device'), 'android-tablet');
    assert.match(
      tabRes.headers.get('content-disposition') || '',
      /Al-Quran-Digital-Tablet-Android\.apk/
    );

    // 3. iPhone UA -> .ipa
    const iosRes = await fetch(`${baseUrl}/api/download-installer`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
      }
    });
    assert.equal(iosRes.status, 200);
    assert.equal(iosRes.headers.get('x-detected-device'), 'ios-iphone');
    assert.equal(iosRes.headers.get('x-installer-format'), 'ios-ipa');
    assert.match(iosRes.headers.get('content-disposition') || '', /Al-Quran-Digital-iPhone\.ipa/);
    const iosBuf = new Uint8Array(await iosRes.arrayBuffer());
    assert.equal(iosBuf[0], 0x50);
    assert.equal(iosBuf[1], 0x4b);

    // 4. iPad UA -> .ipa
    const ipadRes = await fetch(`${baseUrl}/api/download-installer`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      }
    });
    assert.equal(ipadRes.status, 200);
    assert.equal(ipadRes.headers.get('x-detected-device'), 'ios-ipad');
    assert.match(ipadRes.headers.get('content-disposition') || '', /Al-Quran-Digital-iPad\.ipa/);

    // 5. Desktop Windows/Linux UA without mobile format -> 403 (Mobile & Tablet only!)
    const desktopRes = await fetch(`${baseUrl}/api/download-installer`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0'
      }
    });
    assert.equal(desktopRes.status, 403);
  } finally {
    process.env.NODE_ENV = prevEnv;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
