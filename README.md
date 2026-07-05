# FreeZoneHub — Field Pilot

A lean, single-app version of FreeZoneHub built to get a **live link fast**,
so you can test the core mechanism with real companies in Zona Libre de
Colón: company creates a free showroom → gets a shareable link + QR →
sends it to buyers instead of a PDF.

This is deliberately smaller than the full platform (`freezonehub/`
folder) — no chat, no agenda, no multi-buyer auth. Just the one loop that
matters for the pilot: **create showroom → add products → share the link**.

## What's real here

- Company onboarding creates a unique `slug` (the shareable link) and a
  private `ownerToken` (how you get back in to edit — no email/password
  needed for the pilot)
- Public showroom page at `yourdomain.com/company-slug`
- QR code generated automatically for that link
- Products with MOQ, size assortment/packing label, price or "ask for
  quote", color/texture variants, and the Exclusive flag
- WhatsApp button using the company's real number
- PUBLIC vs PRIVATE visibility — PRIVATE 404s for anyone without the owner link

## Deploy this today (15 minutes, no local setup needed)

1. **Get a free Postgres database** — go to [neon.tech](https://neon.tech),
   sign up, create a project, and copy the connection string it gives you
   (it looks like `postgresql://...`).

2. **Push this folder to GitHub** — create a new repo and upload the
   `freezonehub-pilot` folder to it (GitHub's "upload files" button works
   fine, no git command line needed).

3. **Deploy on Vercel** — go to [vercel.com](https://vercel.com), sign up
   with GitHub, click "New Project", pick the repo you just created.
   - Under "Environment Variables", add `DATABASE_URL` with the value from
     step 1.
   - Click Deploy.

4. **Run the first migration** — after the first deploy, go to your
   project's Vercel dashboard → Settings → check the build log, or run
   locally once:
   ```bash
   npx prisma migrate deploy
   ```
   (You'll need Node installed locally just for this one command, pointed
   at the same `DATABASE_URL`.)

5. Vercel gives you a live URL like `freezonehub-pilot.vercel.app`. That's
   what you open on your phone when you visit a company.

## Using it in the field

1. Open `/onboarding` on your phone or laptop while sitting with the company
2. Fill in their name, category, WhatsApp number — takes under a minute
3. It creates their showroom and takes you straight to it
4. **Bookmark that exact URL right there** — it has the owner token in it,
   it's the only way back in to add products (there's no login screen in
   the pilot)
5. Add a few real products together (this is also useful — you see live
   which fields are confusing or missing)
6. Show them the QR code at the bottom of their showroom — that's what
   they can put on their counter or send to WhatsApp instead of the PDF

## What this pilot intentionally leaves out

Chat, Agenda, IA, Mapa, multi-zona, planes de pago — todo eso vive en el
backend completo (`../freezonehub/`). Este pilot existe solo para probar
si el mecanismo central (link reemplaza al PDF) realmente genera que la
empresa lo comparta y que un comprador real lo use. Esa es la pregunta que
más importa validar antes de construir el resto.
