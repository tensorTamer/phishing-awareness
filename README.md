# Think Before You Click — Phishing Awareness Website
**CNET-2060 · Module 5 · Assignment 5A (Option A — interactive website)**

An interactive phishing-awareness campaign for non-technical staff. Built with **Bootstrap 5**
(vendored locally in `assets/` — no internet connection required).

## Run it
It's a static site. Any of these work:

- **Simplest:** double-click `index.html` to open it in your browser.
- **Local server (recommended for a clean demo):**
  ```bash
  cd "this folder"
  python3 -m http.server 8080
  # then open http://localhost:8080
  ```

## What's inside
- `index.html` — the page
- `assets/css/app.css` — custom theme on top of Bootstrap
- `assets/js/app.js` — all interactivity (simulator, password lab, MFA, quiz)
- `assets/js/pwlib.js` — password maths (strength estimate, common-password check), shared with the tests
- `assets/js/wordlist.js` — word list for the passphrase generator
- `assets/css/bootstrap.min.css`, `assets/js/bootstrap.bundle.min.js` — vendored libraries

## Sections
1. 6 warning signs (accordion)  2. Spot-the-Phish simulator  3. Password lab (strength + passphrase)
4. MFA comparison  5. Reporting steps (plus where to report)  6. Knowledge quiz
Also: a "phishing isn't only email" row (SMS, voice, QR, AI) and a Sources section.

All example emails, brands, and statistics are illustrative, for educational use.

## Tests
```bash
node tests/pwlib.test.js
```
