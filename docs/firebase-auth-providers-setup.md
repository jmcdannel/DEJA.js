# 🔐 Firebase Auth Providers Setup Guide

This guide walks through enabling each OAuth provider in the Firebase Console and configuring the required developer credentials.

## Prerequisites

- Firebase project created with `VITE_FIREBASE_*` environment variables configured
- Firebase Console access: https://console.firebase.google.com
- Your project's auth callback URL: `https://<PROJECT_ID>.firebaseapp.com/__/auth/handler`

> 💡 Replace `<PROJECT_ID>` with your Firebase project ID (e.g., `deja-js`) throughout this guide.

---

## 1. Google

**Difficulty:** ⭐ Easiest — no external developer portal needed.

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Click **Google** → **Enable**
3. Set **Project support email** (required — pick your email)
4. Click **Save**

That's it. Google auth is handled natively by Firebase.

---

## 2. GitHub

**Difficulty:** ⭐⭐ Easy — requires a GitHub OAuth App.

### Create GitHub OAuth App

1. Go to https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**
2. Fill in:
   - **Application name:** `DEJA.js` (or your preferred name)
   - **Homepage URL:** `https://dejajs.com` (or your app's URL)
   - **Authorization callback URL:** `https://<PROJECT_ID>.firebaseapp.com/__/auth/handler`
3. Click **Register application**
4. Copy the **Client ID**
5. Click **Generate a new client secret** → copy the **Client Secret**

### Enable in Firebase

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Click **GitHub** → **Enable**
3. Paste the **Client ID** and **Client Secret** from GitHub
4. Click **Save**

---

## 3. Facebook

**Difficulty:** ⭐⭐⭐ Moderate — requires a Facebook App with review.

### Create Facebook App

1. Go to https://developers.facebook.com → **My Apps** → **Create App**
2. Select **Consumer** (or **None** if prompted) → **Next**
3. Fill in app name: `DEJA.js` → **Create App**
4. In the app dashboard, click **Add Product** → find **Facebook Login** → **Set Up**
5. Choose **Web** → enter your site URL → **Save**
6. Go to **Facebook Login** → **Settings** (left sidebar):
   - Add to **Valid OAuth Redirect URIs:** `https://<PROJECT_ID>.firebaseapp.com/__/auth/handler`
   - Click **Save Changes**
7. Go to **Settings** → **Basic** (left sidebar):
   - Copy **App ID** and **App Secret**

### Enable in Firebase

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Click **Facebook** → **Enable**
3. Paste the **App ID** and **App Secret** from Facebook
4. Click **Save**

### ⚠️ Note on Facebook App Review

- In **development mode**, only app admins/testers can log in
- To allow all users, submit your app for **App Review** (requires privacy policy URL, data deletion callback, etc.)
- For testing, add test users at **Roles** → **Test Users** in the Facebook developer dashboard

---

## 4. Apple

**Difficulty:** ⭐⭐⭐⭐ Requires Apple Developer account ($99/year).

### Prerequisites

- **Apple Developer Program** membership: https://developer.apple.com/programs/
- Enrolled under the **same Team ID** you want to use

### Create Services ID

1. Go to https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Click ➕ → select **Services IDs** → **Continue**
3. Fill in:
   - **Description:** `DEJA.js Sign In`
   - **Identifier:** `com.dejajs.signin` (reverse-domain style, must be unique)
4. Click **Continue** → **Register**
5. Click on the newly created Services ID → check **Sign In with Apple** → **Configure**
6. In the configuration:
   - **Primary App ID:** select your app's App ID (create one if needed)
   - **Domains and Subdomains:** `<PROJECT_ID>.firebaseapp.com`
   - **Return URLs:** `https://<PROJECT_ID>.firebaseapp.com/__/auth/handler`
7. Click **Next** → **Done** → **Continue** → **Save**

### Create Sign-In Key

1. Go to https://developer.apple.com/account/resources/authkeys/list
2. Click ➕ → name it `DEJA.js Sign In Key` → check **Sign In with Apple** → **Configure**
3. Select your **Primary App ID** → **Save**
4. Click **Continue** → **Register** → **Download** the `.p8` key file
5. Note the **Key ID** shown on the page
6. Note your **Team ID** from the top-right of the developer portal (or Membership page)

### Enable in Firebase

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Click **Apple** → **Enable**
3. Fill in:
   - **Services ID:** `com.dejajs.signin` (the identifier you created)
   - **Apple Team ID:** your Team ID
   - **Key ID:** from the key you created
   - **Private Key:** paste the contents of the `.p8` file
4. Click **Save**

### ⚠️ Apple-specific notes

- Apple Sign In **requires HTTPS** — it will NOT work on `http://localhost`
- Apple may **hide the user's real email** (relay via `privaterelay.appleid.com`)
- Apple only sends the user's name on the **first sign-in** — if you miss it, the user must revoke and re-authorize

---

## 5. Microsoft

**Difficulty:** ⭐⭐⭐ Moderate — requires Azure AD App Registration.

### Create Azure AD App Registration

1. Go to https://portal.azure.com → **Microsoft Entra ID** → **App registrations** → **New registration**
2. Fill in:
   - **Name:** `DEJA.js`
   - **Supported account types:** Choose based on your needs:
     - **Single tenant** — only users in your Azure AD org
     - **Multitenant** — any Azure AD org
     - **Multitenant + personal** — Azure AD + personal Microsoft accounts (Outlook, Xbox, etc.) ← **recommended for consumer apps**
   - **Redirect URI:** Select **Web** → `https://<PROJECT_ID>.firebaseapp.com/__/auth/handler`
3. Click **Register**
4. Copy the **Application (client) ID** from the overview page

### Create Client Secret

1. In the app registration → **Certificates & secrets** → **New client secret**
2. Add description: `Firebase Auth` → choose expiry (recommended: 24 months)
3. Click **Add** → copy the **Value** immediately (it won't be shown again)

### Enable in Firebase

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Click **Microsoft** → **Enable**
3. Paste the **Application (client) ID** and **Client Secret**
4. Click **Save**

### ⚠️ Microsoft-specific notes

- Client secrets **expire** — set a calendar reminder to rotate before expiry
- If you chose single-tenant, only users in your specific Azure AD can sign in

---

## 6. Authorized Domains

**Critical step** — Firebase will reject OAuth redirects from unauthorized domains.

1. Go to **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. Ensure these domains are listed:
   - `localhost` (for development)
   - `<PROJECT_ID>.firebaseapp.com` (default, usually pre-added)
   - `<PROJECT_ID>.web.app` (default, usually pre-added)
   - Your production domains (e.g., `dejajs.com`, `cloud.dejajs.com`, `throttle.dejajs.com`)
   - Your staging domains (e.g., `staging-cloud.dejajs.com`, `staging-throttle.dejajs.com`)
   - Any Vercel preview domains (e.g., `*.vercel.app`)

---

## 7. Testing Checklist

After configuring each provider, verify it works end-to-end:

- [ ] **Google** — Sign in → verify redirect to home → check user profile in Firebase Console
- [ ] **GitHub** — Sign in → verify redirect to home → check user profile
- [ ] **Facebook** — Sign in (must be test user if app is in dev mode) → verify redirect
- [ ] **Apple** — Sign in (requires HTTPS) → verify redirect → note: email may be hidden
- [ ] **Microsoft** — Sign in → verify redirect → check user profile
- [ ] **Cross-provider** — Sign in with Google, sign out, then try GitHub with same email → verify account linking flow
- [ ] **Mobile Safari** — Test on iOS → verify redirect fallback works (popups blocked on iOS)

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `auth/operation-not-allowed` | Provider not enabled in Firebase Console | Enable the provider in Authentication → Sign-in method |
| `auth/unauthorized-domain` | Domain not in authorized list | Add domain to Authentication → Settings → Authorized domains |
| `auth/popup-blocked` | Browser blocked the popup | The app automatically falls back to redirect flow |
| `auth/account-exists-with-different-credential` | Same email, different provider | The app shows an account linking dialog |
| `auth/invalid-api-key` | Wrong Firebase API key | Check `VITE_FIREBASE_API_KEY` in `.env` |
| Redirect loops on callback | Wrong callback URL in provider config | Ensure callback URL is exactly `https://<PROJECT_ID>.firebaseapp.com/__/auth/handler` |
