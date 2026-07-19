#!/usr/bin/env python3
"""Bake calligraphy-edits.json into calligraphy.html static markup.
Only updates the fields that were actually edited (non-empty in JSON)."""
import json
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path("/Users/joeylu/Workbuddy/personal website")
HTML_PATH = ROOT / "calligraphy.html"
JSON_PATH = Path("/Users/joeylu/Downloads/calligraphy-edits.json")

edits = json.loads(JSON_PATH.read_text(encoding="utf-8"))
html = HTML_PATH.read_text(encoding="utf-8")


def replace_between(html: str, start_tag: str, end_tag: str, new_text: str) -> str:
    start = html.find(start_tag)
    if start == -1:
        return html
    end = html.find(end_tag, start + len(start_tag))
    if end == -1:
        return html
    return html[: start + len(start_tag)] + new_text + html[end:]


# 1. Update left-thumb title and sub for each edited work.
for idx in sorted(edits.keys()):
    data = edits[idx]
    thumb_start = f'<button class="gallery-thumb" data-index="{idx}"'
    if thumb_start not in html:
        print(f"Warning: thumb {idx} not found in HTML")
        continue

    # locate the chunk for this thumb
    thumb_pos = html.find(thumb_start)
    next_thumb_pos = html.find('<button class="gallery-thumb"', thumb_pos + len(thumb_start))
    if next_thumb_pos == -1:
        thumb_chunk = html[thumb_pos:]
    else:
        thumb_chunk = html[thumb_pos:next_thumb_pos]

    if "title" in data and data["title"]:
        # replace first thumb-title inside this chunk
        old = '<span class="thumb-title">《作品名》</span>'
        new = f'<span class="thumb-title">{data["title"]}</span>'
        if old in thumb_chunk:
            thumb_chunk = thumb_chunk.replace(old, new, 1)
        else:
            # maybe already edited, try generic replacement
            ts_start = '<span class="thumb-title">'
            ts_end = '</span>'
            ts_pos = thumb_chunk.find(ts_start)
            if ts_pos != -1:
                te_pos = thumb_chunk.find(ts_end, ts_pos + len(ts_start))
                if te_pos != -1:
                    thumb_chunk = thumb_chunk[:ts_pos + len(ts_start)] + data["title"] + thumb_chunk[te_pos:]

    if "line" in data and data["line"]:
        # replace first thumb-sub inside this chunk
        old = '<span class="thumb-sub">2024 · 草书</span>'
        # The actual default may differ; use a generic replacement.
        sub_start = '<span class="thumb-sub">'
        sub_end = '</span>'
        sub_pos = thumb_chunk.find(sub_start)
        if sub_pos != -1:
            sub_end_pos = thumb_chunk.find(sub_end, sub_pos + len(sub_start))
            if sub_end_pos != -1:
                thumb_chunk = thumb_chunk[:sub_pos + len(sub_start)] + data["line"] + thumb_chunk[sub_end_pos:]

    # splice chunk back into html
    if next_thumb_pos == -1:
        html = html[:thumb_pos] + thumb_chunk
    else:
        html = html[:thumb_pos] + thumb_chunk + html[next_thumb_pos:]

# 2. Update the initial stage (data-current="01") fields.
if "01" in edits:
    data = edits["01"]
    stage_start = '<article class="gallery-stage" data-current="01">'
    stage_pos = html.find(stage_start)
    if stage_pos != -1:
        next_stage_pos = html.find('</article>', stage_pos) + len('</article>')
        stage_chunk = html[stage_pos:next_stage_pos]

        if "title" in data and data["title"]:
            stage_chunk = replace_between(
                stage_chunk,
                '<h2\n                class="stage-title"\n                contenteditable="plaintext-only"\n                data-field="title"\n                data-placeholder="《作品名》"\n                spellcheck="false"\n              >',
                '</h2>',
                data["title"],
            )
        if "line" in data and data["line"]:
            stage_chunk = replace_between(
                stage_chunk,
                '<p\n                class="stage-line"\n                contenteditable="plaintext-only"\n                data-field="line"\n                data-placeholder="年份 · 书体"\n                spellcheck="false"\n              >',
                '</p>',
                data["line"],
            )
        if "size" in data and data["size"]:
            stage_chunk = replace_between(
                stage_chunk,
                '<p\n                class="stage-size"\n                contenteditable="plaintext-only"\n                data-field="size"\n                data-placeholder="138 × 69 cm · 水墨宣纸 Ink on xuan paper"\n                spellcheck="false"\n              >',
                '</p>',
                data["size"],
            )

        html = html[:stage_pos] + stage_chunk + html[next_stage_pos:]

HTML_PATH.write_text(html, encoding="utf-8")
print(f"Updated {HTML_PATH}")
print("Edited works:", ", ".join(sorted(edits.keys())))
