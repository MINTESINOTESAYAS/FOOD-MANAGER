# Release history

## 1.3 — Current

- Bundled the Poppins typeface locally under the SIL Open Font License and refined the 400/500/600/700 hierarchy to match the CRAVE Figma sample more closely, without removing app content.
- Added restrained scroll-triggered section reveals, with reduced-motion support.
- Replaced per-sale tax-rate calculations with a manually entered ETB annual tax amount, saved separately by tax year and allocated across reporting periods for profit estimates.
- Added a monthly fasting-and-sales calendar where owners manually tag Orthodox Christian and Muslim fasting days, record notes, and compare logged sales without assuming causation.
- Made the dashboard greeting use the `Africa/Addis_Ababa` time zone and refresh as the local time changes.
- Added optional Google sign-in and owner-private Google Sheets backup/restore for settings, ingredients, recipes, menu, sales, annual tax, manually tagged fasting dates, and daily profit. Credentials still require one-time OAuth/API setup; see `GOOGLE_SHEETS_SETUP.md`.
- Preloaded Google Identity Services for browser preview sign-in to preserve click activation for OAuth popups, with a clearer recovery message if the browser blocks a popup.
- Kept cloud backup direct-to-Google with no paid backup server or trial; batched and rate-limited writes, and documented Google API quota and free-storage caveats.
- Updated the Android `versionName` to `1.3` and `versionCode` to `3`.

## 1.2

- Adapted the restaurant workspace for Ethiopian dishes and ETB.
- Made new restaurant menus blank for manual entry and retained an Ethiopian sample workspace.
- Added authentic sample dish photography, photo credits, and optional local uploads for exact kitchen photos.

## 1.1

- Established the Crave Ledger restaurant-finance app: local owner accounts, sales tracking, recipe ingredient costing, rent and payroll allocation, daily profit, and rule-based insights.
