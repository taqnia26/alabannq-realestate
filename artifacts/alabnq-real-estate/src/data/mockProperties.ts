export type PropertyType = 'شقق للبيع' | 'أراضي للبيع' | 'عمائر للبيع' | 'شقق للإيجار';
export type Purpose = 'sale' | 'rent';

export interface Property {
  id: string;
  title: string;
  neighborhood: string;
  city: 'مكة المكرمة';
  type: PropertyType;
  purpose: Purpose;
  price: number;
  priceLabel: string;
  area: number;
  rooms: number;
  bathrooms: number;
  coordinates: [number, number];
  image: string;
  gallery?: string[];
  sourceUrl: string;
  featured: boolean;
  description: string;
  amenities: string[];
}

export const officialProperties: Property[] = [
  {
    id: 'listing-366',
    title: 'عرض رقم 366 عمارة للبيع في العدل – مكة المكرمة',
    neighborhood: 'العدل',
    city: 'مكة المكرمة',
    type: 'عمائر للبيع',
    purpose: 'sale',
    price: 3300000,
    priceLabel: '3,300,000 ر.س',
    area: 0,
    rooms: 0,
    bathrooms: 0,
    coordinates: [21.4208, 39.8192],
    image: 'https://alabannq.com/wp-content/uploads/2026/08/3-592x444.png',
    gallery: [
      'https://alabannq.com/wp-content/uploads/2026/08/3-592x444.png',
      'https://alabannq.com/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-04-at-3.09.44-PM-1391x600.jpeg',
      'https://alabannq.com/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-04-at-3.09.22-PM-1381x600.jpeg',
    ],
    sourceUrl: 'https://alabannq.com/property/%d8%b9%d8%b1%d8%b6-%d8%b1%d9%82%d9%85-366-%d8%b9%d9%85%d8%a7%d8%b1%d8%a9-%d9%84%d9%84%d8%a8%d9%8a%d8%b9-%d9%81%d9%8a-%d8%a7%d9%84%d8%b9%d8%af%d9%84-%d9%85%d9%83%d8%a9-%d8%a7%d9%84%d9%85%d9%83%d8%b1/',
    featured: true,
    description: 'عمارة استثمارية في حي العدل تتكوّن من بدروم وثلاثة أدوار وملحق. تضم ست شقق؛ وفي كل دور شقتان تحتوي كل منهما على صالة وأربع غرف وثلاث دورات مياه ومطبخ.',
    amenities: ['3 أدوار + بدروم + ملحق', '6 شقق', '4 غرف لكل شقة', '3 دورات مياه لكل شقة'],
  },
  {
    id: 'listing-402',
    title: 'عرض رقم 402 شقة للإيجار في الحسينية – مكة المكرمة',
    neighborhood: 'الحسينية',
    city: 'مكة المكرمة',
    type: 'شقق للإيجار',
    purpose: 'rent',
    price: 27000,
    priceLabel: '27,000 ر.س / سنوياً',
    area: 0,
    rooms: 4,
    bathrooms: 3,
    coordinates: [21.3483, 39.8478],
    image: 'https://alabannq.com/wp-content/uploads/2026/08/WhatsApp-Image-2025-12-25-at-8.40.46-PM-1-592x444.jpeg',
    sourceUrl: 'https://alabannq.com/property/%d8%b9%d8%b1%d8%b6-%d8%b1%d9%82%d9%85-402-%d8%b4%d9%82%d8%a9-%d9%84%d9%84%d8%a7%d9%8a%d8%ac%d8%a7%d8%b1-%d9%81%d9%8a-%d8%a7%d9%84%d8%ad%d8%b3%d9%8a%d9%86%d9%8a%d8%a9-%d9%85%d9%83%d8%a9-%d8%a7%d9%84/',
    featured: true,
    description: 'شقة جديدة للإيجار السنوي بتوزيع عائلي عملي: غرفة ماستر بدورة مياه خاصة، وثلاث غرف إضافية، وصالة، ومطبخ، ودورتي مياه إضافيتين.',
    amenities: ['غرفة ماستر', '4 غرف', 'صالة عائلية', 'مطبخ'],
  },
  {
    id: 'listing-405',
    title: 'عرض رقم 405 شقة للإيجار في العوالي – مكة المكرمة',
    neighborhood: 'العوالي',
    city: 'مكة المكرمة',
    type: 'شقق للإيجار',
    purpose: 'rent',
    price: 30000,
    priceLabel: '30,000 ر.س / سنوياً',
    area: 0,
    rooms: 5,
    bathrooms: 3,
    coordinates: [21.3928, 39.8442],
    image: 'https://alabannq.com/wp-content/uploads/2026/07/1-3.jpeg',
    gallery: [
      'https://alabannq.com/wp-content/uploads/2026/07/1-3.jpeg',
      'https://alabannq.com/wp-content/uploads/2026/07/2-4-800x600.jpeg',
      'https://alabannq.com/wp-content/uploads/2026/07/3-5-800x600.jpeg',
    ],
    sourceUrl: 'https://alabannq.com/property/%d8%b9%d8%b1%d8%b6-%d8%b1%d9%82%d9%85-405-%d8%b4%d9%82%d8%a9-%d9%84%d9%84%d8%a7%d9%8a%d8%ac%d8%a7%d8%b1-%d9%81%d9%8a-%d8%a7%d9%84%d8%b9%d9%88%d8%a7%d9%84%d9%8a-%d9%85%d9%83%d8%a9-%d8%a7%d9%84%d9%85/',
    featured: true,
    description: 'شقة للإيجار السنوي في حي العوالي بمكة المكرمة. تتوفر تفاصيل العرض الرسمية وصوره عبر صفحة الإعلان الأصلية.',
    amenities: ['5 غرف', '3 دورات مياه', 'إيجار سنوي', 'حي العوالي'],
  },
  {
    id: 'listing-413',
    title: 'عرض رقم 413 شقة للإيجار في العوالي – مكة المكرمة',
    neighborhood: 'العوالي',
    city: 'مكة المكرمة',
    type: 'شقق للإيجار',
    purpose: 'rent',
    price: 40000,
    priceLabel: '40,000 ر.س / سنوياً',
    area: 260,
    rooms: 7,
    bathrooms: 4,
    coordinates: [21.3945, 39.8461],
    image: 'https://alabannq.com/wp-content/uploads/2026/07/2-3-592x444.jpeg',
    gallery: [
      'https://alabannq.com/wp-content/uploads/2026/07/2-3-592x444.jpeg',
      'https://alabannq.com/wp-content/uploads/2026/07/13-2-338x600.jpeg',
      'https://alabannq.com/wp-content/uploads/2026/07/14-2-338x600.jpeg',
    ],
    sourceUrl: 'https://alabannq.com/property/%d8%b9%d8%b1%d8%b6-%d8%b1%d9%82%d9%85-413-%d8%b4%d9%82%d8%a9-%d9%84%d9%84%d8%a7%d9%8a%d8%ac%d8%a7%d8%b1-%d9%81%d9%8a-%d8%a7%d9%84%d8%b9%d9%88%d8%a7%d9%84%d9%8a-%d9%85%d9%83%d8%a9-%d8%a7%d9%84%d9%85/',
    featured: true,
    description: 'شقة واسعة للإيجار السنوي بمساحة 260 م²، تضم صالتين وست غرف وغرفة خادمة وأربع دورات مياه ومطبخًا راكبًا، ومزوّدة بتسعة مكيفات سبليت.',
    amenities: ['260 م²', 'صالتان', 'غرفة خادمة', 'مطبخ راكب', '9 مكيفات سبليت'],
  },
];

export const uniqueNeighborhoods = Array.from(new Set(officialProperties.map((property) => property.neighborhood)));