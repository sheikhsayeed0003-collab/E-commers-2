# MAISON — Luxury Streetwear

Kith-inspired e-commerce house: storefront, JWT auth, loyalty, Stripe-ready checkout, and admin panel.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Demo accounts

- Customer: `demo@maisonatelier.com` / `Demo123!`
- Admin: `admin@maisonatelier.com` / `Admin123!`

## Notes

- Catalog and sessions persist in memory while the Next.js process is running (MongoDB models are in `src/lib/models.ts` — connect `MONGODB_URI` when you want a real database).
- Stripe: add `STRIPE_SECRET_KEY` to create PaymentIntents. Without keys, checkout completes in demo paid mode. Webhooks live at `/api/stripe/webhook`.
- Google/Apple buttons are wired as demo OAuth until you add real client IDs.
- Cloudinary: store image URLs on products; admin add-product currently uses a placeholder image URL.
