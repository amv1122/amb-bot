# AMV WP BOT

A WhatsApp bot with **pairing code login** (no QR code needed) and an **AI image generator** command.

---

## 📁 Project Structure

```
amv-wp-bot/
├── index.js              # Main bot file (connects to WhatsApp, pairing code)
├── commands/
│   ├── handler.js        # Routes commands (!menu, !ping, !img)
│   └── imagegen.js       # AI image generation (free API)
├── package.json
├── .env                  # Your settings (phone number, bot name, prefix)
└── .gitignore
```

---

## ⚙️ Step 1 — Configure

Open `.env` and set your details:

```
PHONE_NUMBER=94712345678     <-- your WhatsApp number, country code, NO plus sign
BOT_NAME=AMV WP BOT
PREFIX=!
OWNER_NUMBER=94712345678
```

---

## 💻 Step 2 — Run Locally (test first)

```bash
npm install
npm start
```

You'll see a **pairing code** printed in the terminal, like:

```
Your pairing code: ABCD-1234
```

On your phone:
1. Open **WhatsApp**
2. Go to **Settings → Linked Devices**
3. Tap **Link a Device**
4. Tap **"Link with phone number instead"**
5. Enter the code shown in the terminal

Once linked, the bot will print `✅ AMV WP BOT is now connected and online!`

Test it by messaging yourself or any chat the bot is in:
```
!menu
!ping
!img a futuristic city at night
```

A `session/` folder will be created automatically — this stores your login so you don't need to pair again on restart. **Never share this folder**, it gives full access to your WhatsApp account.

---

## 🚀 Step 3 — Deploy to a FREE VPS

Below are legitimate free/low-cost options that work well for always-on Node.js bots like this one.

### Option A: Render.com (Free Background Worker) — Easiest
1. Push this bot folder to a **GitHub repo** (private repo recommended).
2. Go to https://render.com → Sign up (free).
3. Click **New → Background Worker**.
4. Connect your GitHub repo.
5. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables under **Environment** tab (copy from your `.env`).
7. Deploy. Check the **Logs** tab — your pairing code will appear there. Enter it in WhatsApp within 60 seconds (it's time-limited).

> ⚠️ Render's free tier can spin down after inactivity. For a bot needing 24/7 uptime, consider Option B or C.

### Option B: Oracle Cloud Free Tier (Best for 24/7, truly free forever)
Oracle gives a genuinely free VM (up to 4 ARM CPUs / 24GB RAM) that never expires.

1. Sign up at https://www.oracle.com/cloud/free/
2. Create a **VM Instance** (choose the "Always Free" Ampere A1 shape, Ubuntu 22.04).
3. Connect via SSH:
   ```bash
   ssh ubuntu@<your-server-ip>
   ```
4. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   ```
5. Upload your bot (via `git clone` from your repo, or `scp` from your computer):
   ```bash
   git clone <your-repo-url> amv-wp-bot
   cd amv-wp-bot
   npm install
   ```
6. Install PM2 to keep it running forever, even after reboot:
   ```bash
   sudo npm install -g pm2
   pm2 start index.js --name amv-wp-bot
   pm2 save
   pm2 startup
   ```
   (run the command `pm2 startup` prints, then `pm2 save` again)
7. View the pairing code:
   ```bash
   pm2 logs amv-wp-bot
   ```

### Option C: Railway.app (Free trial credits)
1. Go to https://railway.app → Sign up.
2. **New Project → Deploy from GitHub repo**.
3. Add your `.env` variables under **Variables**.
4. Deploy → check **Deploy Logs** for the pairing code.

### Option D: Termux (Run on your own Android phone, 100% free, no VPS needed)
If you just want it running without any VPS:
1. Install **Termux** from F-Droid.
2. ```bash
   pkg update && pkg install nodejs git -y
   git clone <your-repo-url> amv-wp-bot
   cd amv-wp-bot
   npm install
   npm start
   ```
3. Use `termux-wake-lock` and keep the app open (or use `tmux`) to prevent Android from killing it.

---

## 🛠 Adding More Commands

Open `commands/handler.js` and add a new `case` inside the `switch`:

```js
case 'hello': {
  await sock.sendMessage(from, { text: 'Hello there!' }, { quoted: msg });
  break;
}
```

---

## ⚠️ Important Notes

- This bot uses **Baileys**, an open-source library that connects to WhatsApp's **multi-device web API** the same way WhatsApp Web does — it is not an official WhatsApp product. Automated/bot accounts can be banned by WhatsApp at their discretion, so use a secondary number, not your primary one, and avoid spamming or mass-messaging.
- The image generation uses **Pollinations AI**, a free public image API — no key required, but keep prompts reasonable as it's a shared public service.
- Keep your `session/` folder and `.env` private — anyone with the session folder can control your WhatsApp account.
