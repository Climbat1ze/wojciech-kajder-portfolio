#!/usr/bin/env python3
"""Shared extraction primitive: binary file -> text.

ONE implementation of .msg/.docx decoding, used by build_kb/01_extract and by
any other flow that needs the same source text. Output is a superset of what
either kind of consumer needs, so nothing downstream has to change if you add
a second consumer later:

  metadata          {subject,date,sender,to} | {title,author,created,modified}
  html_body         .msg: raw HTML
  text_body         plain-text body
  attachments_count .msg
  paragraphs/tables .docx structural breakdown
  text              CLEAN text, tables rendered as "A | B | C" rows
  tables_found      table count
  content_origin    what `text` was built from

Usage:  python extract_source.py <file.msg|file.docx>
"""

import json
import re
import sys
from pathlib import Path

BLANK_RUN = re.compile(r"\n{3,}")
TRAILING_WS = re.compile(r"[ \t]+\n")


def decode_bytes(value):
    """Byte decoding: utf-8 -> cp1250 -> replace.

    Reports are sometimes saved in a legacy Windows codepage (accented
    characters). Order matters: try the modern encoding first, fall back to
    the legacy one, and only then accept lossy replacement.
    """
    if isinstance(value, bytes):
        for enc in ("utf-8", "cp1250"):
            try:
                return value.decode(enc)
            except UnicodeDecodeError:
                continue
        return value.decode("utf-8", errors="replace")
    return value


def tidy(text):
    """Normalises whitespace only. Never touches content."""
    if not text:
        return ""
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\xa0", " ")
    return BLANK_RUN.sub("\n\n", TRAILING_WS.sub("\n", text)).strip()


def html_to_text(html):
    """HTML -> text. Tables become '|'-separated rows, layout preserved.

    This is a FORMAT conversion, not an interpretation: a row stays a row, a
    cell stays a cell. Nothing is named or assigned meaning here.
    """
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["style", "script"]):
        tag.decompose()

    tables = soup.find_all("table")

    def is_data_table(t):
        """A data table has at least TWO rows with at least two cells each.

        Two thresholds, both learned from real reports:
        - single-column tables are page layout, not data; rendering them
          shatters content into single lines with no separators;
        - a single row of two cells is usually a caption or a logo insert,
          not a table — counting it as data would crowd out the real,
          larger table it happens to sit inside.
        Direct-child cells only, so nested tables aren't double-counted.
        """
        return sum(1 for tr in t.find_all("tr")
                   if len(tr.find_all(["td", "th"], recursive=False)) >= 2) >= 2

    # Render data tables, but never one that CONTAINS another data table.
    # Otherwise the outer cell's get_text() flattens the newlines the inner
    # table just inserted, and the whole report collapses onto one line.
    data_tables = [t for t in tables if is_data_table(t)]
    targets = [t for t in data_tables
               if not any(is_data_table(x) for x in t.find_all("table"))]
    for table in targets:
        rows = []
        for tr in table.find_all("tr"):
            cells = tr.find_all(["td", "th"])
            if not cells:
                continue
            row = " | ".join(" ".join(c.get_text(" ", strip=True).split()) for c in cells)
            if row.replace("|", "").strip():
                rows.append(row)
        table.replace_with(soup.new_string("\n" + "\n".join(rows) + "\n"))

    return tidy(soup.get_text("\n")), len(tables)


def extract_msg_file(path):
    import extract_msg

    try:
        msg = extract_msg.openMsg(str(path))
    except Exception as exc:
        return {"error": f"Could not open MSG: {exc}"}

    try:
        html_body = decode_bytes(getattr(msg, "htmlBody", None))
        text_body = decode_bytes(getattr(msg, "body", None))
        attachments = getattr(msg, "attachments", None)

        if html_body:
            text, tables_found = html_to_text(html_body)
            origin = "html_body"
        else:
            text, tables_found, origin = tidy(text_body), 0, "text_body"

        return {
            "source_type": "msg",
            "metadata": {
                "subject": decode_bytes(getattr(msg, "subject", None)),
                "date": str(msg.date) if getattr(msg, "date", None) else None,
                "sender": decode_bytes(getattr(msg, "sender", None)),
                "to": decode_bytes(getattr(msg, "to", None)),
            },
            "html_body": html_body,
            "text_body": text_body,
            "attachments_count": len(attachments) if attachments else 0,
            "text": text,
            "tables_found": tables_found,
            "content_origin": origin,
        }
    finally:
        try:
            msg.close()
        except Exception:
            pass


def extract_docx_file(path):
    from docx import Document

    try:
        doc = Document(str(path))
    except Exception as exc:
        return {"error": f"Could not open DOCX: {exc}"}

    props = doc.core_properties
    paragraphs = [
        {"text": p.text, "style": p.style.name, "level": p.paragraph_format.outline_level}
        for p in doc.paragraphs
    ]

    tables, rendered = [], []
    for idx, table in enumerate(doc.tables):
        rows = [[c.text for c in row.cells] for row in table.rows]
        if not rows:
            continue
        tables.append({
            "table_id": f"table_{idx}",
            "position_index": idx,
            "raw_structure": {
                "num_rows": len(rows),
                "num_cols": len(rows[0]),
                "header_row": rows[0],
                "data_rows": rows[1:],
            },
            "detected_type": "unknown",
        })
        rendered.append("\n".join(" | ".join(" ".join(c.split()) for c in r) for r in rows))

    text_body = "\n".join(p["text"] for p in paragraphs)
    parts = [p["text"] for p in paragraphs if p["text"].strip()] + rendered

    return {
        "source_type": "docx",
        "metadata": {
            "title": props.title,
            "author": props.author,
            "created": str(props.created) if props.created else None,
            "modified": str(props.modified) if props.modified else None,
        },
        "paragraphs": paragraphs,
        "text_body": text_body,
        "tables": tables,
        "text": tidy("\n\n".join(parts)),
        "tables_found": len(tables),
        "content_origin": "docx",
    }


def extract(path):
    path = Path(path)
    if not path.exists():
        return {"error": f"File not found: {path}"}
    suffix = path.suffix.lower()
    if suffix == ".msg":
        return extract_msg_file(path)
    if suffix == ".docx":
        return extract_docx_file(path)
    return {"error": f"Unsupported file type: {suffix}"}


if __name__ == "__main__":
    # Windows: Python writes to a pipe in the local codepage by default, which
    # corrupts non-ASCII JSON output. Force UTF-8 regardless of the console.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: extract_source.py <file.msg|file.docx>"}))
        sys.exit(1)
    result = extract(sys.argv[1])
    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
    sys.exit(1 if "error" in result else 0)
