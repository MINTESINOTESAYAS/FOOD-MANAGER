# Crave Ledger — restaurant profit, plate by plate

**Current app version: 1.3.** Release history for versions 1.1 and 1.2 is recorded in `CHANGELOG.md`.

Crave Ledger is an offline-first Android app for an Ethiopian restaurant. It records menu sales in Ethiopian birr (ETB), calculates recipe-level ingredient costs, allocates rent and payroll to daily results, reserves a manually entered annual tax amount, and turns the numbers into practical margin suggestions.

## Run the preview

The same bundled interface used by Android can run in a browser:

```sh
npm start
```

Open the local address printed by the server. The first visit opens a **sample workspace** so the dashboard is useful immediately. Use the account menu to sign out, then create a local account or sign back in. The sample workspace login is one tap; there is no sample password.

## Build the Android app

1. Open the `android/` folder in Android Studio.
2. Use JDK 17 and install Android SDK 35 when prompted.
3. Sync the Gradle project and run it on an emulator or Android device.

The Android host is a small native Kotlin `WebView` activity; its HTML, CSS, JavaScript, charts, and starter data are bundled in `android/app/src/main/assets/`. The activity serves them from an app-local HTTPS origin, so secure browser APIs work offline. Internet access is used only for optional Google sign-in and Sheets backup; the restaurant workspace remains usable offline after installation.

## What it does

- **Accounts:** sign in with Google and connect a private spreadsheet per owner, or keep using the existing local-password account on the current device. Local passwords are salted and PBKDF2/SHA-256 hashed with Web Crypto; the raw password is not saved. Google access tokens are short-lived and kept in memory only.
- **ETB throughout:** all prices, sales, costs, and profit reports use Ethiopian birr (ETB); the currency is fixed to ETB.
- **Ethiopian menu entered by hand:** new restaurant accounts start with a blank menu. Owners manually enter their dishes, ETB prices, and serving recipes. The sample workspace uses Ethiopian dishes such as Firfir (Fifir), Beyaynetu, Shiro Wot, Kikil, Tibs, fish with injera, vegetable rice, Doro Wat, Kitfo, and Misir Wat.
- **Exact dish photos:** the sample uses real photos of Beyaynetu, Shiro, Tibs, and Kitfo (credited in the app’s Account & data screen and in `IMAGE_ATTRIBUTIONS.md`). For your own menu, upload a real photo of that exact dish from your kitchen; there are no AI-generated food images. Photo uploads are resized locally for storage.
- **Daily sales:** log item, quantity, selling price, and date. Historical entries retain the selling price and recipe-cost snapshot from the time they were entered.
- **Fasting & sales calendar:** manually tag dates for Orthodox Christian fasting, Muslim fasting, or both, with an optional note. The monthly calendar shows recorded ETB sales and compares average sales on tagged versus other days; it does not auto-fill religious dates or claim fasting caused a change. Only days with recorded sales count in the averages.
- **Menu & recipes:** manually enter the quantity of every ingredient used in one serving. Plate contribution is price minus ingredients; annual tax is accounted for in daily profit, not charged per sale.
- **Costs:** edit unit prices, monthly rent, headcount, payroll, and open days per month. Enter one ETB tax amount per calendar year; different years can have different amounts. The annual amount is allocated through monthly and daily reports for profit estimates.
- **Profit & trends:** view today, the last seven days, or month-to-date; see revenue, ingredients, tax reserve, allocated rent and payroll, costs, margin, and net profit.
- **Insights:** transparent rule-based suggestions about food-cost ratio, a low-margin dish, best-selling items, and a daily break-even target. They recalculate from the workspace data.
- **Data portability:** export/import a JSON backup from Account & data. Google sign-in can create or restore a private Google Sheets workspace with readable tabs for settings, costs, annual tax, menu recipes, sales, fasting dates, and daily profit. The sample workspace is never uploaded. Reset the sample workspace to its original demo numbers.

## Calculation notes

```text
plate ingredient cost = sum(recipe quantity × current ingredient unit cost)
recorded food cost    = sold quantity × saved unit-cost snapshot
plate contribution    = selling price − recipe ingredient cost
allocated annual tax  = (annual tax for year ÷ 12) × allocated open days ÷ open days in month
allocated rent        = monthly rent × allocated open days ÷ open days per month
allocated payroll     = monthly payroll × allocated open days ÷ open days per month
net profit             = sales − recorded food cost − allocated annual tax − rent − payroll
```

The annual tax obligation is entered once for each tax year; reports allocate it across months and open days for profit estimates, while sales and plate contribution do not apply a tax rate per transaction. New workspaces begin with no tax amount entered. Older workspaces or backups that only contain a sales-tax percentage are not auto-converted; enter the annual obligation manually because the percentage does not determine it. These figures are planning estimates, not accounting or tax advice; tax treatment differs by location, so reconcile annual amounts with your accountant.

## Design reference

The visual language adapts the user-provided [CRAVE Restaurant App UI Kit](https://www.figma.com/proto/sIsG21llijvkC2PyJ81UYM/Restaurant_App_UI_Kit--Community-?node-id=202-253&t=vlQsOREqRGgfm4CY-1): bright white space, mandarin-orange actions, soft purple insight accents, friendly rounded surfaces, and food-led details. The linked kit is an ordering/onboarding UI; Crave Ledger translates its look into an original restaurant finance workflow rather than copying unrelated ordering screens. Design inspiration: **Restaurant_App_UI_Kit (CRAVE), Basuki Keshri, Figma Community, CC BY 4.0**. Poppins is bundled locally from `@fontsource/poppins` 5.3.0; its SIL Open Font License is included at `android/app/src/main/assets/fonts/OFL.txt`.

## Account, backup, and privacy notes

Local-password accounts and their data remain on the current device. Google sign-in is an optional owner-controlled path: it uses the Google Sheets/Drive APIs directly from the app, with a separate private spreadsheet in the signed-in owner’s Drive and no Crave Ledger backend. Automatic backup cannot run until free Google OAuth/API configuration is completed; see [`GOOGLE_SHEETS_SETUP.md`](GOOGLE_SHEETS_SETUP.md). Browser preview sign-in also needs a public Web OAuth client ID in `google-config.js`.

The Sheets API’s standard use has no additional cost, but Google documents free request quotas and says quota overages are planned to incur charges later in 2026. A Google Account’s free Drive storage is shared with Gmail and Photos, and new Sheets count toward that storage. Crave Ledger batches and rate-limits writes, never enables billing or buys storage, and keeps the local workspace if cloud sync fails. Review the setup guide before connecting an account. Client-side Google sign-in and local-password handling are not a substitute for a server-side production identity system if the app is later expanded to shared multi-user administration.
