# SHOPYHAT v2 — Setup & Go-Live (বাংলা)

## যা ইতিমধ্যে সম্পন্ন
- আলাদা Supabase project: **SHOPYHAT** (ref: xwfqgmgiunlxzvzoermn), $0/month project creation cost confirmed.
- Database: Products, Variants, Product Images, Staff, Orders, Order Items, Payments, History, Settings.
- Existing Personal Google Sheet থেকে **৬ Products, ১৩ Variants, ৬ Images** imported. ৩টি product Active, ৩টি Hidden।
- Secure catalog read policies, role-based write policies, owner protection, restricted payment approval.
- Product image bucket: `shopyhat-products`, max 4 MB per JPG/PNG/WebP photo.
- Server-authoritative checkout (COD / manual bKash / Nagad) with atomic order + item + stock updates.
- Duplicate order prevention by request UUID, basic phone rate limiting (৫টি/ঘণ্টা), mandatory Cloudflare Turnstile for public customer checkout.
- New Admin UI: Email login, Products, Color Variants, Multi-photos, Orders, Payments, Invoice, CSV export, Staff Access.
- GitHub development branch: `develop/shopyhat-v2`. Current production `main` and original Google Sheet remain unchanged.

## GitHub source
https://github.com/Shahin4L/shopyhat/tree/develop/shopyhat-v2

Storefront: `index.html` — previous visual design + new Supabase data + confirmed checkout.
Admin: `admin/index.html` — dashboard, `admin/app.js` — application, `admin/config.js` — PUBLIC Supabase URL and publishable key.
Checkout Edge code: `supabase/functions/shopyhat-checkout/index.ts`.

**Do not place service_role, secret API keys, Gmail credentials, or Supabase database password in GitHub, HTML, or browser JavaScript.**

## ACTION 1 — Deploy with Cloudflare Pages Free
Cloudflare → Workers & Pages → Create → Pages → Connect to Git.
- Git provider: GitHub.
- Repository: `Shahin4L/shopyhat`.
- Create a *preview/staging* Pages project first, e.g. `shopyhat-stage`.
- Production branch for this *staging* site: `develop/shopyhat-v2`.
- Framework: None; Build command: blank; Output directory: `.` (repository root); Root directory: repository root.
- Save and deploy. Visit `https://<your-stage-project>.pages.dev/` and `https://<your-stage-project>.pages.dev/admin/`.
- Don't connect custom production domain or merge into `main` yet.

This is a static Cloudflare Pages project; Supabase handles dynamic checkout/auth/database.

## ACTION 2 — Supabase Auth email sign-in
Supabase Dashboard: https://supabase.com/dashboard/project/xwfqgmgiunlxzvzoermn
- Authentication → URL Configuration → Site URL = staging Pages URL, e.g. `https://shopyhat-stage.pages.dev/admin/`.
- Redirect URLs: include the exact `https://<your-stage-project>.pages.dev/admin/`.
- Authentication → Email Templates → Magic Link: include `{{ .Token }}` so user sees the six-digit OTP. For new accounts, also inspect Confirm Signup template. Alternatively a proper email sign-in link can work, as app handles URL sessions.
- Owner staff row is already allowlisted: `shahin4l.bd@gmail.com`. Use this email for first login.
- Supabase built-in email sending has low rate limits. For real multi-user operations configure a permitted free custom SMTP service; this requires your own sending-account verification. Do not assume default email quota is enough for production.
- After Owner login, Team Access → Add Staff with Role Manager / Operator / Viewer and Active status. Never share Owner OTP.

## ACTION 3 — Free Cloudflare Turnstile (required to activate public checkout)
Cloudflare Dashboard → Turnstile → Add widget for your Cloudflare Pages domain.
- Copy **Site Key** and **Secret Key**.
- Edit `index.html` CONFIG: `turnstileSiteKey: "<SITE_KEY>"`; commit to the development branch.
- Supabase → Edge Functions → Secrets: add `SHOPYHAT_TURNSTILE_SECRET = <SECRET_KEY>`.
- The deployed checkout function verifies the token when this secret is set. A browser request without a valid token will fail.
- Site key is public. Secret key is server-side only. Never commit the secret.

Public customer checkout is intentionally disabled until SHOPYHAT_TURNSTILE_SECRET is configured. Authenticated Owner/Manager/Operator manual COD orders can still be created without Turnstile. A phone rate limit also applies, but is not a substitute for anti-bot verification.

## ACTION 4 — Verify business settings
In `index.html`, CONFIG includes:
- COD + manual bKash/Nagad payment options; **verify the receiving mobile number** yourself.
- Delivery charge: Dhaka ৳70, outside Dhaka ৳130.
- Coupon `WELCOME10`: 10% off on orders of at least ৳1,000.
The backend shipping/coupon settings were initially matched to these values in `public.sh_settings`. If you change website prices/discount rules, update these database settings too. Server amounts are authoritative. Manual bKash/Nagad claims must be verified against actual provider records by Owner/Manager before marking paid.

## ACTION 5 — Verification checklist before launch
1. Website opens and only 3 Active products appear; hidden items do not display.
2. Product #4: Purple and Black swatches change to their real variant-specific photos. More photos per color appear as thumbnail navigation; test desktop/mobile.
3. Owner email OTP delivers and Admin login succeeds; test staff roles. Until email provider/template is configured, real OTP delivery remains unverified.
4. Product add/edit, new colors, multiple image upload, stock adjustments save and refresh.
5. Place one test COD order on staging. Confirm *backend* returns an Order ID, Admin Orders shows it, and Item/Price/Stock match. Don't test payment with real funds.
6. Review Payment visibility and role restrictions, change a dummy order status, print invoice, export CSV.
7. Confirm production website remains unchanged during testing. After all pass, make a backup, merge tested branch into `main`, then switch production Cloudflare deployment.

## Important limitations
- This chat **cannot verify real email delivery or Cloudflare Pages website rendering** until hosting and mail configurations are completed. Public checkout returns HTTP 503 until the free Turnstile secret is configured.
- Product/order data is now in Supabase. Google Sheet remains the previous data source/reference; automatic two-way Sheet synchronization is NOT configured. Use Admin CSV export for reporting to Sheets until sync is built.
- New staging site is not yet published just by uploading code to GitHub. Cloudflare connection/action above is required.
- Rate limiting and Turnstile are defense-in-depth; manual fraud screening is still needed.
- Free services have usage quotas and can pause/throttle. Confirm Free plan at each setup step. Do not upgrade to a paid tier without approval.

## Owner links
- GitHub dev: https://github.com/Shahin4L/shopyhat/tree/develop/shopyhat-v2
- Supabase: https://supabase.com/dashboard/project/xwfqgmgiunlxzvzoermn
- Original Google Sheet: https://docs.google.com/spreadsheets/d/1hMUNUgDUrmGUy92DxR6cdZQB-otm5gdJXokA8byP1ZU/edit

Rollback: Do not touch production `main` until tests pass; revert the Cloudflare branch/domain to previous release if a later launch fails.
