<p align="center"><img src="logo.png" width="220" alt="Burn Bank logo"></p>

# Burn Bank

A personal calorie bank. Food goes in, your body baseline and trust-weighted watch burn go out, and every 7,700 kcal you bank wins a kilo.

**Live:** https://cyberosos.github.io/burn-bank/

## What's in this repo

| File | What it is |
|---|---|
| `index.html` | The whole app |
| `manifest.webmanifest`, `sw.js`, icons | Let you install it on your phone's home screen |
| `worker/worker.js` | The Cloudflare Worker that connects the app to the AI (photo scans, automatic calories) |

## Setup

### 1. Turn on GitHub Pages
Repo **Settings → Pages → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save**. The site goes live at the link above in a minute or two.

### 2. Get an Anthropic API key
1. Go to **console.anthropic.com** and sign in.
2. **Billing:** add a payment method and a small amount of credit (5 USD lasts a long time).
3. **API Keys → Create Key**, name it `burn-bank`, and copy it somewhere safe. You only see it once.

### 3. Create the Cloudflare Worker
1. Go to **dash.cloudflare.com → Workers & Pages → Create → Create Worker**.
2. Name it `burn-bank-ai` → **Deploy**.
3. Click **Edit code**, delete everything, paste the contents of `worker/worker.js`, then **Deploy**.
4. Go to the Worker's **Settings → Variables and Secrets** and add:

| Name | Type | Value |
|---|---|---|
| `ANTHROPIC_API_KEY` | Secret | your key from step 2 |
| `APP_PASSCODE` | Secret | any password you make up |
| `ALLOWED_ORIGINS` | Text | `https://cyberosos.github.io` |

5. Copy the Worker's address, e.g. `https://burn-bank-ai.yourname.workers.dev`.

### 4. Connect the app
Open the live site → **Profile → AI connection** → paste the Worker address and your passcode → **Save & test**. You should see **✓ Connected**.

### 5. Install on your phone
- **Android (Chrome):** ⋮ menu → **Add to Home screen / Install app**
- **iPhone (Safari):** Share → **Add to Home Screen**

## Good to know
- **Cost:** each photo scan is roughly 1–3 US cents and each typed food lookup is a fraction of a cent, billed by Anthropic. You can set a monthly spend limit in the Anthropic console.
- **Your data** is saved in your phone's browser on this website. Clearing the browser's site data erases it.
- **Your key is safe:** it lives only in the Worker, never in the website. The passcode and allowed-website check stop other people from using your Worker.
