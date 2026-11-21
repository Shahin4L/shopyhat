# SHOPYHAT — Analytics, Reviews and Conditional Google Sheets Archive

## Implemented
- Customer product selector independently fetches active catalog; a failed review query no longer blanks both dropdowns.
- One optional JPG/PNG/WebP review photo, max 4MB, private until the review is approved.
- Customer evidence remains private. Admin moderators obtain signed temporary URLs, and public review images are signed ONLY for Approved reviews.
- Business Analytics in Admin: traffic, daily unique visitors, page views, estimated conversion, order value, paid value, AOV, top products, order statuses, review rating and support cases. Use existing global date filters and CSV export.
- Visitor tracking honors Do Not Track / Global Privacy Control; stores anonymous daily hashes, not IP or names. Visits to the same page from one browser within 20s are deduplicated.
- Archive capacity is measured against a conservative 400MB database threshold (80% of an *illustrative* 500MB planning capacity; verify the actual plan quota). File storage is monitored independently.

## Archive safety policy
1. No archive action before database size is at least 400MB and eligible audit rows are older than six calendar months.
2. An automated archive needs ALL three Supabase secrets and BOTH GitHub Action secrets below. If any are missing, no deletion is possible.
3. Eligible audit log rows are exported to Google Sheets in batches of 40, with SHA-256 of canonical row JSON and Google Sheets readback of ID plus SHA, before exact-ID deletion.
4. Do not delete orders, payments, support cases, customer replies, evidence media or review photos automatically. These records may have relational, legal, refund, and recovery dependencies.
5. Audit history older than six months can be pruned ONLY after successful Google Sheets verification. This does not guarantee immediate Postgres file shrinkage; reclaiming/reusing space depends on PostgreSQL storage behavior.
6. Archive is conditional, not an unbounded monthly purge. Daily lightweight capacity checks do **nothing** below the threshold.
7. Keep the Google Sheet private and restrict to the owner. It may contain staff identifiers.

## Google Sheet
The owner created a private native Google spreadsheet in their connected Google account. Sheet tabs:
`Archive_Audit`, `Archive_Traffic`, `Archive_Orders`, `Archive_Payments`,
`Archive_Cases`, `Archive_Reviews`, `Archive_Run_Log` and `Read Me`.

Currently the live automatic archive sender implements **Archive_Audit only**. Other tabs are reserved for future verified backup adapters; they are not connected to automatic export or deletion.

## One-time activation steps
1. From Google Apps Script (script.google.com), create a script owned by the same Google account as the archive Sheet.
2. Paste `integrations/google-apps-script/ArchiveReceiver.gs` as `Code.gs`.
3. In Apps Script → Project Settings → Script Properties set:
   - `SHOPYHAT_SHEET_ID` = the private Google Sheet's verified spreadsheet ID.
   - `SHOPYHAT_ARCHIVE_SECRET` = random long shared secret (at least 20 characters).
4. Deploy Apps Script as a Web App, executing as the sheet owner, with access permitted to Anyone (server-to-server POST is authenticated using the secret). Do not disclose the URL and secret publicly.
5. In Supabase Edge Function secrets set:
   - `SHOPYHAT_ARCHIVE_WEBAPP_URL` = deployed Apps Script Web App URL.
   - `SHOPYHAT_ARCHIVE_SECRET` = the exact same strong shared secret.
   - `SHOPYHAT_ARCHIVE_CRON_TOKEN` = a **different** random long token.
6. In GitHub repository → Settings → Secrets and variables → Actions set:
   - `SHOPYHAT_ARCHIVE_CHECK_URL` = `https://xwfqgmgiunlxzvzoermn.supabase.co/functions/v1/shopyhat-archive-maintenance`
   - `SHOPYHAT_ARCHIVE_CRON_TOKEN` = the same cron token from Supabase.
7. Workflow `.github/workflows/shopyhat-archive-check.yml` checks once per day at 21:17 UTC (03:17 Asia/Dhaka the next morning). Without secrets the workflow exits without changing the database.
8. Make a manual test using GitHub Actions → SHOPYHAT conditional archive capacity check → Run workflow. The current low-size database should return `no_archive_needed`, not delete anything.
9. Test a **fake workbook/sandbox data** readback before any actual archive, and verify audit logs are recoverable. Do not force the production size threshold or remove months of data for testing.

## Limits
- The admin initial orders/reviews case lists use a paginated or bounded fetch and are not intended to manage millions of records. Implement server-side reporting/pagination before high volume.
- The dashboard counts daily unique visitors summed across calendar days; these are *not unique people for the whole date range*. Client-side tracking may be blocked by privacy settings, ad blockers, or network issues.
- No email/SMS notifications or automatic backup-to-Google-Sheets is active until the steps above have been completed.
- Do not copy old confidential customer data into a publicly shared spreadsheet.

## Operating QA checklist
- Product dropdown populates when Reviews endpoint fails; verify product name and UUID from active catalog.
- Review photo absent/present; no photo mandatory; verify Pending photos remain private and Approved photos are accessible only via short-lived signed URLs.
- Check Report a Problem product dropdown, even if no approved reviews exist.
- Submit one legitimate test review and check Admin approval and photo.
- Review Analytics date presets and order totals; separate paid revenue from merely placed orders.
- Check daily visitors after deploying production; none of these numbers are fabricated.
- Confirm archive storage is low, auto-archive remains inactive until configured, and no transactions are deleted.
