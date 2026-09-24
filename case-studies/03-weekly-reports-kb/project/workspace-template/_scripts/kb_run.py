"""Carrying one document through build_kb - session handling.

Processing one document has two parts, split by a model step:

  --scan <key>    prepare + extract + PRINT THE LINE MAP
                  (the model reads the printout and writes spec_<key>.json)
  --finish <key>  assemble + validate + render + archive the run

The split is deliberate: the script never guesses where an entry starts or
who the client is. It does everything around that decision.

  python _scripts/kb_run.py --list          # what's left to process
  python _scripts/kb_run.py --scan 2025-W05
  python _scripts/kb_run.py --finish 2025-W05
"""

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

# Windows consoles often write in a legacy codepage and choke on non-ASCII
# characters from report text. Force UTF-8.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "_flows" / "build_kb" / "stages"
SPEC_DIR = BUILD / "02_read" / "_scripts"
RUNS = ROOT / "_kb" / "_runs"


def run(script, *args):
    result = subprocess.run([sys.executable, str(script), *args], cwd=ROOT)
    return result.returncode


def scan(key):
    if run(BUILD / "00_prepare" / "_scripts" / "prepare.py", "--key", key):
        return 1
    if run(BUILD / "01_extract" / "_scripts" / "extract.py"):
        return 1

    raw = json.loads((BUILD / "01_extract" / "output" / "raw_text.json").read_text(encoding="utf-8"))
    print(f"\n--- LINE MAP {key} ---")
    print(f"message date: {raw['message_meta'].get('date')}")
    for i, line in enumerate(raw["text"].split("\n")):
        is_row = line.count(" | ") >= 2
        # Table rows get more characters shown — that is where a model reads
        # the client and the opportunity id. At 100 characters it took a
        # second pass to see the same data.
        print(f"{i:3} {'ROW' if is_row else '   '} {line[:230] if is_row else line[:100]}")
    spec = SPEC_DIR / f"spec_{key}.json"
    print(f"\nNext step: write the decisions to {spec.name}, then --finish {key}")
    print(f"spec exists: {spec.is_file()}")
    return 0


def finish(key):
    spec = SPEC_DIR / f"spec_{key}.json"
    if not spec.is_file():
        print(f"ERROR: {spec.name} not found — run --scan and write the model's decisions first.", file=sys.stderr)
        return 1
    meta = BUILD / "00_prepare" / "output" / "metadata.json"
    if not meta.is_file() or json.loads(meta.read_text(encoding="utf-8"))["doc_key"] != key:
        if run(BUILD / "00_prepare" / "_scripts" / "prepare.py", "--key", key):
            return 1
        if run(BUILD / "01_extract" / "_scripts" / "extract.py"):
            return 1

    for step in ("02_read/_scripts/assemble.py", "03_validate/_scripts/validate.py",
                 "04_render_md/_scripts/render_md.py"):
        if run(BUILD / step):
            print(f"ERROR at step {step} - run stopped.", file=sys.stderr)
            return 1

    target = RUNS / key
    target.mkdir(parents=True, exist_ok=True)
    shutil.copy(BUILD / "03_validate" / "output" / "validated.json", target / "validated.json")
    print(f"\narchived run: _kb/_runs/{key}/")
    return 0


def list_docs():
    done = {p.name for p in RUNS.glob("*") if (p / "validated.json").is_file()}
    result = subprocess.run([sys.executable, str(BUILD / "00_prepare" / "_scripts" / "prepare.py"), "--list"],
                            cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    keys = [l.split()[0] for l in result.stdout.split("\n") if l.strip() and l.lstrip()[0].isdigit()]
    todo = [k for k in keys if k not in done]
    print(f"documents: {len(keys)}   processed: {len(done)}   remaining: {len(todo)}")
    print(f"\ndone: {', '.join(sorted(done)) or 'none'}")
    print(f"\nremaining:")
    for k in todo:
        has_spec = (SPEC_DIR / f"spec_{k}.json").is_file()
        print(f"  {k}  {'[spec ready]' if has_spec else ''}")
    return 0


def main():
    ap = argparse.ArgumentParser(description="Carrying one document through build_kb")
    ap.add_argument("--scan", metavar="KEY")
    ap.add_argument("--finish", metavar="KEY")
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()
    if args.list:
        return list_docs()
    if args.scan:
        return scan(args.scan)
    if args.finish:
        return finish(args.finish)
    ap.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
