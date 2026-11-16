"""Validate the source-linked SQLite records and export browser-readable data.

Run from the project root: python scripts/export_content_db.py
"""

import json
from pathlib import Path
import sqlite3
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
DATABASE = ROOT / "data" / "axis-content.sqlite3"
OUTPUT = ROOT / "content-db.js"
ALLOWED_SOURCE_HOSTS = {"whc.unesco.org", "www.beijing.gov.cn"}


def require(value, label):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Missing required content: {label}")
    return value.strip()


def main():
    if not DATABASE.is_file():
        raise FileNotFoundError(DATABASE)
    with sqlite3.connect(DATABASE) as connection:
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
        if integrity != "ok":
            raise ValueError(f"Database integrity check failed: {integrity}")
        sources = {}
        for row in connection.execute("SELECT id, title, url FROM source ORDER BY id"):
            url = require(row["url"], f"source {row['id']} URL")
            parsed = urlparse(url)
            if parsed.scheme != "https" or parsed.hostname not in ALLOWED_SOURCE_HOSTS:
                raise ValueError(f"Source is outside the approved official domains: {url}")
            sources[row["id"]] = {"title": require(row["title"], f"source {row['id']} title"), "url": url}
        if not sources:
            raise ValueError("The source registry is empty")

        stops = []
        seen_slugs = set()
        for stop in connection.execute("SELECT id, title, category, description FROM stop ORDER BY id"):
            items = []
            for place in connection.execute(
                """SELECT slug, name, side_offset, description, source_id, night_fallback
                   FROM place WHERE stop_id = ? ORDER BY display_order""",
                (stop["id"],),
            ):
                slug = require(place["slug"], f"stop {stop['id']} slug")
                if slug in seen_slugs:
                    raise ValueError(f"Duplicate asset slug: {slug}")
                seen_slugs.add(slug)
                source_id = place["source_id"]
                if source_id not in sources:
                    raise ValueError(f"No approved source for {slug}")
                for mode in ("day", "night"):
                    if mode == "night" and place["night_fallback"]:
                        continue
                    asset = ROOT / "assets" / "buildings" / f"{slug}-{mode}.webp"
                    if not asset.is_file():
                        raise FileNotFoundError(asset)
                item = {
                    "name": require(place["name"], f"{slug} name"),
                    "slug": slug,
                    "x": place["side_offset"],
                    "text": require(place["description"], f"{slug} description"),
                    "source": sources[source_id]["url"],
                    "sourceTitle": sources[source_id]["title"],
                }
                if place["night_fallback"]:
                    item["nightFallback"] = True
                items.append(item)
            if not items:
                raise ValueError(f"Stop {stop['id']} has no place records")
            stops.append({
                "title": require(stop["title"], f"stop {stop['id']} title"),
                "category": require(stop["category"], f"stop {stop['id']} category"),
                "description": require(stop["description"], f"stop {stop['id']} description"),
                "items": items,
            })

    payload = {"version": 1, "sources": sources, "stops": stops}
    OUTPUT.write_text(
        "// Generated from data/axis-content.sqlite3 by scripts/export_content_db.py.\n"
        "// Edit the SQLite records, then re-export.\n"
        "window.AXIS_CONTENT_DB = Object.freeze(\n"
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + "\n);\n",
        encoding="utf-8",
    )
    print(f"Validated {len(stops)} stops, {len(seen_slugs)} places, {len(sources)} official sources")


if __name__ == "__main__":
    main()
