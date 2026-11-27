#!/usr/bin/env python3
"""Tahta fotoğraflarını (601, 602) kilitler.

Repoda her tahta iki dosyadır:
  boards/tNN.jpg      herkesin gördüğü bulanık kopya
  boards/tNN.jpg.enc  asıl fotoğraf, AES-256-GCM ile şifreli (12 bayt IV + şifreli veri)

Şifreleme anahtarı yalnızca bu bilgisayarda durur (~/.config/kbm-tahta/anahtar).
Sitedeki tahta-kilit.json, bu anahtarın kullanıcının şifresiyle (PBKDF2-SHA256)
sarılmış hâlidir; tarayıcı şifreyle anahtarı açar, sonra fotoğrafları çözer
(tahta.js). Böylece yeni haftalar şifreyi bilmeden kilitlenebilir.

Kullanım:
  python3 tools/tahta.py kilitle 601/hafta-9      # yeni haftanın tahtalarını kilitle
  python3 tools/tahta.py sifre                    # şifreyi belirle ya da değiştir (terminalde)
"""
import base64
import getpass
import json
import os
import shutil
import sys
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
HOME = Path.home() / '.config' / 'kbm-tahta'
KEYFILE = HOME / 'anahtar'
ORIG = HOME / 'asil'            # asılların yerel yedeği
LOCK = ROOT / 'tahta-kilit.json'
ITER = 600_000
EXTS = {'.jpg', '.jpeg', '.png', '.webp'}


def b64(b):
    return base64.b64encode(b).decode()


def load_key(create=False):
    if KEYFILE.exists():
        return base64.b64decode(KEYFILE.read_text().strip())
    if not create:
        sys.exit(f'Anahtar yok: {KEYFILE}. Bu bilgisayarda kilitleme yapılamaz.')
    HOME.mkdir(parents=True, exist_ok=True)
    os.chmod(HOME, 0o700)
    key = AESGCM.generate_key(bit_length=256)
    KEYFILE.write_text(b64(key) + '\n')
    os.chmod(KEYFILE, 0o600)
    return key


def blur(src, dst):
    im = Image.open(src)
    im.load()
    w, h = im.size
    small = im.convert('RGB').resize((max(1, w // 24), max(1, h // 24)), Image.BILINEAR)
    small = small.filter(ImageFilter.GaussianBlur(1.2))
    small.resize((w, h), Image.BICUBIC).save(dst, 'JPEG', quality=72, optimize=True, progressive=True)


def kilitle(dirs):
    key = load_key(create=True)
    aes = AESGCM(key)
    n = 0
    for d in dirs:
        boards = (ROOT / d / 'boards') if (ROOT / d / 'boards').is_dir() else (ROOT / d)
        for f in sorted(boards.iterdir()):
            if f.suffix.lower() not in EXTS:
                continue
            enc = f.with_name(f.name + '.enc')
            if enc.exists():
                continue                      # zaten kilitli; jpg bulanık kopya
            data = f.read_bytes()
            backup = ORIG / f.relative_to(ROOT)
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, backup)
            iv = os.urandom(12)
            enc.write_bytes(iv + aes.encrypt(iv, data, None))
            blur(backup, f)
            n += 1
    print(f'{n} fotoğraf kilitlendi. Asılların yedeği: {ORIG}')


def sifre():
    key = load_key(create=True)
    if not sys.stdin.isatty():
        sys.exit('Bunu bir terminalde çalıştır; şifre ekranda görünmeden sorulacak.')
    p1 = getpass.getpass('Yeni şifre: ')
    if len(p1) < 10:
        sys.exit('Şifre en az 10 karakter olsun.')
    if getpass.getpass('Şifre (tekrar): ') != p1:
        sys.exit('İki şifre aynı değil.')
    salt, iv = os.urandom(16), os.urandom(12)
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER)
    wrap = AESGCM(kdf.derive(p1.encode('utf-8')))
    LOCK.write_text(json.dumps({'v': 1, 'kdf': 'PBKDF2-SHA256', 'iter': ITER, 'salt': b64(salt),
                                'iv': b64(iv), 'ct': b64(wrap.encrypt(iv, key, None))}, indent=1) + '\n')
    print(f'Şifre ayarlandı: {LOCK.relative_to(ROOT)} yazıldı. Commit ve push edince geçerli olur.')


if __name__ == '__main__':
    if len(sys.argv) >= 3 and sys.argv[1] == 'kilitle':
        kilitle(sys.argv[2:])
    elif sys.argv[1:] == ['sifre']:
        sifre()
    else:
        sys.exit(__doc__)
