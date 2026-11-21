# SHOPYHAT — Category, Subcategory, Product & Brand Partners

## Purpose
The existing single category text field is retained for compatibility. Products now also support nullable relational `category_id`, `subcategory_id`, and `brand_partner_id`. Historical products, order IDs, variants, payments and product images remain untouched.

## Standard hierarchy
Main Category → Subcategory → Product → Color/Size Variant

Examples prepared as **inactive drafts**:
- Women's Collection → Saree, Three-Piece, Hijab
- Men's Collection → Shirts, Panjabi, Trousers
- Accessories → Bags, Jewellery

Draft categories and subcategories are deliberately not public. An active subcategory can belong to an active main category only; the database validates parent-child and product assignments.

## Admin workflow
1. Sign in as Owner or Manager.
2. **Categories & Brands → + Main Category**. Enter English name, optional Bengali name, unique slug, order and optional description; save Draft.
3. **+ Subcategory**. Choose the parent and save Draft. Publish/enable the parent before enabling its subcategory.
4. **Products → Add Product / Edit Product**: in the **Collection & Product Organization** area select main category, subcategory, and optional brand partner. Keep the existing category label for older products; taxonomy IDs are saved separately.
5. Product List has Main Category/Subcategory filters; **Bulk Add Products** can assign the same taxonomy and partner to several Draft products at once.
6. Publish the main category, subcategory, and product when all details, prices, stock, photos and quality checks are ready.
7. On the storefront, active main collections become shop filter chips, and their active subcategories appear as secondary filters. Only products with matching assignments appear in that grouped view; products without taxonomy assignment retain the legacy category behavior.

## Brand Partners / Our Brands
1. **Categories & Brands → + Add Brand Partner**.
2. Enter Company Name, optional বাংলা name, Website HTTPS URL, description, order and optional PNG/JPG/WebP logo (max 2 MB).
3. **Publish brand on storefront** is OFF by default. Save while off to prepare the card.
4. When ready, turn Publish ON. Only published partner records are publicly readable. The storefront automatically reveals an **Our brands & partners** section after the first published partner exists.
5. The partner website link opens in a new tab safely; cards without a website can show name/logo without becoming clickable.
6. This partner logo is separate from SHOPYHAT's own logo (Admin **Brand Settings**). Partner image upload uses the existing free Supabase public `shopyhat-branding` storage bucket with staff-only upload policy.

## Database tables
- `public.sh_categories`: UUID key, UUID nullable parent, unique URL slug, name, name_bn, description, image_url, sort_order, is_active, timestamps and audited editor.
- `public.sh_brand_partners`: UUID key, names, official HTTPS URL, logo URL, description, sort_order, is_published, timestamps and audited editor.
- `public.sh_products`: original columns plus nullable category_id, subcategory_id and brand_partner_id UUID foreign keys.

### Safety and compatibility
- RLS: anonymous users can read only active categories and published partners. Owner/Manager can insert/change records; staff access remains limited by existing roles.
- Database guards reject self-parenting, deeper-than-two category nesting, mismatched product subcategory, and disabling parent while active subcategories exist.
- All example categories are inactive until explicitly enabled; no partner was inserted/published. Existing products have no taxonomy assignments yet.
- No existing product is deleted or silently migrated into an incorrect collection.
- Do not turn off parent categories without deactivating their children.
- Public category selection depends on a successful request to Supabase. If that fails, the storefront continues showing existing product groups.

## Release acceptance test
- Admin login → Categories & Brands visible only to Owner/Manager.
- Create draft category and child, verify they are not visible in storefront.
- Enable category, then subcategory; attach a Draft test product; activate product only after required checks. Confirm `#shop/<root-slug>/<sub-slug>` filters correctly.
- Upload a small test brand logo, save unpublished and verify that the Our Brands section remains hidden; publish and verify it appears with optional official link.
- Disable the brand and confirm disappearance without removing product/partner database entries.
- Test English/বাংলা names and mobile filter responsiveness.
- All production writes should use the Admin UI. Database rollback tests were used to verify permissions and correct relationships without leaving test records.

## Release note
Cloudflare Pages must complete deployment after GitHub main merge. The initial live browser interaction and actual logo upload must still be verified in the deployed site.
