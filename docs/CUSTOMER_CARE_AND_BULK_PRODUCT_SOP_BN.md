# SHOPYHAT — Product Management, Reviews & Customer Issue Resolution SOP

**Version:** November 2026 · **Scope:** Storefront, Operations Admin, Supabase Customer Care

## 1. Add multiple products (Admin)

1. **Products → Bulk Add Products**-এ যান।
2. **Add Product Row** দিয়ে একসঙ্গে সর্বোচ্চ **২০টি** পণ্য দিন (Name, Category, Price, Previous Price, Sizes)।
3. **Save All Draft Products** চাপুন। নতুনগুলো Draft হিসেবে তৈরি হবে, যেন অসম্পূর্ণ পণ্য Live না হয়।
4. প্রতিটি পণ্যে **Edit / Photos** খুলে বাংলা ও ইংরেজি বিবরণ, ছবি, অন্যান্য তথ্য যোগ করুন।
5. **Add Multiple Colors** থেকে সর্বোচ্চ ২০টি Color Variant একসঙ্গে দিন—রং, HEX, variant price, stock, SKU।
6. Variant save করার পর রং অনুযায়ী আলাদা Gallery-তে ছবি দিন। সব যাচাইয়ের পর **Active** করুন।
7. Individual form-এ **Save & Add Another**, **Back to Product**, **Back to Products** রয়েছে।

**Quality control:** Duplicate colors, stock validity, required fields ও image previews যাচাই করুন। মুছে ফেলার আগে warning popup-এর confirmation বাধ্যতামূলক।

## 2. Customer product reviews

Customer-facing website-এ **Reviews & Support → Product Reviews → Write a Review**। Product Detail থেকেও Review section খোলা যায়।

Customer provides: product, name, 1–5 stars, optional title, review text.

**Review process:** Submitted → Pending → Admin moderation → Approved (public) / Rejected.
Admin → **Reviews**-এ যাচাই করে public response (optional) এবং decision save করুন। Product page/customer care-এ শুধু Approved review দেখানো হয়। এগুলো **verified purchase review নয়**—সেই তথ্য স্পষ্টভাবে প্রকাশিত।

Review text-এ ব্যক্তিগত ফোন/ঠিকানা, হুমকি, অপমানজনক ভাষা বা অপ্রাসঙ্গিক বিষয় থাকলে প্রকাশ করবেন না। Anonymous API দিয়ে status Approved করা যায় না।

## 3. Customer Issue Reporting

**Website → Reviews & Support → Report an Issue**.

Required: customer name, Bangladesh mobile, issue category, subject, description. Optional: email, order number, product, photo/video proof.

- সর্বোচ্চ **৩টি** JPG / PNG / WebP / MP4 / WebM attachment।
- প্রতি ফাইল সর্বোচ্চ **১৫ MB**, মোট সর্বোচ্চ **২০ MB**।
- Evidence একটি **private** Supabase Storage bucket-এ থাকবে; public URL নয়।
- Successful submission-এ customer একটি unique **Case ID** পাবে।
- Damaged/defective/wrong product: published policy অনুসারে delivery থেকে **৩ calendar days**-এর মধ্যে request জানানোর নির্দেশ দেওয়া হয়।

**Do not ask customers for bKash/Nagad PIN, OTP or password.**

## 4. Standard Case Resolution Workflow

| Stage | Responsible | Action |
|---|---|---|
| Submitted | Customer / System | Unique Case ID ও evidence সংরক্ষণ |
| Under Review | Support Lead | Category, order, priority ও supporting evidence check |
| Investigating | Assigned Staff | Relevant order/payment/courier/team-এর সঙ্গে যাচাই |
| Awaiting Customer | Support Staff | কোন তথ্য প্রয়োজন তা public feedback-এ স্পষ্ট উল্লেখ |
| Resolution Proposed | Support Lead | Action/compensation/exchange/refund proposal নথিভুক্ত |
| Resolved | Assigned Staff | অন্তত ১০ অক্ষরের final resolution note বাধ্যতামূলক |
| Closed | Support Lead | **Resolved** হওয়ার পরই Closed করা যায় |
| Reopened | Support Staff | আগে Resolved/Closed হলে নতুন তথ্যের ভিত্তিতে পুনরায় খোলা |

**Admin → Support Cases:** Filter by Status, Priority, Case ID/Order, Date; assignee, priority, status, customer-facing feedback, resolution update করুন। Customer evidence শুধু authorized Staff signed link দিয়ে দেখবে। Timeline-এ staff action, feedback এবং customer follow-up reply থাকবে।

Customer **Track My Case**-এ Case ID + mobile দিয়ে latest status/feedback দেখবে। Open case-এ **Add Information / Reply** করা যায়; reply-এর পরে case আবার Under Review হয়। Closed/Resolved case-এ নতুন issue জমার নির্দেশ দেওয়া হয়।

## 5. Suggested operating standards

- **Urgent**: same-shift review; **High**: prioritize within the working day; **Normal**: next scheduled support review; **Low**: roster queue. এগুলো operating targets, ওয়েবসাইটে customer guarantee নয়।
- Staff assignment ছাড়া investigation/closure শুরু করবেন না।
- Customer-facing feedback-এ status, next action এবং প্রয়োজনীয় তথ্য সহজ ভাষায় লিখবেন।
- Resolution note ছাড়া Resolved/Closed অনুমোদিত নয়; Resolved হওয়ার আগে Closed নয়।
- Payment dispute হলে actual payment provider transaction যাচাই না করে paid/refunded বলবেন না।
- Case closure-এর আগে evidence, staff findings, customer updates, final action review করুন।

## 6. Access, privacy & limitations

- Public visitors approved reviews পড়তে পারবেন, কিন্তু pending reviews, staff identity, private cases, evidence বা customer replies পড়তে পারবেন না।
- Review/Case submission Supabase Edge Function হয়ে হয়, public direct database INSERT নয়।
- Case status lookup requires Case ID **and** submitting mobile number।
- Server-side per-request rate limits, input/file signature checks, honeypot এবং optional Cloudflare Turnstile verification যুক্ত আছে। **Turnstile secret configure না করা হলে Turnstile সক্রিয় নয়**।
- No automatic email/SMS notifications are promised; customer may track using Case ID.
- Case/media/history changes recorded in server-side tables; Activity Log stores audit events without copying private customer notes/phone.
- Existing Admin lists initially fetch up to **1,000 rows per table**; larger volumes require paginated backend queries.
- Cloudflare Pages must complete production deployment before changes appear to customers.

## 7. Post-release acceptance tests

1. Admin → Bulk Add **two Draft test products**; then add three variants to one product.
2. Check **Back** and **Save & Add Another**; ensure no accidental live publication.
3. Website → submit **one test review**; verify it is Pending and invisible publicly; approve in Admin; refresh customer review list.
4. Website → submit **one test issue** with a small sample photo; note Case ID.
5. Admin → Support Cases → Assign → Investigate → Awaiting Customer; send feedback.
6. Customer → Track My Case (ID + mobile) → read feedback → send reply.
7. Admin → verify reply and timeline, save final resolution, mark Resolved and then Closed.
8. Validate attachments are **not accessible via public unauthenticated URLs**.
9. Remove test records carefully after testing, preserving production history.

**Note:** Database/JavaScript tests do not replace live browser and real upload testing.
