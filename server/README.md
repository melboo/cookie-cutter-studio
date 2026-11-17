# Redraw server

When someone uploads a picture, the app sends it here. This small server asks Google's Gemini
image model (`gemini-3.1-flash-image`) to redraw it as a cookie-cutter-friendly drawing: one bold
silhouette, a few thick connected lines, flat colours, no shading or labels. The app then traces
that drawing.

The Gemini API key is stored here as a secret. It is never in the app or in this repository.

## Set it up (once, about 10 minutes)

You need a free Cloudflare account and a Gemini API key.

1. **Gemini key.** In Google AI Studio (aistudio.google.com) create an API key. Image output is a
   paid feature, so the project needs billing turned on. Set a monthly budget or spending cap in
   Google Cloud billing so a mistake can never cost much.
2. **Install Wrangler** (Cloudflare's command-line tool), from this `server` folder:
   ```
   npm install -g wrangler
   wrangler login
   ```
3. **Store the key as a secret:**
   ```
   wrangler secret put GEMINI_API_KEY
   ```
   Paste the key when asked.
4. **Deploy:**
   ```
   wrangler deploy
   ```
   Wrangler prints the server address, for example
   `https://cut-it-redraw.<your-subdomain>.workers.dev`.
5. **Tell the app.** Put that address in `src/config.js` as `REDRAW_URL`, rebuild (`python3 build.py`)
   and push.

## Safety

- Only the pages listed in `ALLOWED_ORIGINS` (wrangler.toml) can use the server from a browser.
- Each visitor can send at most 6 pictures a minute.
- Pictures are sent to Google to be redrawn; nothing is stored on this server.
- A browser check can be faked by a determined script, so the spending cap in step 1 is the real
  protection.

## Cost

Each redraw is one Gemini image request at 1K size. Google bills per output image; check the
current price on the Gemini API pricing page.
