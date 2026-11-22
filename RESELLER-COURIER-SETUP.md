# SHOPYHAT Reseller Studio & Courier API – Admin Guide

## Reseller accounts
1. Open `/admin/` → **Resellers** → **Requests**.
2. Open **Create Reseller Login** for a pending applicant. A unique login ID is suggested automatically, such as `sh29b7c0a1`. Edit it if needed; duplicate IDs are rejected by the server.
3. Set their shop URL alias, then click **Create Reseller ID**.
4. Copy the one-time temporary password. Send it **privately** to the reseller. Do not put passwords into public chat messages, screenshots, spreadsheets, or product links.
5. Reseller signs in through `/reseller/`; a first-login password update is required.
6. For a forgotten password: **Accounts** → **Manage Account** → **Reset Password**. Send the newly generated temporary password privately.
7. Existing reseller IDs remain valid; the new unique ID generator applies to new accounts.

## Product catalog & photos
- **Product Pricing** displays the active product catalog, 20 per page. Search by product name, filter **Enabled for Resellers**, and toggle **Enable for Resellers** on each product you want to publish.
- **Save** the per-product wholesale price; it cannot be higher than the public base price.
- Resellers see only published products and their variants; their catalog loads 12 variants per page with search, stock filter and sort.
- Google Drive `/file/d/{id}/view` links are converted to image thumbnail URLs.
- If a Google Drive image remains unavailable, open that file's **Share** dialog, confirm sharing permits customers to view it, and recheck. Restricted or deleted images cannot be shown by the website. Use SHOPYHAT-controlled storage for reliable long-term public product images.
- Product images show a fallback rather than broken image icons if retrieval fails.

## Courier API — Steadfast (opt-in, not automatic)
1. Register / sign in to the [Steadfast merchant portal](https://steadfast.com.bd/) and request API access.
2. Get the API key and Secret key from Steadfast. Keep both private.
3. Open [Supabase Edge Function Secrets](https://supabase.com/dashboard/project/xwfqgmgiunlxzvzoermn/settings/functions) and set:
   - `SHOPYHAT_STEADFAST_API_KEY`
   - `SHOPYHAT_STEADFAST_SECRET_KEY`
4. Open SHOPYHAT **Admin → Resellers → Courier API**. Click **Check Configuration**, then **Test Connection**. Connection test requests the courier wallet balance but does not book parcels.
5. In **Book an Existing Confirmed Order**, choose an eligible SHOPYHAT order, inspect customer and payment details in **Order Management**, click **Book with Steadfast**, and confirm the prompt. A courier consignment and tracking number should be attached to the SHOPYHAT order.
6. If the booking times out or returns an uncertain result, the system marks that attempt **Needs Review** and blocks blind retries. Check the Steadfast merchant portal for the order number before making another attempt.
7. Delivery charges and any provider account fees are independent of SHOPYHAT. This integration does not automatically dispatch, print shipping labels, settle COD, or reconcile returns.

### Security & status
- Courier credentials exist only in Supabase Edge Function Secrets, not in HTML, JavaScript or public tables.
- Only authenticated active Owner/Manager staff can test or book through the courier function. No one can directly insert a courier booking through the public database API.
- Courier bookings are recorded with an order ID and unique provider pairing to prevent duplicate submissions.
- Never treat a courier connection test as proof that a real delivery has occurred.
- Steadfast API endpoint and headers are based on published Steadfast documentation, including [SteadFast API Docs (Postman)](https://documenter.getpostman.com/view/26211192/2sAYJ1mhpk) and the [SteadFast WordPress plugin](https://wordpress.org/plugins/steadfast-api/).

## Release checks
- Verify reseller product images on both desktop and phone.
- Verify a disabled wholesale product does not appear for resellers.
- Verify pricing search/page 2 and reseller catalogue page 2.
- Check a newly created reseller's unique ID, first login password change, password reset, and the original old ID unchanged.
- Configure courier secrets only after obtaining the real credentials; perform a test connection, then one small confirmed test booking with the provider's permission.
- Verify a duplicated booking is blocked and tracking is written back to the SHOPYHAT order.
