# SHOPYHAT — Approved Phase 0–4 Delivery and Rollback Record

Date: 2026-11-22. Scope: improvements approved by the owner, **excluding changes to customer email confirmation and adding/requiring `phone_confirmed_at` or SMS OTP**. Existing signup/password reset stays intact.

## Implemented in this release

### Phase 0 — Order and financial correctness
- Admin: removes `Unpaid - COD` from paid-revenue totals. Payment is only counted when status is explicitly verified/received.
- Admin: owner/manager can confirm *Collected - COD* only for a Delivered COD order. Requires explicit human confirmation; no courier collection is inferred.
- Backend: requires owner/manager role for payment status change; disallows marking COD received before delivery.
- Backend: unshipped cancellations atomically restore available variant stock and reject only unsettled reseller referrals. Shipped/delivered/returned orders cannot be cancelled in this route. A verified payment must be refunded/reconciled first. Cancellation is audited.
- Backend: referral payouts cannot transition to Settled before order delivery and verified payment; manual fulfillment must be fulfilled before settlement.
- Secure server-backed order tracking: order ID + matching mobile number, HMAC fingerprint rate limiting, no direct anonymous access to database tracking function. Customer can track from another device.
- Checkout uses an existing authenticated customer's session for their new order, without introducing any email/SMS confirmation rule or `phone_confirmed_at` check.

### Phase 1 — Customer UX
- Signed-in customer's details prefill the existing checkout, issue report and review form. Guest checkout and guest reports remain possible.
- Existing cinematic design and product behavior retained.

### Phase 2 — Admin and reseller operations
- Admin ordinary data tables and reseller account/fulfillment/referral lists use paginated fetching instead of silently stopping after 100 or 1,000 entries.
- Explicit limits still exist (30k Admin, 10k reseller) and raise an error rather than silently truncating data. Future server-side reporting should handle larger datasets.
- Existing pricing, reseller publication and login controls unchanged.

### Phase 3 — SEO
- Canonical, Open Graph site URL, Twitter preview metadata, robots.txt and a baseline sitemap.xml.
- Product-specific indexable HTML URLs and full social preview images remain a separate larger SEO initiative.

### Phase 4 — Performance and QA
- Catalog variants and image rows are indexed in maps rather than rescanned per product.
- Six advisory-recommended covering foreign-key indexes added.
- Static regression checks validate critical financial/auth/tracking/source paths and are run by GitHub Actions.
- Existing syntax, build and static assertions remain in CI.

## Explicitly NOT claimed as completed
- Live E2E purchases/payment reconciliation/returns: the production database had zero recorded orders during implementation.
- Real courier booking/label/tracking adapters for any third-party provider; provider API documentation and credentials are required.
- Reliable migration of inaccessible Google Drive-hosted product images: original owner must supply downloadable originals or make the files accessible.
- Actual Lighthouse, WCAG 2.2 AA, keyboard, Safari and mobile device test evidence; must use a browser automation or human test environment.
- Dedicated product detail pages for SEO and dynamic sitemaps.
- Full return/refund and reseller-settlement reversal ledger; return inspection and actual payment refund evidence must inform rules.
- Production-level load testing, observability, and backup restore exercise.

## Safe rollout and rollback
1. Verify current DB schema and function versions. Production schema was changed before merging frontend, with only additive indexes/functions and selected trigger guards.
2. Merge the frontend only after CI passes. Cloudflare Pages must complete its build successfully.
3. Test with disposable controlled orders only after confirming the merchant is ready for test checkout, to avoid misleading real customer notifications, stock and financial reporting.
4. If frontend fails: revert the merge commit and redeploy the last known good Cloudflare Pages build.
5. If a DB guard blocks a legitimate business process: **do not delete triggers blindly**. Review the affected order/payment/referral history, then deploy a targeted forward migration.
6. If tracking must be disabled: roll the frontend back first, then disable the Edge Function only after confirming it is no longer called. Any database role restriction should remain.
7. Before any non-additive rollback, take a verified database backup and record affected rows. Stock and settled referral status must never be restored from an outdated snapshot without reconciliation.

## Acceptance criteria and tests still needed
- Customer register/login, guest and signed-in checkout, order history, real cross-device tracking.
- Duplicate checkout request ID, simultaneous stock contention, out-of-stock variant rejection and promo expiry.
- COD delivered -> authorized collection -> revenue; COD unpaid must not appear as paid.
- Unshipped cancel -> restore stock exactly once; shipped cancel -> guarded; paid cancel -> refund first.
- Reseller share link -> customized price -> order -> gross margin -> verified payout.
- Customer complaint/review authenticated prefill and guest path; all photo uploads.
- Admin filters, exports, mobile navigation, storefront preview, image fallbacks, authorized/unauthorized roles.
- Mobile accessibility/visual regression, browser LCP/INP/CLS with production assets and actual CDN responses.
