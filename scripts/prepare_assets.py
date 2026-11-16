"""Extract the team's building illustrations into small transparent web assets.

Usage: python scripts/prepare_assets.py path/to/人工智能+元素.zip
Requires Pillow. The original archive remains untouched.
"""

from pathlib import Path
from io import BytesIO
import sys
import zipfile

from PIL import Image


NAMES = {
    "永定门": "yongdingmen",
    "先农坛": "xiannongtan",
    "天坛": "tiantan",
    "正阳门箭楼": "zhengyangmen-arrow",
    "正阳门城楼": "zhengyangmen-gate",
    "天安门广场": "tiananmen-square",
    "外水金桥": "outer-jinshui-bridge",
    "太庙": "taimiao",
    "社稷坛": "shejitan",
    "端门": "duanmen",
    "故宫": "forbidden-city",
    "景山公园": "jingshan",
    "万宁桥": "wanning-bridge",
    "鼓楼": "drum-tower",
    "钟楼": "bell-tower",
}


def save_building(raw: bytes, output: Path) -> None:
    image = Image.open(BytesIO(raw)).convert("RGBA")
    bounds = image.getchannel("A").getbbox()
    if not bounds:
        raise ValueError(f"Empty illustration: {output.name}")
    image = image.crop(bounds)
    image.thumbnail((1100, 1100), Image.Resampling.LANCZOS)
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, "WEBP", quality=91, method=6)


def main() -> None:
    archive = Path(sys.argv[1])
    output_dir = Path(__file__).resolve().parents[1] / "assets" / "buildings"
    with zipfile.ZipFile(archive) as bundle:
        members = {Path(info.filename).name: info for info in bundle.infolist() if not info.is_dir()}
        for chinese, slug in NAMES.items():
            for suffix, mode in (("白", "day"), ("黑", "night")):
                filename = f"人工智能+_{chinese}-{suffix}.png"
                if filename not in members:
                    continue
                dest = output_dir / f"{slug}-{mode}.webp"
                save_building(bundle.read(members[filename]), dest)
                print(dest.relative_to(output_dir.parent.parent))

        # The team's original long-axis compositions are kept as small overview images.
        for suffix, mode in (("白", "day"), ("黑", "night")):
            name = f"人工智能+_长轴-{suffix}.png"
            image = Image.open(BytesIO(bundle.read(members[name]))).convert("RGBA")
            image.thumbnail((640, 2400), Image.Resampling.LANCZOS)
            dest = output_dir.parent / f"axis-overview-{mode}.webp"
            image.save(dest, "WEBP", quality=85, method=6)
            print(dest.relative_to(output_dir.parent.parent))


if __name__ == "__main__":
    main()
