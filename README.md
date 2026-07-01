# Guardian Mortgages — Borna Alavi Parsi

Premium static landing page for Borna Alavi Parsi (Guardian Mortgages) promoting the AYME (All Your Money Earnings) mortgage strategy.

**Live demo (after push):** https://borna-cloud.github.io/landing-page (enable GitHub Pages)

## Current Features
- Modern split hero (g-hero-split) with cash-flow focus and $310K+ savings headline
- AYME pain section with 3 stat cards (The Hidden Trap $400B+, The Annual Penalty $8,000, The Lifetime Loss $310K) + premium image
- How It Works with 3 key insights
- Animated testimonials marquee + trust badges
- Interactive payoff chart (Chart.js) comparing traditional vs AYME
- Mid-page CTA, About section, full FAQ, lead capture form
- Fully responsive, accessibility polish, premium glassmorphism cards, motion hovers

## What's included
- `index.html` — complete single-page site
- `style.css` — design tokens, glassmorphism, responsive, editorial polish
- `main.js` — mobile menu, form handling, FAQ, count-up animations, scroll behaviors, hiw dots
- `public/` — hero-home.jpg, ayme-premium.jpg (and other variants)
- `scripts/` — simple local static server (port 5174 default)
- `package.json`
- `.gitignore` (excludes design captures/pdfs)

## Run locally (no build needed)
```powershell
cd "OneDrive\Documents\gooz mooz landing"
# Option 1: direct
start index.html

# Option 2: local server
npm start
# then open http://localhost:5174 (or 3000)
```

## Deploy to GitHub Pages
1. Push this folder to https://github.com/Borna-cloud/landing-page
2. In repo Settings → Pages → Source: Deploy from a branch → main / (root)
3. Site will be live at https://borna-cloud.github.io/landing-page

## Notes
- Chart.js from CDN
- Contact form → Formspree (replace action URL with your own if needed)
- Booking links → Guardian Mortgages Zoho
- Full FSRA / licensing disclosures in footer
- Images optimized (JPG where possible)

© 2026 Borna Alavi Parsi / Guardian Mortgages
