import struct, zlib, os

def make_png(size):
    raw = b''
    for y in range(size):
        raw += b'\x00'
        for x in range(size):
            raw += b'\x0a\x0e\x27\xff'
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')

assets = '/tmp/kalshi-tracker/assets'
for fname in ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png']:
    with open(f'{assets}/{fname}', 'wb') as f:
        f.write(make_png(128))
    print(f'Created {fname}')
