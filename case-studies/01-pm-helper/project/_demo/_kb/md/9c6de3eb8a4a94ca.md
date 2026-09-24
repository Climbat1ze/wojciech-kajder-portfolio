# Dokument 9c6de3eb8a4a94ca

Źródło: `02_data-migration-risk.txt`

- from: Anna Kowalski <anna.kowalski@northwind.example>
- to: Mark Ellison <mark.ellison@meridian.example>
- subject: Risk - legacy data quality for migration
- date: 2026-09-08 16:40

---

<a id="msg-1"></a>
Mark,

<a id="9c6de3eb8a4a94ca-RI-01"></a>
Flagging a risk before it becomes a blocker. The legacy product catalogue has around 12% of records with missing category codes, and the loyalty export has duplicate customer IDs.

If this is not cleaned before the migration dry-run, we cannot guarantee a clean cutover and the go-live date is exposed.

<a id="9c6de3eb8a4a94ca-AC-01"></a>
Can you confirm who on the Meridian data team owns the cleanup, and by when? I need this to hold the schedule.

Anna