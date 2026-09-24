# Warehousing & Logistics — Vertical Offering

Warehouse, distribution-center and last-mile operations

```notes
Mode: internal | Threshold: M | Language: EN
```

---

# Scope Board

| Pain | Features | Hardware |
|---|---|---|
| **Environmental** | | |
| P01: Device operation in cold-storage and outdoor conditions | — | Operating Temperature, Display Brightness |
| **Security** | | |
| P02: Unauthorized use of company devices | Kiosk Lockdown Mode | — |
| **Operations** | | |
| P03: Slow, error-prone manual data entry | High-Speed Barcode Engine, Scan Analytics Dashboard | — |
| P05: Long onboarding time for seasonal staff | Zero-Touch Enrollment | Battery |
| **Network** | | |
| P06: Network dead zones in large facilities | Offline Scan Queueing | — |

```notes
One-screen view of the whole offering for this vertical.
```

---

# Environmental
## P01: Device operation in cold-storage and outdoor conditions

Devices must work reliably from -20C to 45C in warehouse yards and cold-storage aisles

Relevance: H · Mapping [VERIFIED]

### Hardware

- **Operating Temperature** [VERIFIED]: -20C to 45C — Confirmed operating range covers cold storage and outdoor yards
- **Display Brightness** [VERIFIED]: 900 nits, sunlight readable — High-brightness display stays readable at outdoor loading docks

```notes
Pain point P01, cluster Environmental.
```

---

# Security
## P02: Unauthorized use of company devices

Shared devices get used for non-work apps, risking data leakage and support overhead

Relevance: M · Mapping [VERIFIED]

### Addressing features

- **Kiosk Lockdown Mode** [VERIFIED] (Aster Device Manager) — Locks the device to approved work apps only, preventing unauthorized use on shared devices
  - Source: S01

```notes
Pain point P02, cluster Security.
```

---

# Operations
## P03: Slow, error-prone manual data entry

Manual entry of item codes causes picking errors and slows fulfillment

Relevance: H · Mapping [VERIFIED]

### Addressing features

- **High-Speed Barcode Engine** [VERIFIED] (Aster Scan Suite) — High-speed scan engine reduces mis-scans and speeds up pick-and-pack
  - Source: S03
- **Scan Analytics Dashboard** [VERIFIED] (mapping [PROPOSED]) [Pilot feature — limited field data so far] (Aster Scan Suite) — Per-shift, per-device error-rate visibility lets a supervisor spot and correct mis-scan patterns instead of discovering them later
  - Source: S05

```notes
Pain point P03, cluster Operations.
```

---

# Operations
## P05: Long onboarding time for seasonal staff

Seasonal hires need devices configured and ready within hours, not days

Relevance: M · Mapping [VERIFIED]

### Addressing features

- **Zero-Touch Enrollment** [VERIFIED] (Aster Device Manager) — Automated zero-touch enrollment gets a new hire's device ready in minutes, not days
  - Source: S02

### Hardware

- **Battery** [VERIFIED]: Hot-swappable, 8500mAh — Hot-swappable battery avoids downtime during seasonal peak shift handoffs

```notes
Pain point P05, cluster Operations.
```

---

# Network
## P06: Network dead zones in large facilities

Large warehouses have Wi-Fi dead zones, often near metal racking, that interrupt scanning workflows

Relevance: M · Mapping [PROPOSED]

### Addressing features

- **Offline Scan Queueing** [VERIFIED] (Aster Scan Suite) — Local queueing means a dead zone does not stop the scanning workflow; every event syncs once back in range
  - Source: S05

```notes
Pain point P06, cluster Network.
```

---

# Hardware Platform

| ID | Attribute | Value / Spec | Status |
|---|---|---|---|
| HW01 | Operating Temperature | -20C to 45C | VERIFIED |
| HW02 | Display Brightness | 900 nits, sunlight readable | VERIFIED |
| HW04 | Battery | Hot-swappable, 8500mAh | VERIFIED |

```notes
Hardware specifications default to TBC until confirmed by an authoritative datasheet.
```

---

# Data Gaps

None.

---

Build summary: V01 (Warehousing & Logistics) · 5 pain point(s) in scope · 5 feature(s) · mode=internal · 0 item(s) sent to annex
