/* SHOPYHAT bilingual UI · intentionally local, no translation API, no customer data sent off-site.
   New catalog descriptions use their original language unless a Bengali translation is provided. */
(function(){
'use strict';
const EN = new Map();
const raw = "\nCash on delivery across Bangladesh.\tবাংলাদেশজুড়ে ক্যাশ অন ডেলিভারি।\nDamaged or wrong item? Request a return within 3 days.\tপণ্য ক্ষতিগ্রস্ত বা ভুল হলে ৩ দিনের মধ্যে রিটার্নের অনুরোধ করুন।\nYour choice, our gift.\tআপনার পছন্দ, আমাদের উপহার।\nHome\tহোম\nShop\tশপ\nSarees\tশাড়ি\nTrack order\tঅর্ডার ট্র্যাক করুন\nPolicies\tনীতিমালা\nContact\tযোগাযোগ\nSearch\tখুঁজুন\nSaved\tপছন্দের তালিকা\nCart\tকার্ট\nYour choice,\tআপনার পছন্দ,\nour gift.\tআমাদের উপহার।\nTangail sarees, three-piece sets, hijab and accessories, chosen with care and delivered to your door.\tযত্নে বাছাই করা টাঙ্গাইল শাড়ি, থ্রি-পিস, হিজাব ও ফ্যাশন সামগ্রী পৌঁছে দিই আপনার দোরগোড়ায়।\nShop sarees\tশাড়ি দেখুন\nBrowse everything\tসব পণ্য দেখুন\nCash on delivery\tক্যাশ অন ডেলিভারি\nPay when your order arrives\tপণ্য পৌঁছানোর পর মূল্য দিন\nBangladesh-wide delivery\tসারা বাংলাদেশে ডেলিভারি\nInside and outside Dhaka\tঢাকায় ও ঢাকার বাইরে\n3-day return request\t৩ দিনের রিটার্ন অনুরোধ\nFor damaged, defective or wrong items\tক্ষতিগ্রস্ত, ত্রুটিপূর্ণ বা ভুল পণ্যের ক্ষেত্রে\nEXPLORE THE COLLECTION\tকালেকশন ঘুরে দেখুন\nFind your kind of beautiful.\tআপনার পছন্দের সৌন্দর্য খুঁজে নিন।\nDiscover styles by category, thoughtfully organised for easy shopping.\tসহজ কেনাকাটার জন্য ক্যাটাগরি অনুযায়ী সাজানো আমাদের কালেকশন।\nExplore all\tসব দেখুন\nFRESH FINDS\tনতুন সংগ্রহ\nNew arrivals\tনতুন এসেছে\nFresh picks from SHOPYHAT, ready to explore.\tSHOPYHAT-এর নতুন কালেকশন—এখনই দেখে নিন।\nShop all products\tসব পণ্য দেখুন\nGOOD FINDS, BETTER PRICES\tদারুণ পণ্য, সাশ্রয়ী দাম\nSpecial offers\tবিশেষ অফার\nSelected products at reduced prices while available.\tস্টক থাকা পর্যন্ত নির্বাচিত পণ্যে বিশেষ মূল্যছাড়।\nBrowse the shop\tশপ ঘুরে দেখুন\nTangail sarees for every day and every occasion\tপ্রতিদিন ও প্রতিটি অনুষ্ঠানের জন্য টাঙ্গাইল শাড়ি\nLight cotton for daily wear, rich borders for gatherings, and silk blends for the days that matter. Pick your colour, and we pack it like a gift.\tপ্রতিদিনের জন্য আরামদায়ক সুতি, অনুষ্ঠানের জন্য আকর্ষণীয় পাড় এবং বিশেষ দিনের জন্য সিল্ক ব্লেন্ড। আপনার রং বেছে নিন—উপহারের মতো যত্নে প্যাক করব।\nSoft, breathable fabrics\tনরম ও আরামদায়ক কাপড়\nTraditional borders and decorated pallu\tঐতিহ্যবাহী পাড় ও নকশাদার আঁচল\nBlouse piece included with every saree\tপ্রতিটি শাড়ির সঙ্গে ব্লাউজ পিস\nSee all sarees\tসব শাড়ি দেখুন\nPICK UP WHERE YOU LEFT OFF\tযেখান থেকে শেষ করেছিলেন\nRecently viewed\tসম্প্রতি দেখা\nSIMPLE FROM START TO FINISH\tশুরু থেকে শেষ—সবই সহজ\nShop with confidence.\tনিশ্চিন্তে কেনাকাটা করুন।\nA clear journey from your favourite colour to your doorstep.\tপছন্দের রং নির্বাচন থেকে আপনার দরজায় ডেলিভারি—প্রতিটি ধাপ সহজ।\nChoose\tবেছে নিন\nPick a product, colour and size.\tপণ্য, রং ও সাইজ বেছে নিন।\nAdd to cart\tকার্টে যোগ করুন\nCheck your items and apply a coupon.\tপণ্য যাচাই করুন ও কুপন ব্যবহার করুন।\nPlace your order\tঅর্ডার করুন\nEnter your name, phone and address.\tনাম, ফোন নম্বর ও ঠিকানা দিন।\nWe confirm\tআমরা নিশ্চিত করি\nOur team confirms with you and ships it.\tআমাদের টিম নিশ্চিত করে পণ্য পাঠায়।\nAll products\tসব পণ্য\nWomen's clothing, sarees and accessories.\tনারীদের পোশাক, শাড়ি ও ফ্যাশন সামগ্রী।\nNewest & featured\tনতুন ও নির্বাচিত পণ্য\nPrice: low to high\tদাম: কম থেকে বেশি\nPrice: high to low\tদাম: বেশি থেকে কম\nName: A to Z\tনাম: A থেকে Z\nUp to\tসর্বোচ্চ\nOn sale only\tশুধু অফারের পণ্য\nClear filters\tফিল্টার মুছুন\nTrack your order\tআপনার অর্ডার ট্র্যাক করুন\nEnter your order number and phone number.\tঅর্ডার নম্বর ও ফোন নম্বর দিন।\nFind your order\tআপনার অর্ডার খুঁজুন\nEnter the order number from your confirmation and the phone number you used when ordering.\tকনফার্মেশনে পাওয়া অর্ডার নম্বর এবং অর্ডার দেওয়ার সময় ব্যবহৃত ফোন নম্বর লিখুন।\nOrder number\tঅর্ডার নম্বর\nPhone number\tফোন নম্বর\nContact us\tযোগাযোগ করুন\nQuestions about an order, a return or a product? We will help.\tঅর্ডার, রিটার্ন বা পণ্য নিয়ে প্রশ্ন আছে? আমরা সাহায্য করব।\nFacebook page\tফেসবুক পেজ\nMessage us anytime about orders and support.\tঅর্ডার ও সহায়তার জন্য যেকোনো সময় মেসেজ করুন।\nWhatsApp\tহোয়াটসঅ্যাপ\nBased in Bangladesh\tবাংলাদেশভিত্তিক\nWe deliver across the country.\tসারা দেশে ডেলিভারি দিই।\nReturn or exchange\tরিটার্ন বা এক্সচেঞ্জ\nContact us within 3 calendar days of receiving your order.\tপণ্য পাওয়ার ৩ দিনের মধ্যে যোগাযোগ করুন।\nRead the policy\tনীতিমালা পড়ুন\nSend a message\tমেসেজ পাঠান\nFill in the form and send it to us on WhatsApp or Messenger.\tফর্ম পূরণ করে হোয়াটসঅ্যাপ বা মেসেঞ্জারে পাঠান।\nYour name\tআপনার নাম\nTopic\tবিষয়\nOrder question\tঅর্ডার সংক্রান্ত প্রশ্ন\nReturn or exchange request\tরিটার্ন বা এক্সচেঞ্জ অনুরোধ\nProduct enquiry\tপণ্য সংক্রান্ত জিজ্ঞাসা\nPrivacy request\tগোপনীয়তা সংক্রান্ত অনুরোধ\nOther\tঅন্যান্য\nMessage\tমেসেজ\nSend on WhatsApp\tহোয়াটসঅ্যাপে পাঠান\nSend on Messenger\tমেসেঞ্জারে পাঠান\nCommon questions\tসাধারণ প্রশ্ন\nHow long do I have to request a return?\tরিটার্নের অনুরোধ কতদিনের মধ্যে করতে হবে?\nContact SHOPYHAT within 3 calendar days of receiving the product.\tপণ্য পাওয়ার ৩ দিনের মধ্যে SHOPYHAT-এর সঙ্গে যোগাযোগ করুন।\nWhen can I return or exchange a product?\tকোন অবস্থায় পণ্য রিটার্ন বা এক্সচেঞ্জ করা যাবে?\nWhen the product is damaged or defective, the wrong product, colour or design is delivered, or it is significantly different from the confirmed order. We do not accept returns for a simple change of mind.\tপণ্য ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ হলে, ভুল পণ্য, রং বা ডিজাইন পেলে অথবা নিশ্চিত করা অর্ডারের সঙ্গে উল্লেখযোগ্য অমিল থাকলে। শুধু মত পরিবর্তনের কারণে রিটার্ন গ্রহণ করা হয় না।\nShould I send the product back right away?\tপণ্যটি কি সঙ্গে সঙ্গে ফেরত পাঠাব?\nNo. Please wait for our confirmation and return instructions before sending anything back.\tনা। আমাদের নিশ্চিতকরণ ও নির্দেশনা পাওয়ার আগে কোনো পণ্য ফেরত পাঠাবেন না।\nWho pays delivery for an approved return?\tঅনুমোদিত রিটার্নের ডেলিভারি খরচ কে বহন করবে?\nIf the return or exchange is approved because we delivered a damaged, defective or incorrect product, SHOPYHAT bears the applicable delivery charges.\tআমাদের পাঠানো পণ্য ক্ষতিগ্রস্ত, ত্রুটিপূর্ণ বা ভুল হওয়ায় রিটার্ন অনুমোদিত হলে প্রযোজ্য ডেলিভারি খরচ SHOPYHAT বহন করবে।\nWill the colour match the photo exactly?\tপণ্যের রং কি ছবির মতোই হবে?\nMinor colour variations can happen because of photography, lighting and screen settings. Please read the product description before you confirm your order.\tআলো, ফটোগ্রাফি ও স্ক্রিনের কারণে রঙে সামান্য পার্থক্য হতে পারে। অর্ডার নিশ্চিত করার আগে পণ্যের বিবরণ পড়ুন।\nOur policies\tআমাদের নীতিমালা\nPrivacy, return, exchange and refund policy. Last updated 21 November 2026.\tগোপনীয়তা, রিটার্ন, এক্সচেঞ্জ ও রিফান্ড নীতিমালা। সর্বশেষ আপডেট ২১ নভেম্বর ২০২৬।\nPrivacy\tগোপনীয়তা\nReturns\tরিটার্ন\nExchange\tএক্সচেঞ্জ\nProcess\tপ্রক্রিয়া\nDelivery\tডেলিভারি\nRefunds\tরিফান্ড\nWelcome to SHOPYHAT!\tSHOPYHAT-এ স্বাগতম!\nWe value your trust and are committed to providing a reliable and convenient shopping experience. Please read our policies carefully before placing an order.\tআপনার আস্থাকে আমরা গুরুত্ব দিই এবং নির্ভরযোগ্য ও সহজ কেনাকাটার অভিজ্ঞতা দিতে প্রতিশ্রুতিবদ্ধ। অর্ডারের আগে নীতিমালা মনোযোগ দিয়ে পড়ুন।\nPrivacy Policy\tগোপনীয়তা নীতিমালা\nSHOPYHAT respects your privacy and is committed to protecting your personal information.\tSHOPYHAT আপনার গোপনীয়তাকে সম্মান করে এবং ব্যক্তিগত তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ।\n1.1 Information We Collect\t১.১ আমরা যে তথ্য সংগ্রহ করি\nWhen you contact us or place an order, we may collect:\tযোগাযোগ বা অর্ডারের সময় আমরা যেসব তথ্য সংগ্রহ করতে পারি:\nCustomer name\tগ্রাহকের নাম\nDelivery address\tডেলিভারি ঠিকানা\nOrder and product details\tঅর্ডার ও পণ্যের বিস্তারিত\nInformation voluntarily shared during customer communication\tগ্রাহক নিজে যোগাযোগের সময় যে তথ্য জানান\n1.2 How We Use Your Information\t১.২ আপনার তথ্য যেভাবে ব্যবহার করি\nTo process and confirm orders.\tঅর্ডার প্রক্রিয়াকরণ ও নিশ্চিত করতে।\nTo arrange product delivery.\tপণ্য ডেলিভারির ব্যবস্থা করতে।\nTo communicate about orders and customer support.\tঅর্ডার ও গ্রাহক সহায়তার জন্য যোগাযোগ করতে।\nTo handle returns, exchanges and complaints.\tরিটার্ন, এক্সচেঞ্জ ও অভিযোগ পরিচালনা করতে।\nTo improve our products and shopping experience.\tপণ্য ও কেনাকাটার অভিজ্ঞতা উন্নত করতে।\n1.3 Information Sharing\t১.৩ তথ্য ভাগাভাগি\nWe do not sell customers' personal information. Necessary information may be shared with delivery partners and service providers to fulfil orders.\tআমরা গ্রাহকের ব্যক্তিগত তথ্য বিক্রি করি না। অর্ডার সম্পন্ন করতে প্রয়োজনীয় তথ্য ডেলিভারি পার্টনার ও সেবাদাতার সঙ্গে শেয়ার করা হতে পারে।\n1.4 Data Security\t১.৪ তথ্য সুরক্ষা\nWe take reasonable steps to protect customer information against unauthorized access, misuse or disclosure.\tঅননুমোদিত প্রবেশ, অপব্যবহার বা তথ্য প্রকাশ থেকে গ্রাহকের তথ্য রক্ষায় যুক্তিসংগত ব্যবস্থা গ্রহণ করি।\n1.5 Customer Privacy Rights\t১.৫ গ্রাহকের গোপনীয়তার অধিকার\nCustomers may contact SHOPYHAT to request correction or deletion of their personal information, subject to applicable legal requirements and necessary transaction records.\tপ্রযোজ্য আইন ও প্রয়োজনীয় লেনদেনের রেকর্ড সাপেক্ষে গ্রাহক তাদের ব্যক্তিগত তথ্য সংশোধন বা মুছে দেওয়ার অনুরোধ করতে পারেন।\nReturn Policy\tরিটার্ন নীতিমালা\nCustomer satisfaction is important to us. We aim to ensure that every customer receives the product they ordered in proper condition.\tগ্রাহকের সন্তুষ্টি আমাদের কাছে গুরুত্বপূর্ণ। প্রতিটি গ্রাহক যেন সঠিক অবস্থায় অর্ডার করা পণ্য পান, সেটাই আমাদের লক্ষ্য।\n3-Day Return Request Period\t৩ দিনের রিটার্ন অনুরোধের সময়সীমা\nCustomers must contact SHOPYHAT within 3 calendar days of receiving the product to request a return.\tপণ্য পাওয়ার ৩ দিনের মধ্যে রিটার্নের অনুরোধ জানাতে SHOPYHAT-এর সঙ্গে যোগাযোগ করতে হবে।\n2.1 Eligible Reasons for Return\t২.১ রিটার্নের গ্রহণযোগ্য কারণ\nThe delivered product is damaged or defective.\tপণ্য ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ।\nThe wrong product, colour or design is delivered.\tভুল পণ্য, রং বা ডিজাইন ডেলিভারি হয়েছে।\nThe product is significantly different from the confirmed order description.\tপণ্য নিশ্চিত করা অর্ডারের বিবরণ থেকে উল্লেখযোগ্যভাবে ভিন্ন।\n2.2 Change of Mind\t২.২ মত পরিবর্তন\nWe do not accept returns simply because a customer changes their mind, dislikes the selected style or colour, or no longer wants an accurately delivered product.\tশুধু সিদ্ধান্ত পরিবর্তন, পছন্দ করা ডিজাইন বা রং অপছন্দ হওয়া অথবা সঠিকভাবে ডেলিভারি হওয়া পণ্য আর না চাওয়ার কারণে রিটার্ন গ্রহণ করা হয় না।\nThis restriction does not affect any rights available to customers under applicable consumer protection laws.\tপ্রযোজ্য ভোক্তা অধিকার আইনের অধীনে গ্রাহকের অধিকার এতে সীমিত হয় না।\n2.3 Product Condition\t২.৩ পণ্যের অবস্থা\nThe product should remain unused and unwashed.\tপণ্য অব্যবহৃত ও না-ধোয়া অবস্থায় থাকতে হবে।\nOriginal tags, labels and packaging should be retained where applicable.\tপ্রযোজ্য ক্ষেত্রে মূল ট্যাগ, লেবেল ও প্যাকেজিং সংরক্ষণ করতে হবে।\nClear photos or videos may be requested to verify the issue.\tসমস্যা যাচাই করতে স্পষ্ট ছবি বা ভিডিও চাওয়া হতে পারে।\nThe product may be inspected before approval.\tঅনুমোদনের আগে পণ্য পরীক্ষা করা হতে পারে।\nExchange Policy\tএক্সচেঞ্জ নীতিমালা\nExchange requests are accepted for eligible damaged, defective or incorrectly delivered products.\tক্ষতিগ্রস্ত, ত্রুটিপূর্ণ অথবা ভুলভাবে ডেলিভারি হওয়া যোগ্য পণ্যের এক্সচেঞ্জ অনুরোধ গ্রহণ করা হয়।\n3.1 Exchange Eligibility\t৩.১ এক্সচেঞ্জের যোগ্যতা\nWrong product received.\tভুল পণ্য পাওয়া গেছে।\nDamaged or defective product received.\tক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ পণ্য পাওয়া গেছে।\nProduct significantly different from the confirmed order.\tপণ্য নিশ্চিত করা অর্ডারের সঙ্গে উল্লেখযোগ্যভাবে ভিন্ন।\n3.2 Saree & Clothing Exchange\t৩.২ শাড়ি ও পোশাক এক্সচেঞ্জ\nFor sarees, including Tangail sarees, and other clothing items:\tটাঙ্গাইল শাড়িসহ অন্যান্য পোশাকের ক্ষেত্রে:\nPlease review product descriptions and details before confirming an order.\tঅর্ডারের আগে পণ্যের বিবরণ ও বিস্তারিত যাচাই করুন।\nMinor colour variations may occur due to photography, lighting and screen settings.\tআলোকসজ্জা, ছবি তোলা ও স্ক্রিনের কারণে রং সামান্য ভিন্ন হতে পারে।\nGenuine product defects or incorrect deliveries will be reviewed.\tপণ্যের প্রকৃত ত্রুটি বা ভুল ডেলিভারি যাচাই করা হবে।\n3.3 Non-Eligible Exchanges\t৩.৩ এক্সচেঞ্জের অযোগ্য কারণ\nProducts that have been used, washed or altered.\tব্যবহৃত, ধোয়া বা পরিবর্তন করা পণ্য।\nProducts damaged through customer misuse or improper handling.\tগ্রাহকের অপব্যবহার বা ভুল ব্যবহারে ক্ষতিগ্রস্ত পণ্য।\nRequests based only on a change of mind.\tশুধু মত পরিবর্তনের ভিত্তিতে অনুরোধ।\nReturn & Exchange Process\tরিটার্ন ও এক্সচেঞ্জ প্রক্রিয়া\nTo request a return or exchange:\tরিটার্ন বা এক্সচেঞ্জের অনুরোধ করতে:\nContact SHOPYHAT within 3 calendar days of receiving your order.\tঅর্ডার পাওয়ার ৩ দিনের মধ্যে SHOPYHAT-এর সঙ্গে যোগাযোগ করুন।\nProvide your order number and registered contact details.\tঅর্ডার নম্বর ও নিবন্ধিত যোগাযোগের তথ্য দিন।\nExplain the problem clearly.\tসমস্যাটি স্পষ্টভাবে ব্যাখ্যা করুন।\nShare photos or videos of the damaged, defective or incorrect product.\tক্ষতিগ্রস্ত, ত্রুটিপূর্ণ বা ভুল পণ্যের ছবি বা ভিডিও দিন।\nWait for our team to review your request and provide instructions.\tআমাদের টিমের যাচাই ও নির্দেশনার জন্য অপেক্ষা করুন।\nImportant:\tগুরুত্বপূর্ণ:\nPlease do not send products back before receiving confirmation and return instructions from SHOPYHAT.\tSHOPYHAT-এর নিশ্চিতকরণ ও নির্দেশনা পাওয়ার আগে পণ্য ফেরত পাঠাবেন না।\nDelivery Charges\tডেলিভারি চার্জ\nIf a return or exchange is approved because SHOPYHAT delivered a damaged, defective or incorrect product, SHOPYHAT will bear the applicable return or exchange delivery charges.\tSHOPYHAT ভুল, ত্রুটিপূর্ণ বা ক্ষতিগ্রস্ত পণ্য পাঠানোয় রিটার্ন অনুমোদিত হলে প্রযোজ্য রিটার্ন বা এক্সচেঞ্জ ডেলিভারি খরচ SHOPYHAT বহন করবে।\nAny other delivery-charge arrangements will be communicated to the customer before proceeding.\tঅন্যান্য ডেলিভারি চার্জের ব্যবস্থা আগেই গ্রাহককে জানানো হবে।\nRefund Policy\tরিফান্ড নীতিমালা\nIf a refund is approved:\tরিফান্ড অনুমোদিত হলে:\nThe customer will be informed about the refund process.\tগ্রাহককে রিফান্ড প্রক্রিয়া জানানো হবে।\nThe refund will be processed through an agreed payment method.\tসম্মত পেমেন্ট পদ্ধতিতে রিফান্ড করা হবে।\nThe applicable refund amount and estimated processing time will be communicated to the customer.\tরিফান্ডের পরিমাণ ও সম্ভাব্য সময় গ্রাহককে জানানো হবে।\nRefunds will be handled in accordance with applicable laws and the agreed payment arrangements.\tপ্রযোজ্য আইন ও সম্মত পেমেন্ট ব্যবস্থার ভিত্তিতে রিফান্ড প্রক্রিয়া সম্পন্ন হবে।\nPolicy Updates\tনীতিমালা আপডেট\nSHOPYHAT may update these policies when necessary. Updated versions will be published through our official online channels.\tপ্রয়োজন অনুযায়ী SHOPYHAT নীতিমালা আপডেট করতে পারে। নতুন সংস্করণ আমাদের অফিসিয়াল অনলাইন মাধ্যমে প্রকাশ করা হবে।\nCustomers are encouraged to review these policies before placing an order.\tঅর্ডারের আগে গ্রাহকদের নীতিমালা পড়তে উৎসাহিত করা হচ্ছে।\nNeed help?\tসহায়তা দরকার?\nFor privacy-related questions, order assistance, return or exchange requests, contact our team.\tগোপনীয়তা, অর্ডার, রিটার্ন বা এক্সচেঞ্জ বিষয়ে আমাদের টিমের সঙ্গে যোগাযোগ করুন।\nContact SHOPYHAT\tSHOPYHAT-এর সঙ্গে যোগাযোগ করুন\nFashion, clothing and accessories.\tফ্যাশন, পোশাক ও আনুষঙ্গিক সামগ্রী।\nEstablished 2020, Bangladesh.\tপ্রতিষ্ঠিত ২০২০, বাংলাদেশ।\nHelp\tসহায়তা\nReturn and exchange\tরিটার্ন ও এক্সচেঞ্জ\nRefund policy\tরিফান্ড নীতিমালা\nConnect\tযোগাযোগ\nFacebook\tফেসবুক\nPrivacy policy\tগোপনীয়তা নীতিমালা\nSHOPYHAT. All rights reserved.\tSHOPYHAT। সর্বস্বত্ব সংরক্ষিত।\nYour cart\tআপনার কার্ট\nSaved items\tপছন্দের পণ্য\n\n\nSHOPYHAT CHECKOUT\tSHOPYHAT চেকআউট\nOne simple step\tমাত্র একটি সহজ ধাপ\nAlmost yours\tআর মাত্র এক ধাপ\nNo account needed. Enter your delivery details and review your total before placing your order.\tকোনো অ্যাকাউন্ট লাগবে না। ডেলিভারি তথ্য দিন এবং অর্ডার নিশ্চিত করার আগে মোট মূল্য যাচাই করুন।\n01   Delivery details\t০১  ডেলিভারির তথ্য\nDelivery details\tডেলিভারির তথ্য\nFull name\tপুরো নাম\nDelivery area\tডেলিভারি এলাকা\nFull address\tসম্পূর্ণ ঠিকানা\nOrder note (optional)\tঅর্ডার নোট (ঐচ্ছিক)\n02   Payment method\t০২  পেমেন্ট পদ্ধতি\nPayment method\tপেমেন্ট পদ্ধতি\nCash on delivery\tক্যাশ অন ডেলিভারি\nPay after your parcel arrives\tপণ্য হাতে পাওয়ার পর মূল্য দিন\nbKash — Send Money\tবিকাশ — সেন্ড মানি\nNagad — Send Money\tনগদ — সেন্ড মানি\nSend Money via bKash app · manual verification\tবিকাশ অ্যাপ দিয়ে সেন্ড মানি · ম্যানুয়াল যাচাই\nSend Money via Nagad app · manual verification\tনগদ অ্যাপ দিয়ে সেন্ড মানি · ম্যানুয়াল যাচাই\nPayment account not configured yet\tপেমেন্ট অ্যাকাউন্ট এখনো চালু হয়নি\nMANUAL TRANSFER · VERIFICATION REQUIRED\tম্যানুয়াল ট্রান্সফার · যাচাই আবশ্যক\nTransaction ID *\tট্রানজ্যাকশন আইডি *\nSender mobile (last 4 digits) *\tপ্রেরকের মোবাইল নম্বরের শেষ ৪ সংখ্যা *\nI have completed Send Money to the displayed receiving number. I understand SHOPYHAT must verify it before confirming payment.\tপ্রদর্শিত নম্বরে সেন্ড মানি সম্পন্ন করেছি। আমি জানি, পেমেন্ট নিশ্চিত করার আগে SHOPYHAT লেনদেন যাচাই করবে।\nNever share your bKash/Nagad PIN, OTP, login or security code. A Transaction ID is a claim,\tআপনার বিকাশ/নগদের PIN, OTP, লগইন বা নিরাপত্তা কোড কাউকে দেবেন না। ট্রানজ্যাকশন আইডি দেওয়া মানেই\nnot automatic payment confirmation\tপেমেন্ট স্বয়ংক্রিয়ভাবে নিশ্চিত হওয়া নয়\nI have read the\tআমি পড়েছি\nreturn, exchange and privacy policies\tরিটার্ন, এক্সচেঞ্জ ও গোপনীয়তা নীতিমালা\nand my order details are correct.\tএবং আমার অর্ডারের তথ্য সঠিক।\nPlace order\tঅর্ডার নিশ্চিত করুন\nYour delivery charge is included in the total shown in the order summary.\tঅর্ডার সারাংশে দেখানো মোট মূল্যের মধ্যেই ডেলিভারি চার্জ অন্তর্ভুক্ত।\nYOUR SELECTION\tআপনার নির্বাচিত পণ্য\nOrder summary\tঅর্ডারের সারাংশ\nConfirm your selected colours, quantities and delivery address before payment.\tপেমেন্টের আগে নির্বাচিত রং, পরিমাণ ও ডেলিভারি ঠিকানা যাচাই করুন।\nSubtotal\tপণ্যের মোট দাম\nCoupon\tকুপন\nDelivery\tডেলিভারি\nTotal\tসর্বমোট\nFree\tফ্রি\nInside Dhaka\tঢাকার ভিতরে\nOutside Dhaka\tঢাকার বাইরে\nDhaka\tঢাকা\noutside\tঢাকার বাইরে\nCopy number\tনম্বর কপি করুন\nPayment number copied\tপেমেন্ট নম্বর কপি হয়েছে\nPlease copy the displayed payment number\tপ্রদর্শিত পেমেন্ট নম্বরটি কপি করুন\nSelect colour\tরং বেছে নিন\nAvailable colours\tযে রংগুলো আছে\nSold out\tস্টক শেষ\nSize\tসাইজ\nQuantity\tপরিমাণ\nDecrease\tকমান\nIncrease\tবাড়ান\nPhoto\tছবি\nYou save\tআপনার সাশ্রয়\nDetails\tবিস্তারিত\nDelivery and returns\tডেলিভারি ও রিটার্ন\nAbout colour\tরং সম্পর্কে\nColours can look slightly different from the photo because of lighting and screen settings.\tআলো ও স্ক্রিনের পার্থক্যের কারণে পণ্যের রং ছবির তুলনায় সামান্য ভিন্ন দেখাতে পারে।\nYou may also like\tআপনার আরও পছন্দ হতে পারে\nAdd to bag\tব্যাগে যোগ করুন\nBuy now\tএখনই কিনুন\nSave to wishlist\tপছন্দের তালিকায় রাখুন\nSaved to wishlist\tপছন্দের তালিকায় রাখা হয়েছে\nShare\tশেয়ার করুন\nRemove\tসরিয়ে দিন\nAdd something else\tআরও পণ্য দেখুন\nCoupon code\tকুপন কোড\nApply\tপ্রয়োগ করুন\nContinue to checkout\tচেকআউটের জন্য এগিয়ে যান\nNo account needed · Confirm your total at checkout\tঅ্যাকাউন্ট লাগবে না · চেকআউটে মোট মূল্য নিশ্চিত করুন\nYour cart is empty.\tআপনার কার্ট খালি।\nYour cart is empty\tআপনার কার্ট খালি\nFind something you love and add it here.\tআপনার পছন্দের পণ্য খুঁজে কার্টে যোগ করুন।\nStart shopping\tকেনাকাটা শুরু করুন\nNothing saved yet.\tএখনো কোনো পণ্য সংরক্ষিত নেই।\nTap the heart on any product to keep it here.\tপছন্দের পণ্য সংরক্ষণ করতে হার্ট চিহ্নে চাপুন।\nView\tদেখুন\nClose\tবন্ধ করুন\nContinue shopping\tকেনাকাটা চালিয়ে যান\nOrder request placed\tঅর্ডারের অনুরোধ গ্রহণ করা হয়েছে\nPayment verification requested\tপেমেন্ট যাচাইয়ের অনুরোধ করা হয়েছে\nPayment pending verification\tপেমেন্ট যাচাইয়ের অপেক্ষায়\nNo advance payment required. Pay when the parcel is delivered.\tঅগ্রিম পেমেন্ট দরকার নেই। পণ্য পৌঁছালে মূল্য পরিশোধ করুন।\nSend on WhatsApp\tহোয়াটসঅ্যাপে পাঠান\nSend on Messenger\tমেসেঞ্জারে পাঠান\nKeep shopping\tআরও কেনাকাটা করুন\nPlaced\tঅর্ডার করা হয়েছে\nConfirmed\tনিশ্চিত\nPacked\tপ্যাক করা হয়েছে\nShipped\tপাঠানো হয়েছে\nDelivered\tডেলিভারি সম্পন্ন\nCancelled\tবাতিল\nPending\tঅপেক্ষমাণ\nPending verification\tযাচাইয়ের অপেক্ষায়\nVerified - Paid\tযাচাই সম্পন্ন — পরিশোধিত\nPayment method:\tপেমেন্ট পদ্ধতি:\nPayment claim status:\tপেমেন্ট দাবির অবস্থা:\nMessage from SHOPYHAT:\tSHOPYHAT-এর মেসেজ:\nLooking up your order…\tআপনার অর্ডার খোঁজা হচ্ছে…\nLoading products…\tপণ্য লোড হচ্ছে…\nUnable to load products.\tপণ্য লোড করা যাচ্ছে না।\nRefresh to retry.\tআবার চেষ্টা করতে রিফ্রেশ করুন।\nSelect and copy the payment number above\tউপরের পেমেন্ট নম্বরটি নির্বাচন করে কপি করুন\nSelected color is sold out.\tনির্বাচিত রঙের পণ্য স্টক শেষ।\nThis color is sold out right now. Message us to ask when it will be back.\tএই রঙের পণ্যের স্টক শেষ। আবার কখন আসবে জানতে মেসেজ করুন।\nSaved to your wishlist\tপছন্দের তালিকায় যুক্ত হয়েছে\nRemoved from wishlist\tপছন্দের তালিকা থেকে সরানো হয়েছে\nProduct link copied\tপণ্যের লিংক কপি হয়েছে\nEnter your full name.\tআপনার সম্পূর্ণ নাম লিখুন।\nEnter a valid Bangladeshi mobile number.\tবাংলাদেশের সঠিক মোবাইল নম্বর লিখুন।\nEnter your full delivery address.\tসম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।\nThis payment method is not configured.\tএই পেমেন্ট পদ্ধতি চালু করা হয়নি।\nEnter your actual transaction ID.\tসঠিক ট্রানজ্যাকশন আইডি লিখুন।\nEnter the sender mobile last 4 digits.\tপ্রেরকের মোবাইলের শেষ ৪ সংখ্যা লিখুন।\nConfirm the payment transfer first.\tপ্রথমে পেমেন্ট ট্রান্সফার নিশ্চিত করুন।\nAccept the policies to place your order.\tঅর্ডার দিতে নীতিমালা গ্রহণ করুন।\nThis product needs a valid color selection. Please refresh.\tএই পণ্যের জন্য সঠিক রং নির্বাচন করুন। পেজ রিফ্রেশ করুন।\nYour cart is empty.\tআপনার কার্ট খালি।\nSaving your order securely…\tআপনার অর্ডার নিরাপদে সংরক্ষিত হচ্ছে…\nConfirming order…\tঅর্ডার নিশ্চিত করা হচ্ছে…\nUnable to confirm order. Your cart is intact. Please try again.\tঅর্ডার নিশ্চিত করা যায়নি। কার্টের পণ্য অক্ষত আছে। আবার চেষ্টা করুন।\nOrder could not be confirmed.\tঅর্ডার নিশ্চিত করা যায়নি।\nComplete human verification first.\tপ্রথমে মানব যাচাই সম্পন্ন করুন।\nPayment account not configured yet\tপেমেন্ট অ্যাকাউন্ট এখনো চালু হয়নি\nOrder status\tঅর্ডারের অবস্থা\nWe have received your order. Our team will contact you to confirm it.\tআমরা আপনার অর্ডার পেয়েছি। নিশ্চিত করতে আমাদের টিম যোগাযোগ করবে।\nYour order is confirmed. We are getting it ready.\tআপনার অর্ডার নিশ্চিত হয়েছে। আমরা প্রস্তুত করছি।\nYour order is packed and will be handed to the courier soon.\tআপনার অর্ডার প্যাক করা হয়েছে। শিগগির কুরিয়ারে দেওয়া হবে।\nYour order is on its way to you.\tআপনার পণ্য পথে রয়েছে।\nYour order was delivered. Thank you for shopping with SHOPYHAT. Need a return? Contact us within 3 days.\tআপনার অর্ডার ডেলিভারি সম্পন্ন হয়েছে। SHOPYHAT থেকে কেনাকাটার জন্য ধন্যবাদ। রিটার্ন চাইলে ৩ দিনের মধ্যে যোগাযোগ করুন।\nThis order was cancelled. Message us if you have any questions.\tঅর্ডারটি বাতিল হয়েছে। প্রশ্ন থাকলে আমাদের মেসেজ করুন।\nOrder question\tঅর্ডার সংক্রান্ত প্রশ্ন\nTrack order\tঅর্ডার ট্র্যাক করুন\n";
for(const line of raw.split('\n')){
 const tab=line.indexOf('\t');
 if(tab<1)continue;
 const en=line.slice(0,tab).trim(),bn=line.slice(tab+1).trim();
 if(en && bn)EN.set(en.replace(/&amp;/g,'&').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim(),bn);
}

// Additional catalog and checkout vocabulary, including common dynamic labels.
const ABOUT_NEW = {
 'SHOPYHAT · OUR STORY SINCE 2020':'SHOPYHAT · ২০২০ থেকে আমাদের গল্প',
 'Everyday choices.':'প্রতিদিনের পছন্দ।','Real trust.':'সত্যিকারের আস্থা।',
 'We started with a belief: customers deserve authentic products, honest product photos, reasonable prices and the confidence that what they choose is what they receive.':'আমরা বিশ্বাস করি—ক্রেতার প্রাপ্য আসল পণ্য, সত্যনিষ্ঠ ছবি, যুক্তিসঙ্গত দাম এবং যা দেখানো হয় তা-ই পাওয়ার নিশ্চয়তা।',
 'From sarees and hijabs to lifestyle essentials, SHOPYHAT is working toward making more of your everyday needs available in one thoughtful shopping destination.':'শাড়ি, হিজাব ও লাইফস্টাইল সামগ্রী থেকে প্রতিদিনের প্রয়োজনীয় পণ্য—সবকিছু এক বিশ্বস্ত জায়গায় দেওয়ার লক্ষ্য নিয়ে SHOPYHAT এগিয়ে চলেছে।',
 'Connect with us':'আমাদের সঙ্গে যোগাযোগ করুন','01 AUG 2020':'০১ আগস্ট ২০২০','Planning began':'পরিকল্পনার শুরু',
 '28 AUG 2020':'২৮ আগস্ট ২০২০','Online launch':'অনলাইন যাত্রা শুরু','YOUR CHOICE':'আপনার পছন্দ','OUR GIFT.':'আমাদের উপহার।',
 'ESTABLISHED AUGUST 2020 · BANGLADESH':'প্রতিষ্ঠা আগস্ট ২০২০ · বাংলাদেশ',
 'WHY WE EXIST':'আমাদের উদ্দেশ্য','What you see should be':'যা দেখবেন,','what you receive.':'তা-ই পাবেন।',
 'We aim to close the gap between online product photos and customers\' real experience. Clear descriptions, transparent options, thoughtful sourcing and dependable support are the principles guiding how we grow.':'অনলাইনে পণ্যের ছবির সঙ্গে বাস্তবে পাওয়া পণ্যের পার্থক্য কমানোই আমাদের লক্ষ্য। পরিষ্কার বিবরণ, স্বচ্ছ বিকল্প, যত্নশীল সোর্সিং ও নির্ভরযোগ্য সাপোর্ট আমাদের পথ দেখায়।',
 'Product authenticity':'পণ্যের আসলত্ব','Fair everyday value':'সাশ্রয়ী ও ন্যায্য মূল্য','Care beyond checkout':'কেনাকাটার পরেও সেবা',
 'We aim to bring original, accurately presented products and avoid creating misleading expectations about quality, color or design.':'আসল পণ্য সঠিকভাবে উপস্থাপন করা এবং মান, রং বা ডিজাইন সম্পর্কে ভুল প্রত্যাশা তৈরি না করাই আমাদের লক্ষ্য।',
 'Our goal is to make useful fashion and lifestyle choices accessible through reasonable prices and clear information.':'যুক্তিসঙ্গত দাম ও পরিষ্কার তথ্যের মাধ্যমে প্রয়োজনীয় ফ্যাশন ও লাইফস্টাইল পণ্য সহজলভ্য করতে চাই।',
 'We listen to feedback and keep improving product availability, order handling and after-sales issue resolution.':'গ্রাহকের মতামত শুনে স্টক, অর্ডার ব্যবস্থাপনা ও বিক্রয়োত্তর সমস্যা সমাধান উন্নত করছি।',
 'THE SHOPYHAT JOURNEY':'SHOPYHAT-এর পথচলা','A small beginning.':'ছোট্ট শুরু।','A bigger purpose.':'বড় একটি লক্ষ্য।',
 'Our planning began on':'আমাদের পরিকল্পনা শুরু হয়','August 01, 2020':'০১ আগস্ট ২০২০','August 28, 2020':'২৮ আগস্ট ২০২০',
 'The idea took shape':'ভাবনার শুরু','Initial planning and product selection began.':'প্রাথমিক পরিকল্পনা ও পণ্য নির্বাচন শুরু হয়।',
 'Our online launch':'অনলাইন যাত্রার শুরু','SHOPYHAT started serving customers.':'SHOPYHAT ক্রেতাদের সেবা দেওয়া শুরু করে।',
 'EARLY COLLECTION':'প্রথম কালেকশন','More choices arrived':'পণ্যের বৈচিত্র্য বাড়ে',
 'Hijabs, cosmetics, three-piece sets and sarees joined the range.':'হিজাব, কসমেটিকস, থ্রি-পিস ও শাড়ি কালেকশনে যুক্ত হয়।',
 'CUSTOMER RESPONSE':'গ্রাহকদের সাড়া','Repeat requests, meaningful feedback':'পুনরায় অর্ডার ও মূল্যবান মতামত',
 'Returning customers helped guide our next steps.':'ফিরে আসা ক্রেতারা আমাদের পরবর্তী পথচলায় অনুপ্রেরণা দিয়েছেন।',
 'CONTINUOUS LEARNING':'নিরন্তর শেখা','Stronger stock planning':'স্টক পরিকল্পনার উন্নতি',
 'Availability challenges helped us improve how we plan and serve.':'স্টক সমস্যাগুলো পরিকল্পনা ও সেবা আরও ভালো করতে সাহায্য করেছে।',
 'OUR DIRECTION':'আমাদের পথনির্দেশ','Vision, mission & goals':'ভিশন, মিশন ও লক্ষ্য','Built around the needs of the people we serve.':'গ্রাহকদের প্রয়োজনকে কেন্দ্র করে আমাদের পরিকল্পনা।',
 'VISION':'ভিশন','One trusted destination':'এক বিশ্বস্ত গন্তব্য',
 'MISSION':'মিশন','Honest products, better service':'সৎ উপস্থাপনা, উন্নত সেবা',
 'GOAL':'লক্ষ্য','Grow with our customers':'গ্রাহকদের সঙ্গে এগিয়ে চলা',
 'DISCOVER OUR COLLECTION':'কালেকশন দেখুন','Products that tell our story.':'আমাদের গল্প বলে যে পণ্যগুলো।',
 'Actual product photos from our current catalog—not unrelated stock photography.':'এগুলো আমাদের বর্তমান কালেকশনের প্রকৃত পণ্যের ছবি, স্টক ফটো নয়।',
 'See all products':'সব পণ্য দেখুন','OUR COMMITMENT':'আমাদের অঙ্গীকার',
 'More than a product.':'শুধু পণ্য নয়।','A promise to keep improving.':'উন্নতির অঙ্গীকার।',
 'Start shopping':'কেনাকাটা শুরু করুন','STAY CONNECTED':'যোগাযোগ রাখুন','Follow our journey':'আমাদের যাত্রায় সঙ্গী হোন',
 'Our location':'আমাদের ঠিকানা','Contact & Map':'যোগাযোগ ও মানচিত্র','View product ↗':'পণ্য দেখুন ↗'
};
for(const [key,val] of Object.entries(ABOUT_NEW))EN.set(key,val);

const EXTRAS = {
 'Products':'পণ্যসমূহ','Product':'পণ্য','All':'সব','Explore':'দেখুন','Explore collection':'কালেকশন দেখুন',
 'Three-piece':'থ্রি-পিস','Matching sets':'মানানসই সেট',
 'Kurti and tops':'কুর্তি ও টপস','Everyday wear':'প্রতিদিনের পোশাক',
 'Hijab and orna':'হিজাব ও ওড়না','Soft and light':'নরম ও হালকা',
 'Bags and jewellery':'ব্যাগ ও গয়না','Finishing touches':'স্টাইলের পূর্ণতা',
 'Tangail, silk and cotton':'টাঙ্গাইল, সিল্ক ও সুতি','New in':'নতুন',
 'Just added':'সদ্য যুক্ত','View details':'বিস্তারিত দেখুন',
 'Choose options':'বিকল্প বেছে নিন','Currently unavailable':'এই মুহূর্তে পাওয়া যাচ্ছে না',
 'Sold out':'স্টক শেষ','Save':'সাশ্রয়','Wishlist':'পছন্দের তালিকা',
 'Black':'কালো','Purple':'বেগুনি','Green':'সবুজ','Dark Green':'গাঢ় সবুজ',
 'Red':'লাল','Blue':'নীল','Royal Blue':'রয়্যাল ব্লু','Yellow':'হলুদ',
 'White':'সাদা','Off-white':'অফ-হোয়াইট','Pink':'গোলাপি','Maroon':'মেরুন',
 'Gold':'সোনালি','Orange':'কমলা','Navy':'নেভি','Teal':'টিল',
 'Mustard':'সরিষা','Coral':'কোরাল','Olive':'অলিভ','Rose':'গোলাপি',
 'Emerald':'পান্না সবুজ','Wine':'ওয়াইন','Sky':'আকাশি',
 'Peacock':'ময়ূর রং','Standard':'সাধারণ','Brown':'বাদামি',
 'Total':'সর্বমোট','Shop now':'এখনই কিনুন','Shop collection':'কালেকশন দেখুন',
 'Color':'রং','Colour':'রং','Choose color':'রং বেছে নিন',
 'Choose colour':'রং বেছে নিন','Select size':'সাইজ বেছে নিন',
 'See details':'বিস্তারিত দেখুন','Select options':'বিকল্প বেছে নিন',
 'Loading...':'লোড হচ্ছে…','No products found':'কোনো পণ্য পাওয়া যায়নি',
 'Continue':'এগিয়ে যান','Pay now':'এখন পেমেন্ট করুন',
 'Order received':'অর্ডার গ্রহণ করা হয়েছে',
 'SHOPYHAT. All rights reserved.':'SHOPYHAT। সর্বস্বত্ব সংরক্ষিত।',
 'Your order is being processed':'আপনার অর্ডার প্রক্রিয়াধীন',
 'Order ID':'অর্ডার আইডি','Transaction ID':'ট্রানজ্যাকশন আইডি',
 'Sender mobile':'প্রেরকের মোবাইল','Payment verification':'পেমেন্ট যাচাই',
 'Manual verification':'ম্যানুয়াল যাচাই','Manual transfer':'ম্যানুয়াল ট্রান্সফার',
 'Verification required':'যাচাই আবশ্যক','Order placed':'অর্ডার দেওয়া হয়েছে',
 'Contact support':'সহায়তার জন্য যোগাযোগ করুন',
 'Reviews & Support':'রিভিউ ও সহায়তা','Reviews & Issue Support':'রিভিউ ও সমস্যা সমাধান',
 'About Us':'আমাদের সম্পর্কে','About SHOPYHAT':'SHOPYHAT সম্পর্কে','Our Story':'আমাদের গল্প',
 'SHOPYHAT · SINCE 2020':'SHOPYHAT · ২০২০ সাল থেকে',
 'Style that feels':'আপনার নিজস্ব স্টাইল','like you.':'আপনার মতো করে।',
 'Welcome to SHOPYHAT — an online fashion and lifestyle destination, bringing thoughtfully presented sarees, women\'s fashion, clothing and accessories together in one convenient shopping experience.':'SHOPYHAT-এ স্বাগতম—শাড়ি, নারীদের পোশাক ও ফ্যাশন সামগ্রীর একটি সহজ অনলাইন শপিং গন্তব্য।',
 'Explore our collection':'আমাদের কালেকশন দেখুন','Talk to our team':'আমাদের টিমের সঙ্গে কথা বলুন',
 'YOUR CHOICE, OUR GIFT.':'আপনার পছন্দ, আমাদের উপহার।','ESTABLISHED 2020 · BANGLADESH':'প্রতিষ্ঠিত ২০২০ · বাংলাদেশ',
 'A simple idea: making personal style easier to discover.':'সহজ একটি ভাবনা: নিজের পছন্দের স্টাইল খুঁজে পাওয়া আরও সহজ করা।',
 'SHOPYHAT was established in 2020 with a focus on offering fashion and lifestyle choices through an accessible online storefront. We showcase product details and available options so shoppers can choose the pieces that fit their taste and occasion.':'২০২০ সালে প্রতিষ্ঠিত SHOPYHAT অনলাইনে ফ্যাশন ও লাইফস্টাইল পণ্য সহজে খুঁজে পাওয়ার সুযোগ তৈরি করতে কাজ করে। পণ্যের তথ্য ও বিকল্পগুলো সাজিয়ে দিই, যাতে আপনি নিজের পছন্দ অনুযায়ী বেছে নিতে পারেন।',
 'Choice & Style':'পছন্দ ও স্টাইল','Shopping Made Easier':'সহজ কেনাকাটা','Support That Listens':'আপনার কথা শোনে যে সাপোর্ট',
 'Discover sarees, women\'s clothing and accessories in one place, with clear colors and product details.':'শাড়ি, নারীদের পোশাক ও অ্যাক্সেসরিজ দেখুন এক জায়গায়, স্পষ্ট রঙ ও পণ্যের বিস্তারিতসহ।',
 'Browse products, choose variants and place an order with an organized online checkout process.':'পণ্য দেখুন, রং ও ভ্যারিয়েন্ট নির্বাচন করুন এবং সহজ চেকআউটে অর্ডার দিন।',
 'Ask product questions, share reviews or submit a support case with updates from the SHOPYHAT team.':'পণ্য সম্পর্কে জানুন, রিভিউ দিন অথবা সাপোর্ট কেস তৈরি করে আপডেট দেখুন।',
 'FOLLOW OUR JOURNEY':'আমাদের সঙ্গে থাকুন','Connect with SHOPYHAT':'SHOPYHAT-এর সঙ্গে যুক্ত থাকুন',
 'Follow our official Facebook page for updates and message us with questions. For formal order issues, use our support case system so your request can be tracked.':'নতুন আপডেটের জন্য আমাদের Facebook পেজ অনুসরণ করুন। অর্ডার-সংক্রান্ত অভিযোগ ট্র্যাক করতে সাপোর্ট কেস ব্যবহার করুন।',
 'Visit our Facebook page ↗':'আমাদের Facebook পেজ দেখুন ↗','We are based in Dhaka':'আমাদের অবস্থান ঢাকা',
 'Contact & Location':'যোগাযোগ ও অবস্থান','VISIT & CONNECT':'ঠিকানা ও যোগাযোগ','Find our location':'আমাদের অবস্থান দেখুন',
 'Open Google Maps ↗':'Google Maps খুলুন ↗','Get directions ↗':'দিকনির্দেশনা দেখুন ↗','Our Address':'আমাদের ঠিকানা',
 'Map shows the searched address; please confirm the exact entrance with our team before visiting.':'ম্যাপে উল্লেখিত ঠিকানা অনুসন্ধান করা হয়েছে; আসার আগে সঠিক প্রবেশপথ আমাদের টিমের সঙ্গে নিশ্চিত করুন।',
 'Contact & Location':'যোগাযোগ ও ঠিকানা',
 'Our Story':'আমাদের গল্প'
};
for(const [en,bn] of Object.entries(EXTRAS))EN.set(en,bn);
// Text fragments are intentionally separate: HTML templates wrap numbers and names
// in nested <strong> or <a> elements, so the browser produces several text nodes.
const FRAGMENTS = {
 'Open your':'আপনার',
 'app, choose':'অ্যাপ খুলে বেছে নিন',
 'and send':'এবং পাঠান',
 ', and send':'এবং পাঠান',
 'to the number below.':'নিচের নম্বরে।',
 'Steps:':'ধাপগুলো:',
 'Thank you,':'ধন্যবাদ,',
 '. Order total:':'। অর্ডারের মোট মূল্য:',
 'Your provided Transaction ID':'আপনার দেওয়া ট্রানজ্যাকশন আইডি',
 'must be matched with our official':'আমাদের অফিসিয়াল',
 'transaction history before the order is marked paid. Do not pay twice if you have already transferred.':'লেনদেনের ইতিহাসের সঙ্গে মিলিয়ে নেওয়ার পরই অর্ডার পরিশোধিত দেখানো হবে। আগে টাকা পাঠিয়ে থাকলে আবার পেমেন্ট করবেন না।',
 'Send your order details to us for manual review. Keep your Order ID for support and tracking.':'ম্যানুয়াল যাচাইয়ের জন্য অর্ডারের তথ্য আমাদের পাঠান। সহায়তা ও ট্র্যাকিংয়ের জন্য অর্ডার আইডি সংরক্ষণ করুন।',
 'Cash on delivery · Delivery across Bangladesh':'ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ডেলিভারি',
 'Cash on delivery   ·   Delivery across Bangladesh':'ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ডেলিভারি',
 'Delivery:':'ডেলিভারি:',
 'inside Dhaka,':'ঢাকার ভিতরে,',
 'outside Dhaka. Pay on delivery. If the item is damaged, defective or wrong, contact us within 3 calendar days.':'ঢাকার বাইরে। পণ্য হাতে পেয়ে টাকা দিন। ক্ষতিগ্রস্ত, ত্রুটিপূর্ণ বা ভুল পণ্য পেলে ৩ দিনের মধ্যে যোগাযোগ করুন।',
 'This coupon code is not valid.':'এই কুপন কোডটি গ্রহণযোগ্য নয়।',
 'Confirm your selected colours, quantities and delivery address before payment.':'পেমেন্টের আগে নির্বাচিত রং, পরিমাণ ও ডেলিভারি ঠিকানা যাচাই করুন।',
 'Search products':'পণ্য খুঁজুন',
 'Search products...':'পণ্য খুঁজুন...',
 'What are you looking for?':'আপনি কী খুঁজছেন?',
 'Your favourites':'আপনার পছন্দের পণ্য',
 'Continue shopping':'কেনাকাটা চালিয়ে যান',
 'Open menu':'মেনু খুলুন',
 'SHOPYHAT home':'SHOPYHAT হোম',
 'Inside Dhaka,':'ঢাকার ভিতরে,',
 'Outside Dhaka,':'ঢাকার বাইরে,',
 'Close':'বন্ধ করুন',
 'New pieces are on their way. Explore our shop for more styles.':'নতুন পণ্য আসছে। আরও কালেকশন দেখতে শপ ঘুরে দেখুন।',
 'No matching products. Try a different search or clear filters.':'কোনো পণ্য পাওয়া যায়নি। অন্যভাবে খুঁজুন বা ফিল্টার মুছে দিন।',
 'No products match your filters.':'আপনার ফিল্টারের সঙ্গে কোনো পণ্য মিলছে না।',
 'Available':'পাওয়া যাচ্ছে',
 'available':'পাওয়া যাচ্ছে',
 'styles':'ধরন',
 'style':'ধরন',
 'colours':'রং',
 'colour':'রং',
 'size':'সাইজ',
 'Remove from wishlist':'পছন্দের তালিকা থেকে সরান',
 'Add to wishlist':'পছন্দের তালিকায় রাখুন'
};
for(const [en,bn] of Object.entries(FRAGMENTS))EN.set(en,bn);


// Shared customer, account and staff interface labels.
const SHOPYHAT_UI = {
 "Shop ⌄": "শপ ⌄",
 "New Arrivals": "নতুন সংগ্রহ",
 "My Account": "আমার অ্যাকাউন্ট",
 "← Continue shopping": "← কেনাকাটা চালিয়ে যান",
 "Loading your account…": "অ্যাকাউন্ট লোড হচ্ছে…",
 "Welcome back": "আবার স্বাগতম",
 "Sign in to manage orders, saved details and notifications.": "অর্ডার, সেভ করা তথ্য ও নোটিফিকেশন দেখতে সাইন ইন করুন।",
 "Customer account access": "গ্রাহক অ্যাকাউন্টে প্রবেশ",
 "Sign in": "সাইন ইন",
 "Sign in →": "সাইন ইন →",
 "Signing in…": "সাইন ইন হচ্ছে…",
 "Sign out": "সাইন আউট",
 "Signing out…": "সাইন আউট হচ্ছে…",
 "Create account": "অ্যাকাউন্ট খুলুন",
 "Create an account": "অ্যাকাউন্ট খুলুন",
 "Create my account →": "অ্যাকাউন্ট খুলুন →",
 "New to SHOPYHAT?": "SHOPYHAT-এ নতুন?",
 "Protected account access": "সুরক্ষিত অ্যাকাউন্ট",
 "Email address": "ইমেইল ঠিকানা",
 "Password": "পাসওয়ার্ড",
 "Show": "দেখুন",
 "Hide": "লুকান",
 "Show password": "পাসওয়ার্ড দেখুন",
 "Hide password": "পাসওয়ার্ড লুকান",
 "Forgot password?": "পাসওয়ার্ড ভুলে গেছেন?",
 "Forgot your password?": "পাসওয়ার্ড ভুলে গেছেন?",
 "ACCOUNT RECOVERY": "অ্যাকাউন্ট পুনরুদ্ধার",
 "Back to sign in": "সাইন ইনে ফিরুন",
 "← Back to sign in": "← সাইন ইনে ফিরুন",
 "Back to My Account": "আমার অ্যাকাউন্টে ফিরুন",
 "Sign in to My Account": "অ্যাকাউন্টে সাইন ইন করুন",
 "Send password reset link →": "পাসওয়ার্ড রিসেট লিংক পাঠান →",
 "Sending…": "পাঠানো হচ্ছে…",
 "Account email": "অ্যাকাউন্টের ইমেইল",
 "Enter your account email to receive a secure recovery link. No SMS OTP is required.": "নিরাপদ রিসেট লিংক পেতে অ্যাকাউন্টের ইমেইল দিন। এসএমএস কোড লাগবে না।",
 "If the address is registered, a reset email has been sent. Enter its code below or follow the reset link. Check spam too.": "এই ইমেইলে অ্যাকাউন্ট থাকলে রিসেট বার্তা পাঠানো হয়েছে। নিচে কোড দিন অথবা ইমেইলের লিংক খুলুন। স্প্যাম ফোল্ডারও দেখুন।",
 "Check your inbox": "ইনবক্স দেখুন",
 "Recovery code": "রিসেট কোড",
 "Verify code →": "কোড যাচাই করুন →",
 "Verification code": "যাচাইকরণ কোড",
 "Enter a verification code": "যাচাইকরণ কোড দিন",
 "Verify and continue →": "যাচাই করে এগিয়ে যান →",
 "Verify your email": "ইমেইল যাচাই করুন",
 "Resend verification email": "যাচাইকরণ ইমেইল আবার পাঠান",
 "Email verification is required.": "ইমেইল যাচাই করা আবশ্যক।",
 "Secure your account": "অ্যাকাউন্ট সুরক্ষিত করুন",
 "Choose a password and add an email for account recovery.": "অ্যাকাউন্ট পুনরুদ্ধারের জন্য একটি পাসওয়ার্ড ও ইমেইল দিন।",
 "Your delivery address is only needed when you place an order.": "অর্ডার করার সময় ডেলিভারি ঠিকানা দিতে হবে।",
 "Creating account for": "যার জন্য অ্যাকাউন্ট খোলা হচ্ছে",
 "← Back to personal details": "← ব্যক্তিগত তথ্যে ফিরুন",
 "Check your account": "আপনার অ্যাকাউন্ট দেখুন",
 "Continue →": "এগিয়ে যান →",
 "Create password": "পাসওয়ার্ড তৈরি করুন",
 "New password": "নতুন পাসওয়ার্ড",
 "New Password": "নতুন পাসওয়ার্ড",
 "Confirm new password": "নতুন পাসওয়ার্ড আবার লিখুন",
 "Confirm New Password": "নতুন পাসওয়ার্ড আবার লিখুন",
 "Confirm password": "পাসওয়ার্ড আবার লিখুন",
 "Confirm Password": "পাসওয়ার্ড আবার লিখুন",
 "Update password": "পাসওয়ার্ড আপডেট করুন",
 "Update Password": "পাসওয়ার্ড আপডেট করুন",
 "Set a new password": "নতুন পাসওয়ার্ড সেট করুন",
 "Open this page from the recovery link sent to your account email.": "অ্যাকাউন্টের ইমেইলে পাঠানো রিসেট লিংক থেকে এই পেজ খুলুন।",
 "Verifying recovery link…": "রিসেট লিংক যাচাই হচ্ছে…",
 "Your link has been verified. Set a new password.": "লিংক যাচাই হয়েছে। নতুন পাসওয়ার্ড সেট করুন।",
 "This recovery link is invalid or expired. Request a new one from My Account.": "রিসেট লিংকটি অকার্যকর বা মেয়াদ শেষ। আমার অ্যাকাউন্ট থেকে নতুন লিংক চান।",
 "Password updated. Return to SHOPYHAT and sign in with your new password.": "পাসওয়ার্ড আপডেট হয়েছে। SHOPYHAT-এ ফিরে নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।",
 "Reset Password": "পাসওয়ার্ড রিসেট",
 "SHOPYHAT Account": "SHOPYHAT অ্যাকাউন্ট",
 "Checking your confirmation link…": "নিশ্চিতকরণ লিংক যাচাই হচ্ছে…",
 "Password strength estimate": "পাসওয়ার্ডের শক্তির আনুমানিক মান",
 "No password entered": "পাসওয়ার্ড লেখা হয়নি",
 "Use a unique password. Aim for at least 15 characters or several unrelated words.": "আলাদা একটি পাসওয়ার্ড দিন। অন্তত ১৫ অক্ষর বা পরস্পরের সঙ্গে সম্পর্কহীন কয়েকটি শব্দ ব্যবহার করুন।",
 "Too short. Use at least 8 characters. Aim for 15 or more.": "খুব ছোট। অন্তত ৮ অক্ষর দিন, সম্ভব হলে ১৫ বা তার বেশি।",
 "Weak. Avoid common words, repeated characters and sequences. Try several unrelated words.": "দুর্বল। পরিচিত শব্দ, একই অক্ষরের পুনরাবৃত্তি বা ধারাবাহিক সংখ্যা এড়িয়ে কয়েকটি সম্পর্কহীন শব্দ ব্যবহার করুন।",
 "Fair. Add a few more characters or another unrelated word.": "মাঝারি। আরও কয়েকটি অক্ষর বা একটি সম্পর্কহীন শব্দ যোগ করুন।",
 "Strong. Use this password only for SHOPYHAT.": "শক্তিশালী। এই পাসওয়ার্ড শুধু SHOPYHAT-এ ব্যবহার করুন।",
 "Too short": "খুব ছোট",
 "Weak": "দুর্বল",
 "Fair": "মাঝারি",
 "Strong": "শক্তিশালী",
 "Passwords do not match.": "পাসওয়ার্ড দুটি মিলছে না।",
 "Use a password of at least 8 characters.": "অন্তত ৮ অক্ষরের পাসওয়ার্ড দিন।",
 "Choose at least 8 characters.": "অন্তত ৮ অক্ষর ব্যবহার করুন।",
 "Choose a password different from your current password.": "বর্তমান পাসওয়ার্ড থেকে আলাদা একটি পাসওয়ার্ড দিন।",
 "Password updated. Use your new password next time you sign in.": "পাসওয়ার্ড আপডেট হয়েছে। পরেরবার নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।",
 "Email or password is incorrect. Please try again or select Forgot password.": "ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন অথবা পাসওয়ার্ড রিসেট করুন।",
 "Please verify your email before signing in.": "সাইন ইন করার আগে ইমেইল যাচাই করুন।",
 "Email verified. Welcome to SHOPYHAT!": "ইমেইল যাচাই হয়েছে। SHOPYHAT-এ স্বাগতম!",
 "Profile": "প্রোফাইল",
 "Edit profile": "প্রোফাইল সম্পাদনা করুন",
 "Edit Profile": "প্রোফাইল সম্পাদনা করুন",
 "Recent changes": "সাম্প্রতিক পরিবর্তন",
 "Loading recent changes…": "সাম্প্রতিক পরিবর্তন লোড হচ্ছে…",
 "No profile changes recorded yet.": "এখনো প্রোফাইল পরিবর্তনের কোনো রেকর্ড নেই।",
 "Could not load recent changes. Reopen Profile to try again.": "পরিবর্তনগুলো লোড করা যায়নি। প্রোফাইল আবার খুলুন।",
 "Manage your contact details for delivery and support.": "ডেলিভারি ও সহায়তার জন্য যোগাযোগের তথ্য দেখুন বা বদলান।",
 "Enter the mobile number you want us to use for deliveries and support. Your sign-in email stays the same.": "ডেলিভারি ও সহায়তার জন্য যে মোবাইল নম্বর ব্যবহার করবেন তা দিন। সাইন ইন ইমেইল একই থাকবে।",
 "Use a Bangladesh mobile number, for example 01XXXXXXXXX.": "বাংলাদেশের মোবাইল নম্বর দিন, যেমন 01XXXXXXXXX।",
 "Enter a valid Bangladesh mobile number.": "বাংলাদেশের একটি সঠিক মোবাইল নম্বর দিন।",
 "Enter a valid Bangladeshi mobile number.": "বাংলাদেশের একটি সঠিক মোবাইল নম্বর দিন।",
 "Enter a name with at least 2 characters.": "অন্তত ২ অক্ষরের নাম দিন।",
 "Please enter your full name.": "আপনার পূর্ণ নাম দিন।",
 "Enter your full name.": "আপনার পূর্ণ নাম দিন।",
 "Full name": "পূর্ণ নাম",
 "Full Name": "পূর্ণ নাম",
 "Mobile number": "মোবাইল নম্বর",
 "Mobile Number": "মোবাইল নম্বর",
 "Phone number": "ফোন নম্বর",
 "Sign-in email": "সাইন ইন ইমেইল",
 "Not added": "যোগ করা হয়নি",
 "Security": "নিরাপত্তা",
 "Change the password you use to sign in.": "সাইন ইন করার পাসওয়ার্ড পরিবর্তন করুন।",
 "Save changes": "পরিবর্তন সেভ করুন",
 "Saving…": "সেভ হচ্ছে…",
 "Updating…": "আপডেট হচ্ছে…",
 "Profile updated.": "প্রোফাইল আপডেট হয়েছে।",
 "You have no changes to save.": "সেভ করার মতো কোনো পরিবর্তন নেই।",
 "Delivery addresses": "ডেলিভারি ঠিকানা",
 "Delivery address": "ডেলিভারি ঠিকানা",
 "Delivery Address": "ডেলিভারি ঠিকানা",
 "Delivery zone": "ডেলিভারি এলাকা",
 "Delivery Zone": "ডেলিভারি এলাকা",
 "Delivery zone and fee": "ডেলিভারি এলাকা ও চার্জ",
 "Saved delivery address": "সেভ করা ডেলিভারি ঠিকানা",
 "Saved address": "সেভ করা ঠিকানা",
 "Address label": "ঠিকানার নাম",
 "Home, office, or another name": "বাসা, অফিস বা অন্য নাম",
 "Default": "ডিফল্ট",
 "(default)": "(ডিফল্ট)",
 "Add address": "ঠিকানা যোগ করুন",
 "Edit address": "ঠিকানা সম্পাদনা করুন",
 "Make default": "ডিফল্ট করুন",
 "Remove": "সরান",
 "Add delivery address": "ডেলিভারি ঠিকানা যোগ করুন",
 "Edit delivery address": "ডেলিভারি ঠিকানা সম্পাদনা করুন",
 "Save address": "ঠিকানা সেভ করুন",
 "Address saved.": "ঠিকানা সেভ হয়েছে।",
 "Address removed.": "ঠিকানা সরানো হয়েছে।",
 "Removing address…": "ঠিকানা সরানো হচ্ছে…",
 "Default address updated.": "ডিফল্ট ঠিকানা আপডেট হয়েছে।",
 "Updating default…": "ডিফল্ট ঠিকানা আপডেট হচ্ছে…",
 "Remove this saved address from your account?": "অ্যাকাউন্ট থেকে সেভ করা এই ঠিকানাটি সরাবেন?",
 "Save your name and mobile number in Profile first.": "আগে প্রোফাইলে নাম ও মোবাইল নম্বর সেভ করুন।",
 "Go to Profile": "প্রোফাইলে যান",
 "Save up to 10 addresses. Your default appears first at checkout, where you can choose a different one.": "১০টি পর্যন্ত ঠিকানা সেভ করুন। চেকআউটে ডিফল্ট ঠিকানা আগে আসবে এবং সেখান থেকে অন্য ঠিকানাও বেছে নিতে পারবেন।",
 "No delivery addresses saved yet.": "এখনো কোনো ডেলিভারি ঠিকানা সেভ করা হয়নি।",
 "Enter enough detail for the courier to find you.": "কুরিয়ার যেন সহজে ঠিকানা খুঁজে পায়, সে জন্য প্রয়োজনীয় তথ্য দিন।",
 "Required fields": "আবশ্যক ফিল্ড",
 "(optional)": "(ঐচ্ছিক)",
 "Division": "বিভাগ",
 "Select division": "বিভাগ বেছে নিন",
 "District": "জেলা",
 "Thana / Upazila": "থানা / উপজেলা",
 "Area / Village": "এলাকা / গ্রাম",
 "House, road or village details": "বাড়ি, রাস্তা বা গ্রামের বিস্তারিত",
 "Landmark or delivery point": "চেনার স্থান বা ডেলিভারি পয়েন্ট",
 "House and road, block, or village and local directions": "বাড়ি ও রাস্তা, ব্লক, অথবা গ্রাম ও স্থানীয় দিকনির্দেশ",
 "e.g. Dhaka": "যেমন ঢাকা",
 "e.g. Dhanmondi": "যেমন ধানমন্ডি",
 "e.g. West Dhanmondi": "যেমন পশ্চিম ধানমন্ডি",
 "e.g. Near the main gate": "যেমন প্রধান গেটের কাছে",
 "Barishal": "বরিশাল",
 "Chattogram": "চট্টগ্রাম",
 "Dhaka": "ঢাকা",
 "Khulna": "খুলনা",
 "Mymensingh": "ময়মনসিংহ",
 "Rajshahi": "রাজশাহী",
 "Rangpur": "রংপুর",
 "Sylhet": "সিলেট",
 "Select your division.": "আপনার বিভাগ বেছে নিন।",
 "Enter your district.": "আপনার জেলা লিখুন।",
 "Enter your thana or upazila.": "আপনার থানা বা উপজেলা লিখুন।",
 "Enter at least four characters of house, road or village details.": "বাড়ি, রাস্তা বা গ্রামের বিবরণ অন্তত চার অক্ষরে লিখুন।",
 "Shorten your full address to 400 characters or fewer.": "সম্পূর্ণ ঠিকানা ৪০০ অক্ষরের মধ্যে লিখুন।",
 "Enter a different address": "অন্য ঠিকানা লিখুন",
 "Any edits here apply only to this order.": "এখানে করা পরিবর্তন শুধু এই অর্ডারের জন্য প্রযোজ্য।",
 "Email for order updates (optional)": "অর্ডার আপডেটের ইমেইল (ঐচ্ছিক)",
 "We’ll use this address for order and payment confirmations.": "অর্ডার ও পেমেন্ট নিশ্চিতকরণের বার্তা এই ইমেইলে যাবে।",
 "Enter a valid email address.": "সঠিক ইমেইল ঠিকানা দিন।",
 "Order history": "অর্ডারের ইতিহাস",
 "No orders yet.": "এখনো কোনো অর্ডার নেই।",
 "There are no more orders.": "আর কোনো অর্ডার নেই।",
 "Report an issue": "সমস্যা জানান",
 "See your account orders, track delivery or get help with an order. To find a guest order,": "অ্যাকাউন্টের অর্ডার দেখুন, ডেলিভারি ট্র্যাক করুন বা সহায়তা নিন। অতিথি হিসেবে দেওয়া অর্ডার খুঁজতে",
 "track it by order number and mobile": "অর্ডার নম্বর ও মোবাইল দিয়ে ট্র্যাক করুন",
 "Notifications": "নোটিফিকেশন",
 "Choose which alerts you want. Browser notifications are shown while the shop is open, after you grant permission.": "কোন নোটিফিকেশন পেতে চান তা বেছে নিন। অনুমতি দিলে শপ খোলা অবস্থায় ব্রাউজারে নোটিফিকেশন দেখাবে।",
 "Save preferences": "পছন্দ সেভ করুন",
 "Preferences saved.": "পছন্দ সেভ হয়েছে।",
 "Allow browser notifications": "ব্রাউজার নোটিফিকেশনের অনুমতি দিন",
 "Notify me about saved products": "সেভ করা পণ্যের খবর দিন",
 "Inbox": "ইনবক্স",
 "Mark all as read": "সবগুলো পড়া হয়েছে হিসেবে চিহ্নিত করুন",
 "No notifications yet.": "এখনো কোনো নোটিফিকেশন নেই।",
 "Restock alerts": "স্টকে ফেরার খবর",
 "Low stock": "স্টক কম",
 "New arrivals": "নতুন সংগ্রহ",
 "New offers": "নতুন অফার",
 "Order updates": "অর্ডারের আপডেট",
 "Saved items": "পছন্দের পণ্য",
 "Try again": "আবার চেষ্টা করুন",
 "Could not load this section. Please try again.": "এই অংশ লোড হয়নি। আবার চেষ্টা করুন।",
 "Could not save. Please try again.": "সেভ করা যায়নি। আবার চেষ্টা করুন।",
 "Could not update your saved addresses. Try again.": "সেভ করা ঠিকানা আপডেট হয়নি। আবার চেষ্টা করুন।",
 "Previous": "আগেরটি",
 "Next": "পরেরটি",
 "Order note (optional)": "অর্ডারের নোট (ঐচ্ছিক)",
 "Anything we should know?": "বিশেষ কিছু জানাতে চান?",
 "Place order": "অর্ডার করুন",
 "Cancel": "বাতিল করুন",
 "Name": "নাম",
 "Status": "অবস্থা",
 "Payment": "পেমেন্ট",
 "Confirm": "নিশ্চিত করুন",
 "SHOPYHAT | Operations Studio": "SHOPYHAT | পরিচালনা কেন্দ্র",
 "SHOPYHAT Reseller Studio": "SHOPYHAT রিসেলার স্টুডিও",
 "Reset Password | SHOPYHAT": "পাসওয়ার্ড রিসেট | SHOPYHAT",
 "Email Confirmed | SHOPYHAT": "ইমেইল নিশ্চিতকরণ | SHOPYHAT",
 "My Account | SHOPYHAT": "আমার অ্যাকাউন্ট | SHOPYHAT",
 "PRIVATE OPERATIONS STUDIO · Since 2020": "পরিচালনা কেন্দ্র · ২০২০ থেকে",
 "Secure Admin Login": "অ্যাডমিন সাইন ইন",
 "Authorized staff only. Sign in using a one-time email code.": "শুধু অনুমোদিত কর্মীদের জন্য। ইমেইলের একবার ব্যবহারযোগ্য কোড দিয়ে সাইন ইন করুন।",
 "Send login code": "সাইন ইন কোড পাঠান",
 "Email verification code (6–8 digits)": "ইমেইল যাচাইকরণ কোড (৬–৮ সংখ্যা)",
 "Verify & sign in": "যাচাই করে সাইন ইন করুন",
 "Operations Dashboard": "পরিচালনা ড্যাশবোর্ড",
 "Catalog, orders, payments, inventory & access management.": "ক্যাটালগ, অর্ডার, পেমেন্ট, স্টক ও প্রবেশাধিকার পরিচালনা।",
 "↻ Refresh": "↻ রিফ্রেশ করুন",
 "Refresh": "রিফ্রেশ করুন",
 "Products": "পণ্য",
 "Live products": "প্রকাশিত পণ্য",
 "Orders": "অর্ডার",
 "Pending orders": "অপেক্ষমাণ অর্ডার",
 "From Date": "শুরুর তারিখ",
 "To Date": "শেষের তারিখ",
 "Filter by": "ফিল্টারের ধরন",
 "Created Date": "তৈরির তারিখ",
 "Updated Date": "আপডেটের তারিখ",
 "Today": "আজ",
 "Last 7 Days": "গত ৭ দিন",
 "Last 14 Days": "গত ১৪ দিন",
 "Last 30 Days": "গত ৩০ দিন",
 "Last 90 Days": "গত ৯০ দিন",
 "All Time": "সব সময়",
 "Showing all records": "সব রেকর্ড দেখানো হচ্ছে",
 "Business Analytics": "ব্যবসার বিশ্লেষণ",
 "Brand Settings": "ব্র্যান্ড সেটিংস",
 "Categories & Brands": "ক্যাটাগরি ও ব্র্যান্ড",
 "Payment Review": "পেমেন্ট যাচাই",
 "Team Access": "টিমের প্রবেশাধিকার",
 "Activity Log": "কার্যকলাপের রেকর্ড",
 "Reviews": "রিভিউ",
 "Support Cases": "সহায়তার কেস",
 "Catalog Structure & Brand Partners": "ক্যাটালগের কাঠামো ও অংশীদার ব্র্যান্ড",
 "Category / Subcategory Manager": "ক্যাটাগরি ও সাবক্যাটাগরি পরিচালনা",
 "+ Main Category": "+ মূল ক্যাটাগরি",
 "+ Subcategory": "+ সাবক্যাটাগরি",
 "Category Name": "ক্যাটাগরির নাম",
 "URL Slug": "URL পরিচিতি",
 "Hierarchy": "স্তর",
 "Visibility": "প্রকাশের অবস্থা",
 "Sort": "ক্রম",
 "Action": "করণীয়",
 "Actions": "করণীয়",
 "Our Brands / Partner Companies": "আমাদের ব্র্যান্ড ও অংশীদার প্রতিষ্ঠান",
 "+ Add Brand Partner": "+ অংশীদার ব্র্যান্ড যোগ করুন",
 "Logo": "লোগো",
 "Company": "প্রতিষ্ঠান",
 "Official URL": "অফিশিয়াল URL",
 "SHOPYHAT Brand Settings": "SHOPYHAT ব্র্যান্ড সেটিংস",
 "Logo Preview": "লোগোর প্রিভিউ",
 "Loading current logo…": "বর্তমান লোগো লোড হচ্ছে…",
 "Upload / Replace Logo": "লোগো আপলোড বা বদলান",
 "Choose New Logo": "নতুন লোগো বেছে নিন",
 "Upload & Publish Logo": "লোগো আপলোড ও প্রকাশ করুন",
 "Restore Default Logo": "ডিফল্ট লোগো ফিরিয়ে আনুন",
 "Refresh Preview": "প্রিভিউ রিফ্রেশ করুন",
 "How it works": "কীভাবে কাজ করে",
 "Business Analytics & Traffic": "ব্যবসার বিশ্লেষণ ও ট্রাফিক",
 "Export Report CSV": "রিপোর্ট CSV এক্সপোর্ট করুন",
 "Visitors (daily unique sum)": "দৈনিক ইউনিক ভিজিটরের যোগফল",
 "Page Views": "পেজ ভিউ",
 "Orders Placed": "দেওয়া অর্ডার",
 "Order Conversion (estimated)": "অর্ডার রূপান্তর (আনুমানিক)",
 "Order Value (non-cancelled)": "অর্ডারের মূল্য (বাতিল বাদে)",
 "Paid Order Value": "পরিশোধিত অর্ডারের মূল্য",
 "Average Order Value": "অর্ডারের গড় মূল্য",
 "Pending / Failed Payments": "অপেক্ষমাণ / ব্যর্থ পেমেন্ট",
 "Active Products": "সক্রিয় পণ্য",
 "Customer Reviews / Avg Rating": "গ্রাহকের রিভিউ / গড় রেটিং",
 "Open Support Cases": "চলমান সহায়তা কেস",
 "Resolution Rate": "সমাধানের হার",
 "Traffic by Day": "দিনভিত্তিক ট্রাফিক",
 "Order Status Mix": "স্ট্যাটাস অনুযায়ী অর্ডার",
 "Top Products — Quantity": "পরিমাণ অনুযায়ী শীর্ষ পণ্য",
 "Product": "পণ্য",
 "Units": "পরিমাণ",
 "Line Value": "পণ্যের মোট মূল্য",
 "Popular Pages": "জনপ্রিয় পেজ",
 "Page": "পেজ",
 "Views": "ভিউ",
 "Visitors": "ভিজিটর",
 "Database Capacity & Archive Readiness": "ডেটাবেসের ধারণক্ষমতা ও আর্কাইভ প্রস্তুতি",
 "Manual Archive Request": "ম্যানুয়াল আর্কাইভ অনুরোধ",
 "Request Reason (optional)": "অনুরোধের কারণ (ঐচ্ছিক)",
 "Open Google Sheets Backup": "Google Sheets ব্যাকআপ খুলুন",
 "Generate Archive Review Request": "আর্কাইভ যাচাইয়ের অনুরোধ তৈরি করুন",
 "Recent Archive Requests": "সাম্প্রতিক আর্কাইভ অনুরোধ",
 "Created": "তৈরির সময়",
 "Requested By": "অনুরোধকারী",
 "Database Size": "ডেটাবেসের আকার",
 "6+ Month Audit Rows": "৬ মাসের বেশি পুরোনো অডিট রেকর্ড",
 "Product Catalog": "পণ্যের ক্যাটালগ",
 "All Collections": "সব কালেকশন",
 "All Subcategories": "সব সাবক্যাটাগরি",
 "＋ Bulk Add Products": "＋ একসঙ্গে পণ্য যোগ করুন",
 "＋ Add Product": "＋ পণ্য যোগ করুন",
 "Price": "মূল্য",
 "Colors": "রং",
 "Updated By / Date": "আপডেটকারী / তারিখ",
 "Order Management": "অর্ডার পরিচালনা",
 "All statuses": "সব অবস্থা",
 "Pending": "অপেক্ষমাণ",
 "Confirmed": "নিশ্চিত",
 "Processing": "প্রক্রিয়াধীন",
 "Ready to Ship": "পাঠানোর জন্য প্রস্তুত",
 "Shipped": "পাঠানো হয়েছে",
 "Delivered": "ডেলিভারি হয়েছে",
 "Cancelled": "বাতিল",
 "Return Requested": "রিটার্নের অনুরোধ",
 "Returned": "ফেরত এসেছে",
 "All Payments": "সব পেমেন্ট",
 "Cash on Delivery": "ক্যাশ অন ডেলিভারি",
 "Payment Status: All": "পেমেন্টের সব অবস্থা",
 "Paid": "পরিশোধিত",
 "Unpaid": "অপরিশোধিত",
 "Verified": "যাচাইকৃত",
 "Rejected": "প্রত্যাখ্যাত",
 "＋ Create Order": "＋ অর্ডার তৈরি করুন",
 "Export CSV": "CSV এক্সপোর্ট করুন",
 "Photo": "ছবি",
 "Order": "অর্ডার",
 "Customer": "গ্রাহক",
 "Total": "মোট",
 "Method": "পদ্ধতি",
 "Transaction": "লেনদেন",
 "Amount": "পরিমাণ",
 "Reviewed By / Date": "যাচাইকারী / তারিখ",
 "＋ Add Staff": "＋ কর্মী যোগ করুন",
 "Email": "ইমেইল",
 "Role": "ভূমিকা",
 "Access": "প্রবেশাধিকার",
 "Export Audit CSV": "অডিট CSV এক্সপোর্ট করুন",
 "All Sections": "সব বিভাগ",
 "Color Variants": "রঙের ভ্যারিয়েন্ট",
 "Product Photos": "পণ্যের ছবি",
 "Payments": "পেমেন্ট",
 "Staff Access": "কর্মীর প্রবেশাধিকার",
 "Customer Reviews": "গ্রাহকের রিভিউ",
 "Customer Replies": "গ্রাহকের উত্তর",
 "All Actions": "সব কার্যক্রম",
 "INSERT": "যোগ",
 "UPDATE": "আপডেট",
 "DELETE": "মুছুন",
 "Date & Time": "তারিখ ও সময়",
 "User / Role": "ব্যবহারকারী / ভূমিকা",
 "Section": "বিভাগ",
 "Record": "রেকর্ড",
 "Fields Changed": "পরিবর্তিত তথ্য",
 "All Review Statuses": "রিভিউয়ের সব অবস্থা",
 "Legacy hidden": "আগে লুকানো",
 "Published": "প্রকাশিত",
 "Hidden": "লুকানো",
 "Date": "তারিখ",
 "Customer / Rating": "গ্রাহক / রেটিং",
 "Review": "রিভিউ",
 "Updated By": "আপডেটকারী",
 "Customer Issue Resolution": "গ্রাহকের সমস্যা সমাধান",
 "All Case Statuses": "কেসের সব অবস্থা",
 "Submitted": "জমা হয়েছে",
 "Under Review": "পর্যালোচনাধীন",
 "Investigating": "তদন্ত চলছে",
 "Awaiting Customer": "গ্রাহকের উত্তরের অপেক্ষায়",
 "Resolution Proposed": "সমাধান প্রস্তাবিত",
 "Resolved": "সমাধান হয়েছে",
 "Closed": "বন্ধ",
 "Reopened": "আবার খোলা হয়েছে",
 "All Priorities": "সব অগ্রাধিকার",
 "Urgent": "জরুরি",
 "High": "উচ্চ",
 "Normal": "স্বাভাবিক",
 "Low": "কম",
 "Total Cases": "মোট কেস",
 "Open Cases": "খোলা কেস",
 "High / Urgent": "উচ্চ / জরুরি",
 "Case / Date": "কেস / তারিখ",
 "Category": "ক্যাটাগরি",
 "Priority": "অগ্রাধিকার",
 "Assigned To / Updated": "দায়িত্বপ্রাপ্ত / আপডেট",
 "Edit": "সম্পাদনা",
 "Close ✕": "বন্ধ করুন ✕",
 "Close": "বন্ধ করুন",
 "Save": "সেভ করুন",
 "RESELLER STUDIO": "রিসেলার স্টুডিও",
 "← Visit Store": "← স্টোরে যান",
 "Reseller Login": "রিসেলার সাইন ইন",
 "Sign in with the Reseller ID and password provided by SHOPYHAT Admin.": "SHOPYHAT অ্যাডমিনের দেওয়া রিসেলার আইডি ও পাসওয়ার্ড দিয়ে সাইন ইন করুন।",
 "Reseller ID": "রিসেলার আইডি",
 "Forgot password? Contact SHOPYHAT support for an Admin reset.": "পাসওয়ার্ড ভুলে গেলে রিসেটের জন্য SHOPYHAT সহায়তায় যোগাযোগ করুন।",
 "Not registered? Request reseller access": "নিবন্ধন করেননি? রিসেলার অ্যাক্সেসের অনুরোধ করুন",
 "Request reseller access": "রিসেলার অ্যাক্সেসের অনুরোধ করুন",
 "No account is created until SHOPYHAT Admin approves your application.": "SHOPYHAT অ্যাডমিন আবেদন অনুমোদন করলে অ্যাকাউন্ট তৈরি হবে।",
 "Business / Page Name": "ব্যবসা / পেজের নাম",
 "Email (optional)": "ইমেইল (ঐচ্ছিক)",
 "Send Request": "অনুরোধ পাঠান",
 "← Back to Login": "← সাইন ইনে ফিরুন",
 "Request received!": "অনুরোধ গ্রহণ করা হয়েছে!",
 "Thank you,": "ধন্যবাদ,",
 ". Your SHOPYHAT reseller application has been submitted.": "। আপনার SHOPYHAT রিসেলার আবেদন জমা হয়েছে।",
 "Admin review": "অ্যাডমিন পর্যালোচনা",
 "Our team will review your details and contact you using your submitted mobile/email.": "আমাদের টিম তথ্য যাচাই করে আপনার দেওয়া মোবাইল বা ইমেইলে যোগাযোগ করবে।",
 "Get your account": "অ্যাকাউন্ট বুঝে নিন",
 "If approved, you'll receive your Reseller ID and temporary password privately from SHOPYHAT.": "অনুমোদন হলে SHOPYHAT গোপনে রিসেলার আইডি ও অস্থায়ী পাসওয়ার্ড দেবে।",
 "Activate reseller access": "রিসেলার অ্যাক্সেস চালু করুন",
 "Sign in here, change your temporary password and explore stock, wholesale prices and orders.": "এখানে সাইন ইন করে অস্থায়ী পাসওয়ার্ড বদলান। তারপর স্টক, পাইকারি মূল্য ও অর্ডার দেখুন।",
 "Visit SHOPYHAT Store": "SHOPYHAT স্টোরে যান",
 "Contact SHOPYHAT": "SHOPYHAT-এ যোগাযোগ করুন",
 "Change temporary password": "অস্থায়ী পাসওয়ার্ড বদলান",
 "You must set your own password before accessing reseller pricing or customer orders.": "রিসেলার মূল্য বা গ্রাহকের অর্ডার দেখতে আগে নিজের পাসওয়ার্ড সেট করুন।",
 "Save Password": "পাসওয়ার্ড সেভ করুন",
 "PARTNER DASHBOARD": "অংশীদার ড্যাশবোর্ড",
 "Reseller Studio": "রিসেলার স্টুডিও",
 "My Customer Orders": "আমার গ্রাহকদের অর্ডার",
 "Share Links & Sales": "শেয়ার লিংক ও বিক্রয়",
 "Account & Security": "অ্যাকাউন্ট ও নিরাপত্তা",
 "Reseller Product Catalog": "রিসেলার পণ্যের ক্যাটালগ",
 "Only products enabled by SHOPYHAT Admin are shown. Prices and stock are current when refreshed.": "SHOPYHAT অ্যাডমিনের চালু করা পণ্য দেখানো হয়। নতুন মূল্য ও স্টক দেখতে রিফ্রেশ করুন।",
 "↻ Refresh Products": "↻ পণ্য রিফ্রেশ করুন",
 "Find products": "পণ্য খুঁজুন",
 "Availability": "স্টকের অবস্থা",
 "All Products": "সব পণ্য",
 "Available Stock": "স্টকে আছে",
 "Out of Stock": "স্টক শেষ",
 "Sort by": "সাজানোর ধরন",
 "Product Name": "পণ্যের নাম",
 "Newest Listed": "নতুন তালিকাভুক্ত আগে",
 "Highest Gross Margin": "সর্বোচ্চ মোট মার্জিন আগে",
 "Lowest Retail Price": "সর্বনিম্ন খুচরা মূল্য আগে",
 "Refresh status": "অবস্থা রিফ্রেশ করুন",
 "My Reseller Store Link": "আমার রিসেলার স্টোর লিংক",
 "My Store": "আমার স্টোর",
 "Your link will appear here": "আপনার লিংক এখানে দেখা যাবে",
 "Copy Store Link": "স্টোর লিংক কপি করুন",
 "Preview My Store": "আমার স্টোরের প্রিভিউ",
 "Referral Link Orders": "রেফারেল লিংকের অর্ডার",
 "Account & Password": "অ্যাকাউন্ট ও পাসওয়ার্ড",
 "Add Customer Order": "গ্রাহকের অর্ডার যোগ করুন",
 "Customer Name": "গ্রাহকের নাম",
 "Customer Mobile": "গ্রাহকের মোবাইল",
 "Customer email for updates (optional)": "আপডেটের জন্য গ্রাহকের ইমেইল (ঐচ্ছিক)",
 "Full Delivery Address": "সম্পূর্ণ ডেলিভারি ঠিকানা",
 "Select delivery zone": "ডেলিভারি এলাকা বেছে নিন",
 "Select zone": "এলাকা বেছে নিন",
 "Inside Dhaka": "ঢাকার ভেতর",
 "Outside Dhaka": "ঢাকার বাইরে",
 "Quantity": "পরিমাণ",
 "Customer Selling Price (৳)": "গ্রাহকের জন্য বিক্রয়মূল্য (৳)",
 "Customer has authorized me to provide their delivery details to SHOPYHAT.": "গ্রাহক তার ডেলিভারি তথ্য SHOPYHAT-কে দেওয়ার অনুমতি দিয়েছেন।",
 "Send Order Request": "অর্ডারের অনুরোধ পাঠান",
 "Product Media Library": "পণ্যের মিডিয়া লাইব্রেরি",
 "Download approved product photos for sharing.": "শেয়ার করার জন্য অনুমোদিত পণ্যের ছবি ডাউনলোড করুন।",
 "No records yet.": "এখনো কোনো রেকর্ড নেই।",
 "Placed": "অর্ডারের তারিখ",
 "Settlement": "নিষ্পত্তি",
 "Delivery": "ডেলিভারি",
 "Cancellation requested — awaiting admin review.": "বাতিলের অনুরোধ করা হয়েছে। অ্যাডমিন পর্যালোচনা করবেন।",
 "Cancellation request declined.": "বাতিলের অনুরোধ প্রত্যাখ্যাত হয়েছে।",
 "Cancellation approved.": "বাতিল অনুমোদিত হয়েছে।",
 "Request cancellation": "বাতিলের অনুরোধ করুন",
 "Product total": "পণ্যের মোট মূল্য",
 "Estimated margin": "আনুমানিক মার্জিন",
 "Store price": "স্টোরের মূল্য",
 "Wholesale cost": "পাইকারি মূল্য",
 "Gross margin": "মোট মার্জিন",
 "Your customer selling price (৳)": "গ্রাহকের জন্য আপনার বিক্রয়মূল্য (৳)",
 "Update Price": "মূল্য আপডেট করুন",
 "Save Selling Price": "বিক্রয়মূল্য সেভ করুন",
 "Use Store Price": "স্টোরের মূল্য ব্যবহার করুন",
 "View changes": "পরিবর্তন দেখুন",
 "Before": "আগে",
 "After": "পরে",
 "Field": "ফিল্ড",
 "Edit / Photos": "সম্পাদনা / ছবি",
 "Delete": "মুছুন",
 "No products found": "কোনো পণ্য পাওয়া যায়নি",
 "Process / Invoice": "প্রক্রিয়া / ইনভয়েস",
 "No matching orders": "মিল আছে এমন অর্ডার নেই",
 "No payment reviews": "যাচাইয়ের জন্য পেমেন্ট নেই",
 "No staff": "কোনো কর্মী নেই",
 "Manage Case": "কেস পরিচালনা",
 "Edit customer and delivery details": "গ্রাহক ও ডেলিভারির তথ্য সম্পাদনা করুন",
 "Save customer details": "গ্রাহকের তথ্য সেভ করুন",
 "Order Status": "অর্ডারের অবস্থা",
 "Courier": "কুরিয়ার",
 "Tracking ID": "ট্র্যাকিং আইডি",
 "Internal Note": "অভ্যন্তরীণ নোট",
 "Save Order Changes": "অর্ডারের পরিবর্তন সেভ করুন",
 "Print Invoice": "ইনভয়েস প্রিন্ট করুন",
 "Confirm COD Collection": "ক্যাশ অন ডেলিভারি সংগ্রহ নিশ্চিত করুন",
 "Email updates": "ইমেইল আপডেট",
 "Activity History": "কার্যকলাপের ইতিহাস",
 "Delivery to": "ডেলিভারি প্রাপক",
 "Variant": "ভ্যারিয়েন্ট",
 "Qty": "পরিমাণ",
 "Save Product & Photos": "পণ্য ও ছবি সেভ করুন",
 "Save & Add Another": "সেভ করে আরেকটি যোগ করুন",
 "Manage Photos": "ছবি পরিচালনা",
 "Your choice, our gift.": "আপনার পছন্দ, আমাদের উপহার।",
 "Continue shopping": "কেনাকাটা চালিয়ে যান",
 "Start shopping": "কেনাকাটা শুরু করুন",
 "No account needed. Enter your delivery details and review your total before placing your order.": "অ্যাকাউন্ট ছাড়াও অর্ডার করতে পারবেন। ডেলিভারির তথ্য লিখুন এবং অর্ডারের আগে মোট মূল্য দেখে নিন।",
 "SHOPYHAT CHECKOUT": "SHOPYHAT চেকআউট",
 "One simple step": "একটি সহজ ধাপ",
 "Almost yours": "আর এক ধাপ",
 "Delivery details": "ডেলিভারির তথ্য",
 "Payment method": "পেমেন্ট পদ্ধতি",
 "Full address (required)": "সম্পূর্ণ ঠিকানা (আবশ্যক)",
 "Enter your full delivery address, including district and division.": "জেলা ও বিভাগসহ সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।",
 "The full address is too long. Shorten it to 400 characters or fewer.": "সম্পূর্ণ ঠিকানা ৪০০ অক্ষরের মধ্যে লিখুন।",
 "Confirming order…": "অর্ডার নিশ্চিত করা হচ্ছে…",
 "Continue securely": "নিরাপদে এগিয়ে যান",
 "Confirm your selected colours, quantities and delivery area before placing your order.": "অর্ডার দেওয়ার আগে নির্বাচিত রং, পরিমাণ ও ডেলিভারি এলাকা দেখে নিন।",
 "Use a JPG/PNG/WebP photo up to 4MB.": "সর্বোচ্চ ৪ এমবির JPG, PNG বা WebP ছবি দিন।",
 "Delivery address saved.": "ডেলিভারি ঠিকানা সেভ হয়েছে।",
 "Preferred delivery address": "পছন্দের ডেলিভারি ঠিকানা",
 "Sign in to your customer account.": "গ্রাহক অ্যাকাউন্টে সাইন ইন করুন।",
 "Sign in to your customer account again.": "গ্রাহক অ্যাকাউন্টে আবার সাইন ইন করুন।",
 "Save your name and mobile number under Profile first.": "আগে প্রোফাইলে নাম ও মোবাইল নম্বর সেভ করুন।",
 "Check your address details and try again.": "ঠিকানার তথ্য দেখে আবার চেষ্টা করুন।",
 "Enter your division, district, thana or upazila, and delivery details.": "বিভাগ, জেলা, থানা বা উপজেলা এবং ডেলিভারি ঠিকানা দিন।",
 "You can save up to 10 addresses.": "সর্বোচ্চ ১০টি ঠিকানা সেভ করতে পারবেন।",
 "Address not found. Reload My Account and try again.": "ঠিকানা পাওয়া যায়নি। আমার অ্যাকাউন্ট আবার খুলে চেষ্টা করুন।",
 "Select an address and try again.": "ঠিকানা বেছে নিয়ে আবার চেষ্টা করুন।",
 "Could not confirm the update. Reload My Account and try again.": "আপডেট নিশ্চিত করা যায়নি। আমার অ্যাকাউন্ট আবার খুলে চেষ্টা করুন।",
 "Could not save your changes. Try again in a moment.": "পরিবর্তন সেভ হয়নি। একটু পর আবার চেষ্টা করুন।",
 "Could not confirm the save. Reload My Account and try again.": "সেভ নিশ্চিত করা যায়নি। আমার অ্যাকাউন্ট আবার খুলে চেষ্টা করুন।",
 "Could not sign out. Please try again.": "সাইন আউট হয়নি। আবার চেষ্টা করুন।",
 "Could not load that page. Please try again.": "পেজটি খোলা যায়নি। আবার চেষ্টা করুন।",
 "Could not refresh your account. Please try again.": "অ্যাকাউন্ট রিফ্রেশ হয়নি। আবার চেষ্টা করুন।",
 "All notifications are already read.": "সব নোটিফিকেশন ইতিমধ্যে পড়া হয়েছে।",
 "Notifications marked as read.": "নোটিফিকেশনগুলো পড়া হয়েছে হিসেবে চিহ্নিত করা হয়েছে।",
 "Permission not granted.": "অনুমতি দেওয়া হয়নি।",
 "Browser notifications are unavailable.": "এই ব্রাউজারে নোটিফিকেশন উপলব্ধ নেই।",
 "Notifications enabled while website is open.": "ওয়েবসাইট খোলা থাকলে নোটিফিকেশন দেখা যাবে।",
 "Could not refresh the inbox. Please reopen Notifications.": "ইনবক্স রিফ্রেশ হয়নি। নোটিফিকেশন আবার খুলুন।",
 "Unable to update saved product alerts.": "সেভ করা পণ্যের নোটিফিকেশন আপডেট হয়নি।",
 "Welcome to SHOPYHAT! Your account has been created successfully.": "SHOPYHAT-এ স্বাগতম! আপনার অ্যাকাউন্ট তৈরি হয়েছে।",
 "Could not register. Please try again.": "নিবন্ধন হয়নি। আবার চেষ্টা করুন।",
 "Verification completed. Please sign in.": "যাচাই সম্পন্ন হয়েছে। সাইন ইন করুন।",
 "Verification failed. Check the code and try again.": "যাচাই হয়নি। কোড দেখে আবার চেষ্টা করুন।",
 "If eligible, a verification email has been sent. Please check your inbox.": "প্রযোজ্য হলে যাচাইকরণ ইমেইল পাঠানো হয়েছে। ইনবক্স দেখুন।",
 "Unable to resend. Please try again later.": "আবার পাঠানো যায়নি। পরে চেষ্টা করুন।",
 "Unable to start a secure session. Please try again.": "সাইন ইন সেশন শুরু করা যায়নি। আবার চেষ্টা করুন।",
 "Sign in failed. Please try again.": "সাইন ইন হয়নি। আবার চেষ্টা করুন।",
 "We could not send the recovery email right now. Please try again later or contact support.": "রিসেট ইমেইল এখন পাঠানো যায়নি। পরে আবার চেষ্টা করুন বা সহায়তায় যোগাযোগ করুন।",
 "Unable to send your recovery link.": "রিসেট লিংক পাঠানো যায়নি।",
 "Code invalid or expired. Please request a new recovery email.": "কোড ভুল বা মেয়াদ শেষ। নতুন রিসেট ইমেইল চান।",
 "If an account already exists with this email, please sign in or use Forgot password. Otherwise, check your inbox for a verification message.": "এই ইমেইলে অ্যাকাউন্ট থাকলে সাইন ইন করুন বা পাসওয়ার্ড রিসেট করুন। নতুন অ্যাকাউন্টের জন্য ইনবক্সে যাচাইকরণ বার্তা দেখুন।",
 "Step 1 of 2 · Your details": "ধাপ ১/২ · আপনার তথ্য",
 "Step 2 of 2 · Account security": "ধাপ ২/২ · অ্যাকাউন্টের নিরাপত্তা",
 "Search product…": "পণ্য খুঁজুন…",
 "Order ID, phone, customer": "অর্ডার আইডি, ফোন, গ্রাহক",
 "Filter main category": "মূল ক্যাটাগরি ফিল্টার করুন",
 "Filter subcategory": "সাবক্যাটাগরি ফিল্টার করুন",
 "Search product, color or SKU": "পণ্য, রং বা SKU খুঁজুন",
 "Select payment method": "পেমেন্ট পদ্ধতি বেছে নিন",
 "Case Status": "কেসের অবস্থা",
 "Assigned To": "দায়িত্বপ্রাপ্ত",
 "Unassigned": "দায়িত্ব দেওয়া হয়নি",
 "Private Evidence": "ব্যক্তিগত প্রমাণ",
 "Latest Customer-Facing Feedback": "গ্রাহককে দেওয়া সর্বশেষ উত্তর",
 "Final Resolution / Outcome": "চূড়ান্ত সমাধান / ফলাফল",
 "Resolve & Update": "সমাধান ও আপডেট",
 "Save & Update Case": "কেস সেভ ও আপডেট করুন",
 "Customer Follow-up Replies": "গ্রাহকের পরবর্তী উত্তর",
 "Customer Reply": "গ্রাহকের উত্তর",
 "No replies yet.": "এখনো কোনো উত্তর নেই।",
 "Resolution History": "সমাধানের ইতিহাস",
 "No history yet.": "এখনো কোনো ইতিহাস নেই।",
 "No attachments provided.": "কোনো সংযুক্তি দেওয়া হয়নি।",
 "Save Staff Access": "কর্মীর প্রবেশাধিকার সেভ করুন",
 "Review Result": "যাচাইয়ের ফলাফল",
 "Save Review": "রিভিউ সেভ করুন",
 "Display Name": "প্রদর্শিত নাম",
 "Active": "সক্রিয়",
 "Disabled": "নিষ্ক্রিয়",
 "Draft": "খসড়া",
 "Save Color": "রং সেভ করুন",
 "Save & Add Another Color": "সেভ করে আরেকটি রং যোগ করুন",
 "Saved Product Photos": "সেভ করা পণ্যের ছবি",
 "No photos yet. Select images below to add them.": "এখনো ছবি নেই। যোগ করতে নিচে ছবি বেছে নিন।",
 "Upload Selected Photos": "নির্বাচিত ছবি আপলোড করুন",
 "Add Image URLs": "ছবির URL যোগ করুন",
 "Search products": "পণ্য খুঁজুন",
 "Create Confirmed COD Order": "নিশ্চিত ক্যাশ অন ডেলিভারি অর্ডার তৈরি করুন",
 "Customer details are locked once the order is Ready to Ship.": "অর্ডার পাঠানোর জন্য প্রস্তুত হলে গ্রাহকের তথ্য লক হবে।",
 "Only authorized staff can edit customer details.": "শুধু অনুমোদিত কর্মী গ্রাহকের তথ্য সম্পাদনা করতে পারবেন।",
 "Payment verification is manual. Match transaction IDs with your actual provider records before approving.": "পেমেন্ট হাতে যাচাই করুন। অনুমোদনের আগে পেমেন্ট সেবার রেকর্ডের সঙ্গে ট্রানজ্যাকশন আইডি মিলিয়ে নিন।",
 "Reviews publish automatically. Hide or unhide inappropriate content at any time.": "রিভিউ স্বয়ংক্রিয়ভাবে প্রকাশিত হয়। প্রয়োজন হলে রিভিউ লুকান বা আবার দেখান।",
 "Read-only, database-recorded staff activity. Timestamps in Bangladesh time.": "ডেটাবেসে সংরক্ষিত কর্মীদের কার্যকলাপ শুধু দেখা যায়। সময় বাংলাদেশের।",
 "Receive → Assign → Investigate → Resolve → Close, with private evidence and feedback history.": "কেস গ্রহণ → দায়িত্ব দিন → তদন্ত → সমাধান → বন্ধ করুন। প্রমাণ ও উত্তরের ইতিহাস সংরক্ষিত থাকে।",
 "Requests are reviewed by SHOPYHAT. Check each status below. Product totals exclude delivery; margins remain estimates until settlement.": "SHOPYHAT অনুরোধগুলো যাচাই করে। নিচে অবস্থা দেখুন। পণ্যের মোট মূল্যে ডেলিভারি চার্জ নেই। নিষ্পত্তি পর্যন্ত মার্জিন আনুমানিক।",
 "Customers opening your approved store link see your saved product selling prices. Share your store or a specific product.": "অনুমোদিত স্টোর লিংক খুললে গ্রাহক আপনার সেভ করা বিক্রয়মূল্য দেখবেন। স্টোর বা নির্দিষ্ট পণ্যের লিংক শেয়ার করুন।",
 "Orders are attributed using your link. Gross margins are provisional until SHOPYHAT verifies payments, deliveries and settlements.": "আপনার লিংক দিয়ে আসা অর্ডার এখানে যুক্ত হয়। পেমেন্ট, ডেলিভারি ও নিষ্পত্তি যাচাই না হওয়া পর্যন্ত মার্জিন আনুমানিক।",
 "Update your password anytime. Forgot it completely? Ask SHOPYHAT Admin to issue a new temporary password.": "যেকোনো সময় পাসওয়ার্ড বদলান। ভুলে গেলে SHOPYHAT অ্যাডমিনের কাছে নতুন অস্থায়ী পাসওয়ার্ড চান।",
 "After a successful update, your next sign-in will use the new password.": "আপডেট হলে পরেরবার নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।",
 "One product variant per request. SHOPYHAT reviews it before fulfillment. Choose the customer’s delivery zone. Delivery charges are confirmed on approval; stock is not reserved by this request.": "প্রতি অনুরোধে একটি পণ্যের ভ্যারিয়েন্ট দিন। গ্রাহকের ডেলিভারি এলাকা বেছে নিন। SHOPYHAT অনুমোদনের সময় চার্জ নিশ্চিত করবে। অনুরোধ করলে স্টক সংরক্ষিত হয় না।",
 "Only approved SHOPYHAT product images are available. Images from private Google Drive folders require permission changes by the owner.": "শুধু অনুমোদিত SHOPYHAT পণ্যের ছবি দেখা যায়। ব্যক্তিগত Google Drive ফোল্ডারের ছবির জন্য মালিকের অনুমতি প্রয়োজন।",
 "Place a customer order:": "গ্রাহকের অর্ডার দিন:",
 "Set your selling price.": "আপনার বিক্রয়মূল্য নির্ধারণ করুন।",
 "Send this cancellation request to SHOPYHAT? The order is not cancelled until admin approves.": "এই বাতিলের অনুরোধ SHOPYHAT-এ পাঠাবেন? অ্যাডমিন অনুমোদন করলে অর্ডার বাতিল হবে।",
 "Optional: why does the customer want to cancel? (up to 250 characters)": "গ্রাহক কেন বাতিল করতে চান? (ঐচ্ছিক, সর্বোচ্চ ২৫০ অক্ষর)",
 "Remove this image from the product gallery?": "পণ্যের গ্যালারি থেকে ছবিটি সরাবেন?",
 "Changing the delivery zone may change the delivery charge and order total. Continue?": "ডেলিভারি এলাকা বদলালে চার্জ ও অর্ডারের মোট মূল্য বদলাতে পারে। এগোবেন?",
 "Retry the email rejected by the provider?": "প্রত্যাখ্যাত ইমেইল আবার পাঠাবেন?",
 "Confirm that the courier has handed over the actual COD payment for this delivered order?": "কুরিয়ার ডেলিভারি করা অর্ডারের ক্যাশ অন ডেলিভারি টাকা জমা দিয়েছে বলে নিশ্চিত করবেন?",
 "I checked the transaction in the payment provider account. Confirm verified?": "পেমেন্ট সেবার অ্যাকাউন্টে লেনদেন মিলিয়ে দেখেছেন? যাচাই নিশ্চিত করবেন?",
 "Preparing…": "প্রস্তুত হচ্ছে…",
 "Loading…": "লোড হচ্ছে…",
 "Loading account…": "অ্যাকাউন্ট লোড হচ্ছে…",
 "Language": "ভাষা"
};
for(const [en,bn] of Object.entries(SHOPYHAT_UI))EN.set(en,bn);
EN.set("Confirmation has not completed. Please open your email confirmation link again.", "নিশ্চিতকরণ সম্পন্ন হয়নি। ইমেইলের নিশ্চিতকরণ লিংক আবার খুলুন।");
EN.set("Your email is confirmed. You can now sign in.", "আপনার ইমেইল নিশ্চিত হয়েছে। এখন সাইন ইন করতে পারবেন।");
EN.set("Check your email and open the confirmation link.", "ইমেইল দেখে নিশ্চিতকরণ লিংক খুলুন।");
EN.set("Organize products by collection → subcategory → product → color & size, without changing historical product IDs.", "আগের পণ্য আইডি রেখে কালেকশন → সাবক্যাটাগরি → পণ্য → রং ও সাইজ অনুযায়ী সাজান।");
EN.set("Upload your official brand logo once. Header, footer and About Us automatically use the latest saved logo.", "ব্র্যান্ডের লোগো একবার আপলোড করুন। হেডার, ফুটার ও আমাদের সম্পর্কে পেজে সর্বশেষ সেভ করা লোগো দেখা যাবে।");
EN.set("Selected date range · Bangladesh time. Revenue excludes cancelled orders and distinguishes verified payments.", "নির্বাচিত তারিখসীমা · বাংলাদেশ সময়। আয়ের হিসাবে বাতিল অর্ডার বাদ দেওয়া হয় এবং যাচাইকৃত পেমেন্ট আলাদা দেখানো হয়।");
EN.set("Add an authorized email and role. The staff member can then request an OTP. Owner cannot be disabled here.", "অনুমোদিত ইমেইল ও ভূমিকা যোগ করুন। এরপর কর্মী একবার ব্যবহারযোগ্য কোড চাইতে পারবেন। এখানে মালিকের প্রবেশাধিকার বন্ধ করা যায় না।");
EN.set("choose a product and select “Add Customer Order”. SHOPYHAT will review the request in its fulfillment queue. This is not a paid or confirmed order.", "পণ্য বেছে নিয়ে ‘গ্রাহকের অর্ডার যোগ করুন’ চাপুন। SHOPYHAT অনুরোধটি পর্যালোচনা করবে। নিশ্চিতকরণ ও পেমেন্ট পরবর্তী ধাপে হবে।");
EN.set("Your wholesale cost stays controlled by SHOPYHAT. Save a price for each color/variant, copy your shop link or download approved product photos to promote your collection. Customer checkout uses verified reseller pricing.", "পাইকারি মূল্য SHOPYHAT নির্ধারণ করে। প্রতিটি রং বা ভ্যারিয়েন্টের বিক্রয়মূল্য সেভ করুন। প্রচারের জন্য দোকানের লিংক কপি করুন বা অনুমোদিত পণ্যের ছবি ডাউনলোড করুন। চেকআউটে যাচাইকৃত রিসেলার মূল্য ব্যবহার হয়।");
EN.set("Sign in with code", "কোড দিয়ে সাইন ইন করুন");
EN.set("Resend code", "কোড আবার পাঠান");
EN.set("Full address", "সম্পূর্ণ ঠিকানা");
EN.set("Enter your email", "আপনার ইমেইল দিন");
EN.set("Customer name", "গ্রাহকের নাম");
EN.set("Customer mobile", "গ্রাহকের মোবাইল");
EN.set("Customer email (optional)", "গ্রাহকের ইমেইল (ঐচ্ছিক)");
EN.set("Selected variant", "নির্বাচিত ভ্যারিয়েন্ট");
EN.set("Other product image", "পণ্যের অন্য ছবি");
EN.set("No photo", "ছবি নেই");
EN.set("Image unavailable", "ছবি পাওয়া যায়নি");
EN.set("Ask Admin to assign your shop URL", "স্টোরের URL সেট করতে অ্যাডমিনকে বলুন");
EN.set("Not configured", "সেট করা হয়নি");
EN.set("No matching products", "মিল আছে এমন পণ্য নেই");
EN.set("Verified - Paid", "যাচাইকৃত ও পরিশোধিত");
EN.set("Pending Review", "যাচাইয়ের অপেক্ষায়");
EN.set("Failed", "ব্যর্থ");
EN.set("Reject", "প্রত্যাখ্যান করুন");
EN.set("Approve", "অনুমোদন করুন");
EN.set("Approved", "অনুমোদিত");
EN.set("Settled", "নিষ্পত্তি হয়েছে");
EN.set("Unsettled", "নিষ্পত্তি হয়নি");
EN.set("Checkout", "চেকআউট");
EN.set("Items", "পণ্য");
EN.set("Loading order items…", "অর্ডারের পণ্য লোড হচ্ছে…");
EN.set("No data for this date range", "নির্বাচিত সময়ে কোনো তথ্য নেই");
EN.set("No product sales in this period.", "এই সময়ে কোনো পণ্য বিক্রি হয়নি।");
EN.set("No recorded traffic yet.", "এখনো ট্রাফিক রেকর্ড নেই।");
EN.set("No matching records.", "মিল আছে এমন কোনো রেকর্ড নেই।");
EN.set("Buy now →", "এখনই কিনুন →");
EN.set("Buy now", "এখনই কিনুন");
EN.set("Add to bag", "কার্টে যোগ করুন");
EN.set("Choose options", "পছন্দ বেছে নিন");
EN.set("Close cart", "কার্ট বন্ধ করুন");
EN.set("Close wishlist", "পছন্দের তালিকা বন্ধ করুন");
EN.set("View details", "বিস্তারিত দেখুন");
EN.set("Choose a size to continue.", "এগোতে সাইজ বেছে নিন।");
EN.set("12 Hat (Traditional Saree Length)", "১২ হাত (শাড়ির প্রচলিত দৈর্ঘ্য)");
EN.set("Save to wishlist", "পছন্দের তালিকায় রাখুন");
EN.set("Remove from wishlist", "পছন্দের তালিকা থেকে সরান");
EN.set("View all reviews", "সব রিভিউ দেখুন");
EN.set("Write a review", "রিভিউ লিখুন");
EN.set("You may also like", "এগুলোও পছন্দ হতে পারে");
EN.set("Browse all products", "সব পণ্য দেখুন");
EN.set("No reviews yet", "এখনো কোনো রিভিউ নেই");
EN.set("Proceed to checkout", "চেকআউটে যান");
EN.set("Checkout →", "চেকআউটে যান →");
EN.set("Order summary", "অর্ডারের সারাংশ");
EN.set("Place order →", "অর্ডার করুন →");
EN.set("Payment method", "পেমেন্ট পদ্ধতি");
EN.set("Delivery zone and fee", "ডেলিভারি এলাকা ও চার্জ");
EN.set("Required fields", "আবশ্যক ফিল্ড");
EN.set("Too short", "খুব ছোট");
const EN_TO_BN = EN;
const saved=(()=>{try{return localStorage.getItem('sh_language')||'en'}catch{return 'en'}})();
let lang=saved==='bn'?'bn':'en';
const remembered=new WeakMap();
const attrRemembered=new WeakMap();
const skipTags=new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','CODE','PRE']);
const clean=s=>String(s||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
const paymentRules=[
 [/^Inside Dhaka, (.+)$/,'ঢাকার ভিতরে, $1'],
 [/^Outside Dhaka, (.+)$/,'ঢাকার বাইরে, $1'],
 [/^Open your (bKash|Nagad) app, choose (.+), and send (.+) to the number below\.$/,'আপনার $1 অ্যাপ খুলে $2 নির্বাচন করুন এবং নিচের নম্বরে $3 পাঠান।'],
 [/^Photo (\d+)$/,'ছবি $1'],
 [/^(\d+) available$/,'$1টি উপলব্ধ'],
 [/^You save (.+)$/,'আপনার সাশ্রয় $1'],
 [/^Order request placed$/,'অর্ডার অনুরোধ গ্রহণ করা হয়েছে'],
 [/^Thank you, (.+)\. Order total: (.+) \((.+)\)\.$/,'ধন্যবাদ, $1। অর্ডারের মোট মূল্য: $2 ($3)।'],
 [/^Payment method: (.+)$/,'পেমেন্ট পদ্ধতি: $1'],
 [/^Coupon (.+)$/,'কুপন $1'],
 [/^Select colour (.+)$/,'রং বেছে নিন $1'],
 [/^\d+ styles?$/,'পণ্যের ধরন'],
 [/^Steps: 1\. Copy the number\..+$/,'ধাপসমূহ: ১. নম্বরটি কপি করুন। ২. পেমেন্ট অ্যাপে Send Money খুলুন। ৩. নম্বর ও সঠিক টাকা দিন। ৪. অ্যাপে পেমেন্ট সম্পন্ন করুন। ৫. এখানে ফিরে সঠিক ট্রানজ্যাকশন আইডি ও প্রেরকের ফোনের শেষ চার সংখ্যা লিখুন। এই ওয়েবসাইট থেকে কোনো টাকা স্বয়ংক্রিয়ভাবে কাটা বা যাচাই করা হয় না।']
];
function registerProducts(products){
 if(!Array.isArray(products))return;
 for(const p of products){
  const name=String(p.name||'').trim(),nameBn=String(p.nameBn||p.name_bn||'').trim();
  const desc=String(p.desc||p.description||'').trim(),descBn=String(p.descBn||p.description_bn||'').trim();
  if(name&&nameBn)EN_TO_BN.set(name,nameBn);
  if(desc&&descBn)EN_TO_BN.set(desc,descBn);
  const original=Array.isArray(p.details)?p.details:String(p.details||'').split(/[\n|]+/).map(x=>x.trim()).filter(Boolean);
  const translated=Array.isArray(p.detailsBn)?p.detailsBn:String(p.details_bn||'').split(/[\n|]+/).map(x=>x.trim()).filter(Boolean);
  if(original.length&&translated.length===original.length)original.forEach((en,i)=>{if(translated[i])EN_TO_BN.set(String(en).trim(),translated[i])});
 }
 if(document.body)apply(document.body);
}
function translate(v){
 const input=clean(v);
 if(!input)return null;
 if(EN_TO_BN.has(input))return EN_TO_BN.get(input);
 const prefixed=input.match(/^(Status|Payment): (.+)$/);
 if(prefixed)return EN_TO_BN.get(prefixed[1])+': '+(EN_TO_BN.get(prefixed[2])||prefixed[2]);
 const dynamic=input.match(/^(Estimated margin|Minimum price|Product total|Stock|Available|Reference|Color|Tracking ID): (.+)$/);
 if(dynamic){
  const labels={'Estimated margin':'আনুমানিক মার্জিন','Minimum price':'সর্বনিম্ন মূল্য','Product total':'পণ্যের মোট মূল্য','Stock':'স্টক','Available':'স্টকে আছে','Reference':'রেফারেন্স','Color':'রং','Tracking ID':'ট্র্যাকিং আইডি'};
  return labels[dynamic[1]]+': '+dynamic[2];
 }
 const page=input.match(/^Page (\d+)$/);
 if(page)return 'পৃষ্ঠা '+page[1];
 const greeting=input.match(/^Hello, (.+)$/);
 if(greeting)return 'স্বাগতম, '+(greeting[1]==='Customer'?'গ্রাহক':greeting[1]);
 const verify=input.match(/^Check (.+) for a verification code or confirmation link\. Check your spam folder too\.$/);
 if(verify)return verify[1]+'-এর ইনবক্সে যাচাইকরণ কোড বা লিংক দেখুন। স্প্যাম ফোল্ডারও দেখুন।';
 const zone=input.match(/^(Inside Dhaka|Outside Dhaka), (.+)$/);
 if(zone)return EN_TO_BN.get(zone[1])+', '+zone[2];
 const savedDefault=input.match(/^(.+) \(default\) · (.+)$/);
 if(savedDefault)return (EN_TO_BN.get(savedDefault[1])||savedDefault[1])+' (ডিফল্ট) · '+savedDefault[2];
 for(const [re,output] of paymentRules)if(re.test(input))return input.replace(re,output);
 return null;
}
function translateNode(node){
 if(!node||node.nodeType!==3||!node.parentElement)return;
 const parent=node.parentElement;
 if(skipTags.has(parent.tagName)||parent.closest('.sh-lang-switch,[contenteditable="true"],[data-no-translate]'))return;
 const current=node.nodeValue||'';
 let record=remembered.get(node);
 if(!record){record={en:current,rendered:current};remembered.set(node,record);}
 else if(current!==record.rendered){record.en=current;record.rendered=current;}
 const original=record.en;
 const start=original.match(/^\s*/)?.[0]||'',end=original.match(/\s*$/)?.[0]||'';
 const bn=translate(original);
 const target=lang==='bn'&&bn!=null?start+bn+end:original;
 if(current!==target){
  // An option without a value submits its visible text by default.
  if(parent.tagName==='OPTION'&&!parent.hasAttribute('value'))parent.value=parent.value;
  record.rendered=target;node.nodeValue=target;
 }
}
function translateAttributes(element){
 if(!element||element.nodeType!==1||element.closest('.sh-lang-switch,[data-no-translate]'))return;
 let entries=attrRemembered.get(element);
 if(!entries){entries={};attrRemembered.set(element,entries)}
 for(const name of ['placeholder','aria-label','aria-valuetext','title']){
  if(!element.hasAttribute(name))continue;
  const current=element.getAttribute(name)||'';
  let entry=entries[name];
  if(!entry)entry=entries[name]={en:current,rendered:current};
  else if(current!==entry.rendered){entry.en=current;entry.rendered=current}
  const trans=translate(entry.en);
  const target=lang==='bn'&&trans!=null?trans:entry.en;
  if(target!==current){entry.rendered=target;element.setAttribute(name,target)}
 }
}
function apply(root){
 if(!root)return;
 if(root.nodeType===3){translateNode(root);return}
 if(root.nodeType!==1 && root.nodeType!==9 && root.nodeType!==11)return;
 if(root.nodeType===1)translateAttributes(root);
 const tree=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 let child;
 while((child=tree.nextNode())){
  if(child.nodeType===3)translateNode(child);
  else translateAttributes(child);
 }
}
function syncButtons(){
 document.documentElement.lang=lang;
 document.documentElement.classList.toggle('sh-bangla',lang==='bn');
 document.querySelectorAll('.sh-lang-switch').forEach(el=>{
   for(const btn of el.querySelectorAll('[data-sh-lang]')){
    const active=btn.dataset.shLang===lang;
    btn.classList.toggle('selected',active);
    btn.setAttribute('aria-pressed',String(active));
   }
 });
}
const css=document.createElement('style');
css.textContent=`.sh-lang-switch{display:inline-flex;align-items:center;gap:3px;padding:3px;background:#f5f0ea;border:1px solid #e8ded4;border-radius:999px;flex-shrink:0;font-family:var(--sans),sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.035)}
.sh-lang-switch button{border:0;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800;color:#66594b;line-height:1.2;transition:all .2s ease;white-space:nowrap}
.sh-lang-switch button.selected{background:#1c1b19;color:#fff;box-shadow:0 2px 5px rgba(0,0,0,.15)}
.sh-lang-switch button:focus-visible{outline:2px solid #f47721;outline-offset:2px}
.sh-lang-switch button:hover:not(.selected){color:#d9640f;background:#fff}
.sh-lang-switch.sh-modal-lang{position:absolute;left:13px;top:13px;z-index:9;box-shadow:0 3px 15px #0001}
.sh-lang-switch.sh-header-lang{margin-right:8px}
 [data-sh-language-host]{display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-wrap:wrap}
 [data-sh-language-host] .sh-lang-switch button{margin:0;width:auto;min-width:0;min-height:0;background:transparent}
 [data-sh-language-host] .sh-lang-switch button.selected{background:#1c1b19;color:#fff}
.sh-payment-lang-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.sh-payment-lang-row .sh-lang-switch{background:#fff}
html.sh-bangla body{font-family:"Hind Siliguri",var(--sans),sans-serif}
html.sh-bangla .hero h1,html.sh-bangla h1,html.sh-bangla h2,html.sh-bangla h3{font-family:"Hind Siliguri",var(--serif),serif;letter-spacing:0;line-height:1.3}
html.sh-bangla button,html.sh-bangla input,html.sh-bangla select,html.sh-bangla textarea{font-family:"Hind Siliguri",var(--sans),sans-serif}
@media(max-width:800px){.sh-lang-switch.sh-header-lang{position:fixed;right:14px;bottom:82px;z-index:195;margin:0;box-shadow:0 7px 22px #0003;background:#fff}.sh-lang-switch button{font-size:11px;padding:7px 8px}.sh-lang-switch.sh-modal-lang{top:10px;left:10px}.hd{gap:8px}}
`;
document.head.append(css);
const makeSwitch=(extra)=>{const el=document.createElement('div');el.className='sh-lang-switch '+extra;el.setAttribute('role','group');el.setAttribute('aria-label','Language / ভাষা');
el.innerHTML='<button type="button" data-sh-lang="en" aria-label="English" title="English">EN</button><button type="button" data-sh-lang="bn" aria-label="বাংলা" title="বাংলা">বাংলা</button>';
return el};
function ensureSwitches(){
 for(const host of document.querySelectorAll('[data-sh-language-host]')){
  if(!host.querySelector('.sh-lang-switch'))host.append(makeSwitch(''));
 }
 const header=document.querySelector('.hd .icons');
 if(header&&!document.querySelector('.sh-header-lang')){
  const control=makeSwitch('sh-header-lang');
  const narrow=matchMedia('(max-width: 800px)');
  const placeControl=()=>{
   const announcement=document.querySelector('.ann');
   if(narrow.matches&&announcement)announcement.append(control);
   else header.prepend(control);
  };
  placeControl();
  narrow.addEventListener('change',placeControl);
 }
 for(const id of ['prodModal','coModal','okModal']){
  const box=document.querySelector('#'+id+' > .box');
  if(box&&!box.querySelector('.sh-modal-lang'))box.prepend(makeSwitch('sh-modal-lang'));
 }
 // Keep a dedicated language control next to Manual Transfer verification,
 // so the customer can change language where payment instructions are read.
 const payment=document.querySelector('#payX');
 if(payment&&!payment.querySelector('.sh-payment-lang-row')){
   const badge=payment.querySelector('.manual-badge');
   if(badge){
     const row=document.createElement('div');
     row.className='sh-payment-lang-row';
     payment.insertBefore(row,badge);
     row.appendChild(badge);
     row.appendChild(makeSwitch('sh-payment-lang'));
   }
 }
 syncButtons();
}
ensureSwitches();
function setLanguage(next){
 if(next!=='bn'&&next!=='en')return;
 lang=next;
 try{localStorage.setItem('sh_language',next)}catch{}
 syncButtons();
 apply(document.body);
 apply(document.querySelector('title'));
 window.dispatchEvent(new CustomEvent('shopyhat:languagechange',{detail:{language:next}}));
}
document.addEventListener('click',e=>{const btn=e.target.closest('[data-sh-lang]');if(!btn)return;e.preventDefault();setLanguage(btn.dataset.shLang)});
syncButtons();
apply(document.body);
let flushing=false;
const observer=new MutationObserver(records=>{
 if(flushing)return;
 flushing=true;
 try{
   for(const rec of records){
    if(rec.type==='characterData')translateNode(rec.target);
    else if(rec.type==='attributes')translateAttributes(rec.target);
    else for(const node of rec.addedNodes)apply(node);
   }
   // Product and checkout markup are rebuilt by the existing storefront.
   // Reinsert the switcher whenever drawProduct() replaces #prodBox content.
   if(records.some(rec=>rec.type==='childList'))ensureSwitches();
 }finally{flushing=false}
});
observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','aria-valuetext','title']});
const title=document.querySelector('title');
 if(title){apply(title);observer.observe(title,{subtree:true,childList:true,characterData:true})}
 const text=node=>lang==='bn'?(translate(node)||node):node;
 const sourceText=element=>Array.from(element.childNodes,node=>remembered.get(node)?.en||node.textContent||'').join('');
 window.SHOPYHAT_I18N={setLanguage,getLanguage:()=>lang,translate,registerProducts,text,sourceText};
try{if(typeof PRODUCTS!=='undefined'&&Array.isArray(PRODUCTS))registerProducts(PRODUCTS)}catch(e){console.warn('Catalog language registration pending',e)}
})();