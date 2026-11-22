# SHOPYHAT Customer & Reseller Release Checklist

## What has been implemented
- Customer registration: Step 1 name + Bangladesh mobile; Step 2 email + password + confirmation. No SMS OTP.
- Customer login and reset: Supabase email/password and recovery link; customer session separate from staff Admin and reseller.
- Verified email account order history: only orders created under that authenticated account are attached to it, never matched solely by an unverified phone.
- Guest checkout, existing order tracking, complaints and reviews remain available.
- Separate reseller route: `/reseller/` with free request form, username/password login, first-login password change, wholesale/public pricing and available variant stock, share links and fulfillment requests.
- Reseller application, named URL aliases, approval, pricing and settlement oversight in Admin.
- Orders made via `?ref=partner-slug` are attributed to a reseller by the checkout backend only after server-side approval checks.
- New orders from verified logged-in customers are linked by the checkout backend, not by client-controlled account IDs.
- Notifications: in-app inbox and optional browser notifications while the site is open. Full background Web Push is **not** part of this release.

## Before merging PR #12 to main
1. In **Supabase Dashboard → Authentication → Providers**, enable **Email** and require **Confirm Email**; keep **Phone/SMS** disabled.
2. In **Authentication → URL Configuration**, set the Site URL to your live SHOPYHAT origin, and allow:
   - `https://shopyhat.pages.dev/account-confirmed.html`
   - `https://shopyhat.pages.dev/reset-password.html`
   - If you use a verified custom domain, add matching HTTPS versions.
3. Check email delivery using a real inbox. Free Supabase Auth email sending may have restrictive limits and domain policies; no delivery should be assumed without a test.
4. Test customer signup → email confirmation → login → password reset → profile → new order → My Orders.
5. Test guest checkout and existing order tracking with no customer account. Do not attempt to expose old guest orders by unverified mobile.
6. Test review/complaint name/mobile prefill for a signed-in customer, and guest forms when logged out.
7. Open `/reseller/`; submit a **test** application.
8. Manual Admin credential provisioning (no service key in frontend):
   - Open Supabase Dashboard → Authentication → Users → Add User.
   - Set the synthetic login email `<reseller-login-id>@reseller.shopyhat.com`.
   - Choose a strong temporary password and mark the user confirmed.
   - Copy the Auth User UUID.
   - In SHOPYHAT Admin → Resellers → New Reseller Requests, enter the same login ID, the desired shop URL slug and the exact UUID; approve.
   - Share the username/password privately, then have the reseller change the temporary password at first login.
   - For resets, edit their password only in Supabase Authentication Users, then use SHOPYHAT Admin → **Require Password Change**.
   - Never put a password, service role key or private customer details into a public URL or frontend source.
9. Test reseller status Pending/Approved/Suspended, first-login password change, private wholesale price access, share link checkout, fulfillment request and manual settlement.
10. Review shipping, payment collection, return/refund handling, reseller margin and reconciliation rules before paying a reseller.
11. Check mobile Safari/Chrome layouts and the browser console. Run CI and test Cloudflare staging deployment.
12. Publish only after these tests. A passing static build does not prove SMS/email deliverability, login, payments or order fulfillment.

## Important known limitations
- Admin-created reseller Auth users are currently provisioned manually through Supabase Dashboard. There is **no automated, in-app Auth-password creation/reset** because deploying it securely requires privileged backend controls that were not validated.
- In-app notifications are stored, and browser notifications can show with the site open. Web Push with site closed requires service worker + VAPID/delivery infrastructure.
- Reseller shared URLs are branded attribution links, not cloned storefronts or independent domains.
- Referral margins are provisional until delivered, paid and settled in Admin.
