# Optional local fonts

The app runs with system-font fallbacks and does not require these files.
To use the intended display and UI typefaces, add the following WOFF2 files here:

- `CormorantGaramond-SemiBold.woff2` — Cormorant Garamond, weight 600
- `CormorantGaramond-Bold.woff2` — Cormorant Garamond, weight 700
- `Inter-Regular.woff2` — Inter, weight 400
- `Inter-Medium.woff2` — Inter, weight 500
- `Inter-SemiBold.woff2` — Inter, weight 600

Download the corresponding Latin WOFF2 weights from the official Google Fonts
repositories. Both projects are distributed under the SIL Open Font License (OFL):

- Cormorant Garamond: https://github.com/google/fonts/tree/main/ofl/cormorantgaramond
- Inter: https://github.com/google/fonts/tree/main/ofl/inter

The CSS uses `font-display: swap` and local installed-font fallbacks first, so the
interface remains usable while this directory is empty.
