# SHOPYHAT — Inline Reviews, About Us, Contact Map & Manual Archive Review

## Customer product review experience
- Every Product Card shows approved-review count/rating, one clipped snippet, **Write a Review** and **View All** controls.
- Product Details popup shows a maximum of two approved reviews and the same actions.
- **View All** opens a scrollable modal with complete product-specific reviews and optional approved customer photos.
- **Write a Review** opens a compact form from the current product context; product is selected automatically. Submission is moderated and photos remain private until approval.
- Existing Reviews & Support page remains available from the footer for general support.
- Anonymous reviews are not represented as independently purchase-verified.

## Navigation
- Header: Home, Shop, Sarees, **About Us**, Track Order.
- Footer: Policies, Contact, Reviews & Support, About Us, Facebook, Privacy Policy.
- Dedicated premium About Us page contains SHOPYHAT history (Since 2020), product categories, shopping process, support channels and Facebook link. No invented customer ratings or unverified Facebook facts.
- About page supports existing bilingual translation control.

## Contact
Address shown in Contact panel and About:
Dogordiya, Chotto Bariad, Madani Avenue, Badda, Dhaka-1212, Bangladesh.
Embedded Google Maps address search + external Google Maps link. This is an address-search view, not a confirmed doorstep geocoding pin.

## Admin → Business Analytics → Manual Archive Request
- Database and media storage metrics plus 6+ month audit candidates.
- **Generate Archive Review Request** writes a status-tracked request with actual size, date and staff identity.
- If data is below 400 MB threshold or there are no eligible 6+ month audit records, request is marked **Not Eligible**.
- No buttons delete records. A request is not an archive command; it does not invoke the maintenance endpoint.
- All requests are limited to Owner/Manager through database authorization; direct public table writes are blocked.
- Existing Google Sheets workflow is still not activated. Apps Script deployment & secrets are necessary before automatic verified audit archiving. Financial/customer cases & evidence remain excluded from auto-deletion.

## User acceptance checks
1. Open storefront, verify primary navigation has About and not Contact / Policies / Reviews.
2. In catalog, click **Write a review** from a product card; confirm pre-selected product, optional photo, and pending moderation.
3. Open **View All** on a product with approved reviews; verify full text and scroll without expanding original page.
4. Open Product Details; verify preview of up to two reviews.
5. Visit About and switch between Bangla & English.
6. Contact page: verify full written address and Google Maps frame. Confirm location manually before visiting.
7. Admin Business Analytics: generate an Archive Review Request; with ~13MB DB this should be **Not Eligible** and remove no records.
8. Cloudflare Pages must deploy latest GitHub main for live functionality; browser QA and real customer submissions are not claimed verified.
