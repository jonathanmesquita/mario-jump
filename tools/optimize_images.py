"""Converts PNG art to WebP for the game (much smaller, same look).

Usage, from the project folder (needs Python 3 with Pillow: pip install Pillow):

    python tools/optimize_images.py images/cenarios/novo-cenario.png [more.png ...]
    python tools/optimize_images.py --all

Each PNG becomes a .webp next to it (quality 90, transparency kept exactly)
and the PNG is deleted. Remember to point the code to the new .webp name.
--all converts every PNG under images/ except the small pixel-exact
obstacle sprites, which stay PNG.
"""
import pathlib
import sys

from PIL import Image

KEEP_PNG = {'obstaculos'}   # folders whose PNGs are left untouched
QUALITY = 90


def convert(path):
    path = pathlib.Path(path)
    image = Image.open(path)
    has_alpha = image.mode in ('RGBA', 'LA', 'P')
    image = image.convert('RGBA' if has_alpha else 'RGB')
    target = path.with_suffix('.webp')
    image.save(target, 'WEBP', quality=QUALITY, method=6, alpha_quality=100)
    before, after = path.stat().st_size, target.stat().st_size
    path.unlink()
    print(f'{path} -> {target.name}: {before / 1e6:.2f} MB -> {after / 1e6:.2f} MB')
    return before, after


def main(args):
    if args == ['--all']:
        files = [p for p in sorted(pathlib.Path('images').rglob('*.png'))
                 if not KEEP_PNG.intersection(p.parts)]
    else:
        files = args
    if not files:
        print(__doc__)
        return
    totals = [convert(f) for f in files]
    before = sum(t[0] for t in totals)
    after = sum(t[1] for t in totals)
    print(f'Total: {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB')


if __name__ == '__main__':
    main(sys.argv[1:])
