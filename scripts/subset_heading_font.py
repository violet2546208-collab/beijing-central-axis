"""Keep only the heading glyphs used by this PC demo."""

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
target = root / "assets" / "hld-heading.ttf"
text = (root / "index.html").read_text(encoding="utf-8")
text += (root / "main.js").read_text(encoding="utf-8")

font = TTFont(source)
subsetter = subset.Subsetter()
subsetter.populate(text=text)
subsetter.subset(font)
font.save(target)
print(f"Saved {target} ({target.stat().st_size:,} bytes)")
