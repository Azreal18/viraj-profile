# Viraj Hurbada — Profile Site

A simple, single-page personal profile site. Built with plain HTML/CSS/JS —
no framework, no build step — so it can be deployed directly on GitHub Pages.

## 1. Add your photos and videos

Drop your real files into `assets/images/` and `assets/videos/` using these
exact names (or edit the `src=` paths in `index.html` to match whatever
names you'd rather use):

```
assets/images/
  hero.jpg          → hero portrait
  moment-1.jpg       through moment-6.jpg  → "A Few Moments" grid
                       (moment-1 and moment-2 also double as video poster frames)
  siblings-1.jpg     → main family photo
  siblings-2.jpg     → second family photo

assets/videos/
  cycling-featured.mp4  → the large featured clip
  cycling-2.mp4          → smaller clip
  cycling-3.mp4          → smaller clip
```

Until you add real files, the browser will just show broken image/video
icons in those spots — that's expected and harmless.

## 2. Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `profile`).
2. Upload everything in this folder, keeping the same structure.
3. Repo Settings → Pages → Source: deploy from the `main` branch, `/root`.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## 3. Visitor logging (optional)

`script.js` includes a small visitor logger. Since GitHub Pages only hosts
static files, it can't run server-side code itself — so the logger has two
parts:

- **In the browser** (already written, in `script.js`): on page load, it
  asks a public "what's my IP" API for the visitor's IP address and rough
  location, then sends that to a small backend.
- **The backend**: a free Google Apps Script "Web App" that appends each
  visit as a row in a Google Sheet. Code is in `google-apps-script/Code.gs`.

To turn it on:

1. Create a new Google Sheet.
2. Extensions → Apps Script, delete the placeholder code, paste in
   `google-apps-script/Code.gs`.
3. Deploy → New deployment → Web app → Execute as **Me** → Who has access
   **Anyone** → Deploy. Authorise it when Google asks.
4. Copy the Web App URL it gives you.
5. In `script.js`, replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
   with that URL.

From then on, every visit lands as a new row (timestamp, IP, city, region,
country, page, referrer, browser) in a "VisitorLog" tab in that Sheet —
that's your visit count and rough visitor location, no extra dashboard
needed.

A couple of honest caveats, since this matters for something you're
sharing with families and not just yourself:

- IP-based location is approximate (usually city-level at best, sometimes
  off), and works off the visitor's ISP, not their exact address.
- An IP address is personal data under most privacy rules, including
  India's DPDP Act. For a private, personal link shared one-to-one this is
  low-risk, but it's worth knowing you're collecting it — you don't need
  a formal privacy policy for a page like this, but don't repurpose the
  data beyond "did people see this."
- If you'd rather skip all this, a plain visit *counter* (no IP, no
  location) via a free service like GoatCounter or Cloudflare Web
  Analytics is a one-line `<script>` tag alternative — say the word if
  you'd like that swapped in instead.

## 4. Files

```
index.html                    the whole site, one page
style.css                     all styling
script.js                     nav behaviour, scroll animations, visitor logger
google-apps-script/Code.gs    backend for visitor logging (see above)
assets/images/                your photos (add these yourself)
assets/videos/                your cycling clips (add these yourself)
```
