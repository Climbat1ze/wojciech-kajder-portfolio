# Business Unit Code Map (demo data)

**Purpose:** Map business-unit / regional-office codes to full names, for consistent reporting.

**Usage:** Read by `stage_02_process.js` during data normalization.

---

## Mapping Table

| Code | Full Name | Region |
|------|-----------|--------|
| NW-US | Northwind Retail Division (United States) | North America |
| NW-EU | Northwind Europe Division | Europe |
| NW-APAC | Northwind Asia-Pacific Division | Asia-Pacific |
| NW-LATAM | Northwind Latin America Division | Latin America |

---

## Important Notes

- This is exactly the kind of table where two similar-looking codes can be silently merged by
  mistake. Keep every business unit's row explicit even if two of them share a similar name.

---

**Last Updated:** 2026-09-01 (demo data)
