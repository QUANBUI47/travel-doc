# ADR-005: SEO-first acquisition — SeoPage polymorphic + Sitemap động

- **Status**: Accepted
- **Ngày**: 2026-05-26
- **Người duyệt**: Founder + Tech Lead

---

## Context

SEO là kênh acquisition chính của Vivu Phase 1 (xem `../../00-san-pham/02-mo-hinh-kinh-doanh.md` câu 3). Khách book tour đa số tới qua Google search, không tới impulse như mua quần áo.

Trade-off SEO: chậm 6-12 tháng mới ra kết quả → mọi page **phải tối ưu SEO từ ngày 1**, không "làm tạm rồi sửa SEO sau".

Cần giải quyết 3 vấn đề kỹ thuật:

1. **Metadata per page** — Tour, Destination, Hotel, Static page đều cần custom `<title>`, `<meta description>`, `<og:image>`, `canonicalUrl`, `noIndex`...
2. **Override flexibility** — Admin muốn override metadata cho từng tour/destination riêng (vd campaign Tết override hết).
3. **Không orphan SEO** — nếu admin đổi slug tour → SEO page không được mồ côi.

---

## Decision

**Dùng 1 bảng `SeoPage` polymorphic với Exclusive Arc pattern, ID-based reference (không phải slug).**

### Schema

```prisma
model SeoPage {
  id              String           @id @default(uuid()) @db.Uuid
  targetType      SeoTargetType    // TOUR | DESTINATION | HOTEL | STATIC
  tourId          String?          @unique @map("tour_id") @db.Uuid
  destinationId   String?          @unique @map("destination_id") @db.Uuid
  hotelId         String?          @unique @map("hotel_id") @db.Uuid
  customPath      String?          @unique @map("custom_path")  // STATIC pages
  metaTitle       String           @map("meta_title")
  metaDescription String?          @map("meta_description")
  ogImage         String?          @map("og_image")
  canonicalUrl    String?          @map("canonical_url")
  noIndex         Boolean          @default(false) @map("no_index")
}
```

### CHECK constraint (N-01)

Đúng 1 trong 4 cột (tourId, destinationId, hotelId, customPath) non-NULL, và phải khớp với `targetType`.

### Sitemap động (Next.js 15)

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, destinations, hotels, staticPages] = await Promise.all([
    tourService.findActiveTours(),
    destinationService.findActiveDestinations(),
    hotelService.findActiveHotels(),
    seoService.findStaticPages(),
  ])

  return [
    { url: 'https://vivu.travel', priority: 1.0, changeFrequency: 'daily' },
    ...tours.map(t => ({ url: `https://vivu.travel/tours/${t.slug}`, lastModified: t.updatedAt })),
    ...destinations.map(d => ({ url: `https://vivu.travel/destinations/${d.slug}`, lastModified: d.updatedAt })),
    ...hotels.map(h => ({ url: `https://vivu.travel/hotels/${h.slug}`, lastModified: h.updatedAt })),
    ...staticPages.map(s => ({ url: `https://vivu.travel${s.customPath}`, lastModified: s.updatedAt })),
  ]
}
```

### Metadata generation

```typescript
// app/(public)/tours/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tour = await tourService.findActiveBySlug(params.slug)
  if (!tour) return {}

  const seo = await seoService.getByEntity('TOUR', tour.id)
  return {
    title:       seo?.metaTitle ?? `${tour.nameVi} | Vivu Travel`,
    description: seo?.metaDescription ?? tour.description?.slice(0, 160),
    openGraph: {
      images: [seo?.ogImage ?? tour.imageUrls[0]],
    },
    alternates: { canonical: seo?.canonicalUrl ?? `https://vivu.travel/tours/${tour.slug}` },
    robots: { index: !(seo?.noIndex ?? false) },
  }
}
```

### Structured data (JSON-LD)

```typescript
// In page component
<script type="application/ld+json">
  {JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.nameVi,
    description: tour.description,
    image: tour.imageUrls,
    offers: { '@type': 'Offer', price: tour.priceAdult, priceCurrency: 'VND' },
  })}
</script>
```

---

## Consequences

### Tốt

- 1 bảng quản tất cả SEO override → đơn giản
- ID-based FK → tour đổi slug, SeoPage vẫn link đúng (không orphan)
- Admin có UI thống nhất `/portal/seo` quản tất cả metadata
- DB CHECK đảm bảo Exclusive Arc → không có row với 2 target cùng non-NULL
- Sitemap render dynamic → không cần rebuild khi admin update tour

### Trade-off

- Polymorphic CHECK constraint phức tạp hơn 1 bảng đơn
- Query SeoPage cần biết target type trước → service layer abstraction

### Hệ quả kỹ thuật

- `SeoService.getByEntity(type, id)` là helper chính
- Admin UI `/portal/seo`: 1 trang list + filter theo `targetType` + form chung
- Cache: SeoPage có thể cache 30 phút (admin update không cần realtime)
- Phase 1.5+: thêm A/B test metadata variants nếu cần

---

## Alternatives đã cân nhắc

### A. Inline metadata trên từng entity (rejected)

```prisma
model Tour {
  metaTitle       String?
  metaDescription String?
  ogImage         String?
  // ...
}
```

- Lặp lại field 4 lần (Tour + Destination + Hotel + Static page)
- Khó query "tất cả SEO page có noIndex" cho audit

### B. Slug-based reference (rejected)

```prisma
model SeoPage {
  targetSlug  String @unique   // "/tours/da-lat-4n3d"
  // ...
}
```

- Admin đổi slug tour → SeoPage orphan → mất metadata
- Cần job sync slug — fragile

### C. Single discriminator column (rejected)

```prisma
model SeoPage {
  targetType  String  // "TOUR", "HOTEL"...
  targetId    String  // không có FK constraint
}
```

- Mất FK constraint integrity
- Cascade delete không tự động

---

## Liên kết

- Sitemap implementation: `../01-kien-truc-tong-the.md` mục Routing
- SeoPage schema: `../../03-co-so-du-lieu/02-thiet-ke-bang.md` mục 5.1
- Exclusive Arc pattern: `../../03-co-so-du-lieu/03-toan-ven-concurrency.md` mục N-01
- Anchor cũ trace: V-03
