# HTML report — design tokens

**Layer 3 — reference material.** `generate_html.js` inlines these as CSS
custom properties. Swap the color values for your own brand; the structure
(light/dark pairs, spacing scale) is what the generator depends on, not the
specific hex values below.

```css
:root {
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --ink: #1a1a1f;
  --ink-muted: #5b5b66;
  --canvas: #ffffff;
  --panel: #f5f6fa;
  --hairline: rgba(0,0,0,.10);
  --success: #1a8917;
  --warning: #b25000;
  --r-md: 10px;
  --r-lg: 16px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 24px;
  --s-6: 32px;
  --s-7: 48px;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --ink: #f2f2f5;
    --ink-muted: #a9a9b3;
    --canvas: #16161a;
    --panel: #1e1e24;
    --hairline: rgba(255,255,255,.12);
    --accent: #5b9bff;
  }
}

:root[data-theme="dark"] {
  --ink: #f2f2f5;
  --ink-muted: #a9a9b3;
  --canvas: #16161a;
  --panel: #1e1e24;
  --hairline: rgba(255,255,255,.12);
  --accent: #5b9bff;
}
```

Badges: `VERIFIED` renders in `--success`, `TBC` in `--warning`, `PROPOSED`
in `--ink-muted`.
