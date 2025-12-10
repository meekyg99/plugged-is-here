# Advance PRD

## Goal
Elevate the storefront to a production-grade e-commerce experience with better conversion, clarity, and performance.

## Scope
- Frontend UX and UI enhancements for product discovery, selection, and checkout readiness.
- Data and event plumbing for analytics and remarketing.
- Non-breaking, incremental rollout; each feature should be independently shippable.

## Pillars & Features
1) Product selection & confidence
- Variant-aware cart/wishlist: capture selected size/color and variant ID; show selected options in cart/wishlist lines.
- Low-stock and OOS handling: show badges (e.g., "Only 2 left"), block add-to-cart when out-of-stock; per-variant stock.
- Price merchandising: compare-at pricing with % off badge and strikethrough old price.
- Trust cues on PDP/QuickView: shipping/returns/payment badges; concise materials/care info.

2) Discovery & conversion
- Search suggestions: debounced suggestions (products/categories) with keyboard nav; highlight matches.
- Filters & sorting on category pages: size, color, price range; sorting by newest and price asc/desc; URL params for shareable state.
- Personalized recs: recently viewed and “You may also like” using local storage + category overlap.
- Reviews & ratings: display aggregate rating on tiles/PDP; allow posting reviews with moderation.

3) Persistence & remarketing
- Persistent cart/wishlist: sync for authenticated users and persist for guests; hydrate on login to avoid item loss.
- Analytics events: emit GA4/Meta events (view_item, add_to_cart, begin_checkout, purchase) with variant and price data.

4) Performance & accessibility
- Responsive images: use srcset/sizes for product media; lazy-load below-the-fold; prefetch PDP links on hover.
- Accessibility: focus states on all controls; aria-labels on icon buttons; keyboard selection for size/color.

5) Checkout readiness (lightweight)
- Checkout UX polish: address autocomplete, phone/email validation, progress indicator, sticky order summary on desktop.

## Success Metrics (directional)
- +X% add-to-cart rate from PDP/QuickView.
- +Y% search-to-cart conversion after suggestions and filters.
- Reduced cart abandonment (variant/OOS errors) and fewer size-related support issues.
- PageSpeed/LCP improvement on product and category pages.

## Constraints
- No breaking schema changes; leverage existing tables (products, product_variants, banners, etc.).
- Incremental rollout; feature flags per feature where practical.

## Phased Delivery
- Phase 1 (foundation): variant-aware cart/wishlist; low-stock/OOS; compare-at pricing; persistent cart/wishlist; accessibility labels.
- Phase 2 (discovery): search suggestions; filters/sorting with URL params; recently viewed + “You may also like.”
- Phase 3 (social proof & trust): reviews/ratings; trust badges; shipping/returns blocks.
- Phase 4 (perf & analytics): responsive images, lazy/prefetch; GA4/Meta events.
- Phase 5 (checkout polish): validation, autocomplete, sticky summary.

## Acceptance Criteria (per feature)
- Variant-aware add-to-cart: selected size/color and variant ID are required before enabling CTA; cart/wishlist lines show chosen options.
- Low-stock/OOS: badge appears when stock_quantity <= threshold; add-to-cart disabled when stock_quantity == 0; messaging is clear.
- Compare-at pricing: when compare_at_price > price, show strikethrough old price and % off badge; fallback to single price otherwise.
- Filters/sorting: filters and sort state persist in URL; applying filters updates product list without reload; “clear all” resets state.
- Search suggestions: typing shows suggestions within 200ms debounce; arrow/enter controls work; click/enter navigates.
- Persistent cart/wishlist: items persist across refresh; upon login, guest cart merges into user cart without duplication.
- Reviews: ratings visible on tiles/PDP; submitting a review requires auth; moderation flag stored.
- Performance: below-the-fold images lazy-loaded; LCP image uses responsive sources; hover prefetch active on desktop.
- Accessibility: all icon buttons have aria-labels; size/color selectors are keyboard operable; focus ring visible.
- Analytics: GA4/Meta events fire with product ID, variant ID, price, quantity; no console errors.

## Open Questions
- Reviews backend: use existing DB or add a new table? Require purchase to review?
- Recommendation source: simple heuristic (category overlap + popularity) vs. API?
- Feature flagging mechanism: simple env/config or dedicated flag service?
