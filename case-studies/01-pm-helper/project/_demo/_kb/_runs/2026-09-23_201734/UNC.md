Status: red

# Uncertainty

The go-live date is exposed by one unresolved critical risk: legacy data quality, which has no owner or resolution date yet.

Legacy data quality is the single biggest threat to a clean cutover: around 12% of catalogue records lack category codes and the loyalty export has duplicate IDs, and nobody has yet accepted the cleanup (`9c6de3eb8a4a94ca-RI-01`). A second, lower risk sits on the cutover itself: data drift if the store network is not read-only during the window (`09293a8baa7b37c0-RI-01`).

## Events
- 2026-09-08 — [risk, critical, open] Legacy data quality threatens a clean migration and the go-live date (`9c6de3eb8a4a94ca-RI-01`)
- 2026-09-18 — [risk, high, open] Data drift risk if the store network is not read-only during cutover (`09293a8baa7b37c0-RI-01`)
