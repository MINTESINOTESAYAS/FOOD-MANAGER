# Free Google Sheets backup setup

Crave Ledger is designed to back up each owner’s workspace into a **private spreadsheet in that owner’s own Google Drive**. There is no Crave Ledger cloud server, paid backup vendor, subscription, or free trial in this flow. The app does not attach a billing account or store a Google client secret. The spreadsheet is only shared if its owner chooses to share it.

## Cost and free-use limits

- Google says standard Google Sheets API use has **no additional cost**. Current documented quotas are 300 reads and 300 writes per minute per project, and 60 reads and 60 writes per minute per user per project. Google says quota overages are planned to incur charges to a Google Cloud billing account later in 2026. See Google’s [Sheets API limits and pricing](https://developers.google.com/workspace/sheets/api/limits).
- To stay well below the per-user write quota, Crave Ledger coalesces quick edits, waits at least 8 seconds between full-workspace backups, spaces Sheets API write requests by at least 1.25 seconds, and retries quota responses with exponential backoff. Normal restaurant data entry is far below the published limit. If Google’s quota or your storage limit is reached, sync can fail; the app keeps the on-device copy and does not automatically enable billing or purchase more quota.
- A standard Google Account has **up to 15 GB of free storage**, shared across Drive, Gmail, and Photos. Google Sheets files created or edited after June 1, 2021 count toward that account storage. See [How Google storage works](https://support.google.com/drive/answer/9312312?hl=en). The free storage is an account quota, not a time-limited trial; if it fills, the owner must free space or choose whether to buy more storage. Crave Ledger never upgrades the account.
- Do not link a billing account or request a paid quota increase if your requirement is zero Google Cloud billing. This app does not need a billing account for standard Sheets API use.

## Click-by-click OAuth setup (no billing)

Do this in the [Google Cloud Console](https://console.cloud.google.com/) while signed into the Google account that will own/test the app. Google’s menu labels can vary slightly; the current console calls the consent configuration **Google Auth Platform**. This creates OAuth configuration, not a paid trial.

### 1. Create and select the project

1. Click the project selector at the top of the console.
2. Click **New Project**.
3. Enter a name such as `Crave Ledger Backup`, then click **Create**.
4. When it finishes, click the project selector again and select `Crave Ledger Backup`.
5. **Do not link a billing account, click “Start free trial,” or enable billing.** If a screen insists on billing to enable one of these APIs, stop rather than proceeding.

### 2. Enable only the two required APIs

1. Click the navigation menu **☰** in the top-left.
2. Open **APIs & Services → Library**.
3. Search for **Google Sheets API**, select it, then click **Enable**.
4. Return to **APIs & Services → Library**.
5. Search for **Google Drive API**, select it, then click **Enable**.

The Sheets API creates and updates the spreadsheet. The Drive API is only used to find that same owner’s spreadsheet when they sign in on another device.

### 3. Set up the consent screen / Google Auth Platform

1. Open **Google Auth Platform** from the navigation menu. If you see **Get started**, click it.
2. On **Branding**, enter `Crave Ledger` as the app name. Select your Google account for the support email and enter a developer contact email you can access. Save/continue through the page.
3. On **Audience**, choose **External** for a personal Gmail account. (Choose **Internal** only if this is restricted to members of your own Google Workspace organization.)
4. Keep the app in **Testing** for your own setup. Under **Test users**, click **Add users**, enter the exact Google email you will use in the app, and save.
5. On **Data Access**, click **Add or remove scopes**. Add/confirm `openid`, `https://www.googleapis.com/auth/userinfo.email`, `https://www.googleapis.com/auth/userinfo.profile`, and `https://www.googleapis.com/auth/drive.file`. Save/continue. `drive.file` limits access to files created or specifically opened with this app; do not substitute the broader `drive` scope.

Testing mode is appropriate for your own account; accounts not listed as test users will not be able to authorize it. Publishing for other owners may require Google’s review, depending on the scopes and distribution. Don’t submit for public verification just to test your own account.

### 4. Create the Android OAuth client (needed for the Android app)

First get the SHA-1 fingerprint for the key that signs your **debug** app. Run this in a terminal after Android Studio has generated the debug key:

**macOS / Linux:**

```sh
keytool -list -v -alias androiddebugkey \
  -keystore "$HOME/.android/debug.keystore" \
  -storepass android -keypass android
```

**Windows PowerShell:**

```powershell
keytool -list -v -alias androiddebugkey `
  -keystore "$env:USERPROFILE\.android\debug.keystore" `
  -storepass android -keypass android
```

Copy the value labeled **SHA1** (including the colon-separated pairs). If `keytool` is not found, run it from the JDK `bin` folder or use Android Studio’s Gradle `signingReport` task.

Then in Google Cloud:

1. Open **Google Auth Platform → Clients**.
2. Click **Create client** (or, in the older console, **APIs & Services → Credentials → Create credentials → OAuth client ID**).
3. Choose **Android** as the application type.
4. Name it `Crave Ledger Android debug`.
5. Enter the package name exactly as `com.craveledger.app`.
6. Paste the debug **SHA-1** fingerprint and click **Create**.

The Android app identifies itself by this package name and signing fingerprint; you do not paste an Android client secret into the app. When you later publish a release, repeat this step with the **release / Play App Signing SHA-1** as a separate Android client. Debug and release fingerprints are not interchangeable.

### 5. Optional: create a Web client for the browser preview

Skip this section if you only need the Android app. The Arena browser preview has a separate OAuth client requirement.

1. In **Google Auth Platform → Clients**, click **Create client**.
2. Choose **Web application** and name it `Crave Ledger browser preview`.
3. Under **Authorized JavaScript origins**, click **Add URI**.
4. Copy the origin from the Arena preview address. Enter only the scheme and host, for example `https://4173-YOUR-SANDBOX.e2b.app`—no path, query string, or slash after the host. If you also run the site locally, add `http://localhost:4173` as another origin.
5. Click **Create**, then copy the **Client ID** ending in `.apps.googleusercontent.com`. You do not need the client secret; never place it in the app.
6. Open `android/app/src/main/assets/google-config.js` and set the public client ID:

   ```js
   window.CRAVE_GOOGLE_CONFIG = {
     webClientId: 'PASTE_WEB_CLIENT_ID.apps.googleusercontent.com',
   };
   ```

The Android app uses the Android client from step 4; the Web client is only for browser preview sign-in. If the Arena preview origin changes, add the new exact origin to this Web client.

### 6. Test the connection

1. Build and run the debug Android app from Android Studio (or reload the browser preview after setting the Web client ID).
2. Click **Continue with Google** and choose the same email you added under Test users.
3. Review the consent prompt; it should identify Crave Ledger and request access limited to the app’s Drive files. Approve only if those details match your project.
4. Crave Ledger should create or find a private spreadsheet titled `Crave Ledger backup — <owner email>`. Open **Account & data → Google Sheets backup** to check the sync status.

If you see an API-disabled error, confirm both APIs are enabled in the selected project. If Android reports a developer/configuration error, re-check the exact package name and the SHA-1 for the key that actually signed the installed build. OAuth changes can take several minutes to propagate.

## What is backed up

The spreadsheet has readable tabs for Overview, Settings, Annual Tax, Ingredients, Menu, Recipes, Sales, Fasting Calendar, and Daily Profit, plus a hidden **Backup Snapshot** tab used for exact workspace restore. The snapshot includes the full workspace data, including custom menu photo data. The app rewrites the backup tabs as a batch after edits settle; avoid manually editing those tabs as a source of truth because a later backup replaces them.

Signing in with Google on another device restores the owner’s latest snapshot. Local-password accounts remain device-only unless the Google account email matches and the owner connects it from Account & data. The app does not keep the short-lived Google access token after it closes; the owner signs in again to resume syncing. Export/import JSON remains available as an additional offline backup.
