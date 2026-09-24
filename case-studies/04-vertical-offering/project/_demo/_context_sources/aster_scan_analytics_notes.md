# Aster Scan Suite — Field Notes on Connectivity and Analytics (fictional)

Several distribution-center customers reported that large facilities have
Wi-Fi dead zones — often near metal racking or in the back corners of cold
storage — where a device loses its connection mid-shift and scanning stalls
until the worker walks back into signal range.

To address this, the Scan Suite team is piloting **Offline Scan Queueing**:
when a device loses connectivity, every scan event is stored locally on the
device and automatically synced to the warehouse-management system the
moment the connection returns, with no data loss and no manual re-scanning.

Separately, a small number of pilot sites are trying a **Scan Analytics
Dashboard** that shows scan volume and error rates broken down by device and
by shift, so a floor supervisor can see at a glance which devices or shifts
are producing more mis-scans than usual. This is still an early pilot with
limited field data.
