# SHOPYHAT v2 (Development)
Premium women’s fashion e-commerce storefront + secure Admin & Order Studio.

**Project branch:** develop/shopyhat-v2 (production main remains untouched)

- Customer storefront: [index.html](./index.html)
- Admin login/dashboard: [admin/index.html](./admin/index.html)
- Server order placement: [Supabase Edge Function](./supabase/functions/shopyhat-checkout/index.ts)
- Bengali deployment instructions: [docs/SETUP_BN.md](./docs/SETUP_BN.md)

Hosted previews require connecting this branch to Cloudflare Pages. Do **not** publish or merge before completing the OTP, checkout and Turnstile checks. All public HTML contains only the Supabase publishable key, never service-role secrets.

## Data model
`sh_products`, `sh_variants`, `sh_product_images`, `sh_staff`, `sh_orders`, `sh_order_items`, `sh_payments`, `sh_order_history`, `sh_settings`.

Privacy: RLS blocks anonymous access to private customer/staff/order data. Shop catalog is public only when product status is active.

Current state: backend provisioned with original Sheet data and development source committed. Real hosted end-to-end testing pending.
