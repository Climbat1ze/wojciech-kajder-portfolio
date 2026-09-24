# Feature catalogues

One markdown file per product or module you sell, each with the same
canonical table (see `_data/README.md` §2.5). `F_ID` is a **single global
sequence shared across every file in this folder** — before assigning a new
one, scan every `.md` file here for the current maximum and use `max + 1`.
`node _flows/_lib/tools/check_integrity.js` will flag a duplicate if two
files ever land on the same ID.

`_example_module.md` in this folder is a header-only starting point — copy
it, rename it to your own product/module, and start adding rows. The
filename (minus `.md`) is what you pass as `--product` to Stage 02 of the
data-ingestion flow.

Tables in this folder are identified by their **header row**, not by
filename or content — a file can carry other prose or a second table for
some other purpose, and the tooling will still find the right one, as long
as its header matches `F_ID | Feature | Product | Description | Source |
Status`.
