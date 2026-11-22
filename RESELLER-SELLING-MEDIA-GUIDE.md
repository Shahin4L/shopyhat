# SHOPYHAT Reseller Selling Prices & Product Media

## Reseller workflow (free to use, no additional subscriptions)

1. Sign in at `https://shopyhat.pages.dev/reseller/`.
2. Open **Product Catalog**. Only products enabled in Admin → Resellers → Product Pricing appear.
3. Choose a product variant/color. The card shows:
   - SHOPYHAT **Store Price** (reference)
   - **Wholesale Cost** set by SHOPYHAT Admin
   - **Your Customer Selling Price** (editable)
   - **Estimated Gross Margin** = selling price − wholesale cost, *before* courier charges, discounts, returns and settlement adjustments
4. Enter a new selling price and select **Save Selling Price**. Price must be at least wholesale cost and no more than the allowed upper limit (five times normal product retail, unless wholesale is higher).
5. Select **Copy Link** or **Share Links & Sales → Copy Store Link**. Your customer will see your saved variant price, while normal SHOPYHAT visitors see SHOPYHAT's original price.
6. Customer checkout validates the reseller slug, authorized price, product stock and quantity **on the server**, not through a client-provided order total. If a reseller changes the price while a customer is checking out, the buyer is asked to review the updated total.
7. For a manual fulfillment request, **Create Request** prefills your saved price but you may still adjust the individual request price within the platform limits, subject to customer consent and Admin approval.
8. Select **Use Store Price** to remove your custom price. Only the reseller owning that price can change it; Admin always controls the wholesale cost and which products are available to resell.

## Download product photographs

1. On a product card, select **Download Photos**.
2. A gallery lists the product's approved photos (up to 24 in this version). Select **Download Photo** for any image needed for marketing.
3. Downloads are served by a private reseller-authorized backend, never by exposing a private Supabase key. Only images of active, reseller-enabled products can be downloaded.
4. Google Drive preview links are converted into public image thumbnails when possible. A file that is private, unavailable, or disallowed will display an error. Ask SHOPYHAT Admin to grant appropriate viewing access or upload a new product image.
5. Respect creator permissions, truthful advertising, stock availability, and platform-specific usage rules. Do not redistribute customer information.
6. Downloads are single images, not a packaged ZIP. Large originals or private Google Drive files may not be available through the free image service.

## Owner controls

- **Admin → Resellers → Product Pricing**: publish/unpublish products and set wholesale prices.
- **Admin → Resellers → Accounts**: approve/suspend accounts and reset login password.
- **Admin → Products**: upload product gallery and variant pictures, ideally to reliable public object storage.
- Saving a reseller price does **not** change the public product price or another reseller's price.
- The customer checkout uses a server authoritative price. Promo codes that would push reseller-attributed proceeds below wholesale are rejected rather than silently producing a loss.
- Existing guest checkout, invoices, normal prices, inventory and tracking stay intact.

## Verification

- Use a test approved reseller to set a variant retail price, then open the share link in an incognito browser and verify that price.
- Verify that a direct SHOPYHAT link continues to show the normal price.
- Check a price change during checkout and verify the buyer receives an updated amount warning.
- Confirm a real test order records the correct `sh_order_items.unit_price`, total and pending reseller referral margin.
- Verify disabled reseller products disappear from partner catalog and public referral price lookup.
- Confirm a valid product image downloads and that another user's restricted/personal image cannot be downloaded.
- Private Google Drive images require owner sharing changes; there is no technical bypass of access restrictions.

**Release note:** GitHub automated tests check structure, syntax and known security requirements. They do not substitute for browser tests with valid reseller credentials or image-host permissions.
