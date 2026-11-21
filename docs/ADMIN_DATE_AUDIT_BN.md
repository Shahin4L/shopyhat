# SHOPYHAT Admin — Date Filters & Change Audit

Updated: 22 November 2026

## Included
- Global From/To dates, Today / Last 7 Days / Last 30 Days / All Time and Created/Updated Date selectors.
- Product Catalog, Orders, Payment Review and Team Access tables show **Updated By / Updated At** metadata.
- Orders CSV respects the selected date range.
- Owner and Manager have an Activity Log tab with event filters, actor, action, timestamp, changed fields, details and CSV export.
- Existing Order Details history also displays actor and time.
- All timestamps are rendered in **Asia/Dhaka** time, and the date filter uses Bangladesh-local dates.

## Server-side source of truth
Supabase project: `xwfqgmgiunlxzvzoermn`.
A protected `public.sh_audit_log` table and database triggers were created by the Supabase migration `shopyhat_admin_audit_date_range_20261122`; a follow-up migration `shopyhat_stamp_audit_role_permission_fix` corrected stamping permissions. The log is append-only through the browser; no normal user has INSERT or UPDATE permissions.
Audit covers `sh_products`, `sh_variants`, `sh_product_images`, `sh_orders`, `sh_payments`, and `sh_staff` (INSERT / UPDATE / DELETE), storing the authenticated actor's email and role when available, action date, record ID/label, and relevant changed fields.

**Privacy:** Customer addresses, phones, internal notes, transaction credentials, and payment PIN/OTP are not copied into audit diffs. The public catalog exposes a generic `updated_by` label (`staff` or `system`), never an email. Owner/Manager Admin sessions resolve the actual identity from the protected audit table.

## Limitations and operational instructions
1. Audit records start **after the database migration**, not retroactively.
2. Activity Log shows the **latest 1,000 recorded events**. Check date filters before exporting; records beyond that initial load are not shown yet.
3. Changes performed by backend jobs without an authenticated staff JWT appear as `system`; guest checkout is system-generated.
4. For staff access changes, only Owner may edit. For payments, verify the transaction against the provider first before choosing Paid.
5. Do not interpret an empty Activity Log as proof that no changes occurred before the feature was activated.
6. Browser syntax + RLS tests passed. Live Cloudflare interaction and deploy status need verification after GitHub production merge.

## Smoke test
1. Sign in as Owner; open Activity Log.
2. Set Last 7 Days and then Custom Range; compare Products and Orders results.
3. Edit an existing product field and save.
4. Refresh the Activity Log — should show the specific user, UPDATE action, changed field, and timestamp.
5. Test a product-image or variant edit, and confirm it appears in Activity Log.
6. Export filtered Orders and Activity Log CSV; verify displayed dates in Bangladesh time.
7. Confirm a Viewer has no Activity Log access.

The test used a database transaction followed by ROLLBACK; test changes were not saved.
