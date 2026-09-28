import { useState, useMemo } from "react";
import { Search, MapPin, SlidersHorizontal, Filter, X, List, Map as MapIcon, ArrowDownUp, RotateCcw } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { useSiteContent } from "@/data/siteContent";
import { PropertyCard } from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Fix for leaflet markers in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ALL_CATEGORIES = ['الكل', 'عمائر للبيع', 'شقق للبيع', 'شقق للإيجار', 'أراضي للبيع'];

const PROPERTY_TYPES = [
  { value: 'all', label: 'كل أنواع العقارات' },
  { value: 'شقق', label: 'شقق' },
  { value: 'عمائر', label: 'عمائر' },
  { value: 'أراضي', label: 'أراضي' },
];

const formatNumber = (value: string | number) =>
  new Intl.NumberFormat('en-US').format(Number(value));

export default function Properties() {
  const { data, isLoading, isError } = useSiteContent();
  const officialProperties = data?.properties ?? [];
  const uniqueNeighborhoods = Array.from(new Set(officialProperties.map(property => property.neighborhood)));
  // Parse query params if any
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [activeNeighborhood, setActiveNeighborhood] = useState<string>('الكل');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [purposeFilter, setPurposeFilter] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRooms, setMinRooms] = useState<string>('all');
  const [minBathrooms, setMinBathrooms] = useState<string>('all');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const matchingProperties = officialProperties.filter(property => {
      const matchSearch = !query ||
                          property.title.toLocaleLowerCase().includes(query) ||
                          property.neighborhood.toLocaleLowerCase().includes(query) ||
                          property.description.toLocaleLowerCase().includes(query);
      const matchCategory = activeCategory === 'الكل' || property.type === activeCategory;
      const matchNeighborhood = activeNeighborhood === 'الكل' || property.neighborhood === activeNeighborhood;
      const matchPropertyType = propertyTypeFilter === 'all' || property.type.startsWith(propertyTypeFilter);
      const matchPurpose = purposeFilter === 'all' || property.purpose === purposeFilter;
      const matchMinPrice = !minPrice || property.price >= Number(minPrice);
      const matchMaxPrice = !maxPrice || property.price <= Number(maxPrice);
      const matchRooms = minRooms === 'all' || property.rooms >= Number(minRooms);
      const matchBathrooms = minBathrooms === 'all' || property.bathrooms >= Number(minBathrooms);
      const matchMinArea = !minArea || (property.area > 0 && property.area >= Number(minArea));
      const matchMaxArea = !maxArea || (property.area > 0 && property.area <= Number(maxArea));
      
      return matchSearch && matchCategory && matchNeighborhood && matchPropertyType &&
        matchPurpose && matchMinPrice && matchMaxPrice && matchRooms &&
        matchBathrooms && matchMinArea && matchMaxArea;
    });

    return [...matchingProperties].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'area-large':
          return b.area - a.area;
        case 'rooms':
          return b.rooms - a.rooms;
        default:
          return 0;
      }
    });
  }, [
    officialProperties,
    searchQuery,
    activeCategory,
    activeNeighborhood,
    propertyTypeFilter,
    purposeFilter,
    minPrice,
    maxPrice,
    minRooms,
    minBathrooms,
    minArea,
    maxArea,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('الكل');
    setActiveNeighborhood('الكل');
    setPropertyTypeFilter('all');
    setPurposeFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRooms('all');
    setMinBathrooms('all');
    setMinArea('');
    setMaxArea('');
    setSortBy('latest');
  };

  const activeFilterChips = [
    ...(searchQuery.trim() ? [{
      id: 'search',
      label: `بحث: ${searchQuery.trim()}`,
      onRemove: () => setSearchQuery(''),
    }] : []),
    ...(activeCategory !== 'الكل' ? [{
      id: 'category',
      label: activeCategory,
      onRemove: () => setActiveCategory('الكل'),
    }] : []),
    ...(propertyTypeFilter !== 'all' ? [{
      id: 'property-type',
      label: `النوع: ${PROPERTY_TYPES.find((type) => type.value === propertyTypeFilter)?.label}`,
      onRemove: () => setPropertyTypeFilter('all'),
    }] : []),
    ...(purposeFilter !== 'all' ? [{
      id: 'purpose',
      label: purposeFilter === 'sale' ? 'للبيع' : 'للإيجار',
      onRemove: () => setPurposeFilter('all'),
    }] : []),
    ...(activeNeighborhood !== 'الكل' ? [{
      id: 'neighborhood',
      label: `حي ${activeNeighborhood}`,
      onRemove: () => setActiveNeighborhood('الكل'),
    }] : []),
    ...(minPrice || maxPrice ? [{
      id: 'price',
      label: `السعر: ${minPrice ? `من ${formatNumber(minPrice)}` : ''}${minPrice && maxPrice ? ' إلى ' : ''}${maxPrice ? `حتى ${formatNumber(maxPrice)}` : ''} ر.س`,
      onRemove: () => {
        setMinPrice('');
        setMaxPrice('');
      },
    }] : []),
    ...(minRooms !== 'all' ? [{
      id: 'rooms',
      label: `${minRooms} غرف فأكثر`,
      onRemove: () => setMinRooms('all'),
    }] : []),
    ...(minBathrooms !== 'all' ? [{
      id: 'bathrooms',
      label: `${minBathrooms} دورات مياه فأكثر`,
      onRemove: () => setMinBathrooms('all'),
    }] : []),
    ...(minArea || maxArea ? [{
      id: 'area',
      label: `المساحة: ${minArea ? `من ${formatNumber(minArea)}` : ''}${minArea && maxArea ? ' إلى ' : ''}${maxArea ? `حتى ${formatNumber(maxArea)}` : ''} م²`,
      onRemove: () => {
        setMinArea('');
        setMaxArea('');
      },
    }] : []),
  ];

  const createCustomMarker = (price: string, propertyId: string) => {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<div data-property-id="${propertyId}" style="background-color: hsl(0 0% 13%); color: hsl(52 86% 60%); padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 12px; white-space: nowrap; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 2px solid hsl(52 86% 60%); font-family: 'Cairo', sans-serif;">${price.replace(' ر.س', '')}</div>`,
      iconSize: [80, 30],
      iconAnchor: [40, 15],
      popupAnchor: [0, -15]
    });
  };

  return (
    <main className="flex-1 w-full bg-background flex flex-col min-h-[calc(100vh-96px)]">
      
      {/* Search Header */}
      <div className="bg-secondary/90 backdrop-blur pt-8 pb-12 sticky top-24 z-30 border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  type="text" 
                  aria-label="البحث بالكلمات"
                  placeholder="ابحث بالعنوان أو الحي أو الوصف..."
                  className="w-full h-12 pl-4 pr-12 bg-white text-foreground border-none rounded-lg text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="h-12 border-primary/20 text-primary hover:bg-white shrink-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-5 h-5 ml-2" />
                التصفية المتقدمة
              </Button>
            </div>

            {/* Quick Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    activeCategory === cat 
                      ? 'bg-accent text-primary border-accent' 
                      : 'bg-white/55 text-primary/80 border-primary/15 hover:border-accent hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="bg-white rounded-2xl p-5 md:p-6 mt-2 animate-in fade-in slide-in-from-top-4 border border-border/60 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-primary">تصفية متقدمة</h2>
                    <p className="text-sm text-muted-foreground mt-1">حدّد مواصفات العرض الذي تبحث عنه</p>
                  </div>
                  <button
                    type="button"
                    aria-label="إغلاق التصفية المتقدمة"
                    onClick={() => setShowFilters(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="property-type" className="text-sm font-bold text-primary mb-2 block">نوع العقار</label>
                  <select
                    id="property-type"
                    className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:ring-1 focus:ring-ring focus:border-accent"
                    value={propertyTypeFilter}
                    onChange={(e) => setPropertyTypeFilter(e.target.value)}
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="neighborhood" className="text-sm font-bold text-primary mb-2 block">الحي</label>
                  <select 
                    id="neighborhood"
                    className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:ring-1 focus:ring-ring focus:border-accent"
                    value={activeNeighborhood}
                    onChange={(e) => setActiveNeighborhood(e.target.value)}
                  >
                    <option value="الكل">جميع الأحياء</option>
                    {uniqueNeighborhoods.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="purpose" className="text-sm font-bold text-primary mb-2 block">نوع العملية</label>
                  <select
                    id="purpose"
                    className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:ring-1 focus:ring-ring focus:border-accent"
                    value={purposeFilter}
                    onChange={(e) => setPurposeFilter(e.target.value)}
                  >
                    <option value="all">البيع والإيجار</option>
                    <option value="sale">للبيع</option>
                    <option value="rent">للإيجار</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-primary mb-2 block">نطاق السعر (ر.س)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      aria-label="الحد الأدنى للسعر"
                      type="number"
                      min="0"
                      placeholder="من"
                      className="h-11 bg-background"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      aria-label="الحد الأعلى للسعر"
                      type="number"
                      min="0"
                      placeholder="إلى"
                      className="h-11 bg-background"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="rooms" className="text-sm font-bold text-primary mb-2 block">عدد الغرف</label>
                  <select
                    id="rooms"
                    className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:ring-1 focus:ring-ring focus:border-accent"
                    value={minRooms}
                    onChange={(e) => setMinRooms(e.target.value)}
                  >
                    <option value="all">كل الأعداد</option>
                    <option value="2">غرفتان فأكثر</option>
                    <option value="3">3 غرف فأكثر</option>
                    <option value="4">4 غرف فأكثر</option>
                    <option value="5">5 غرف فأكثر</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bathrooms" className="text-sm font-bold text-primary mb-2 block">دورات المياه</label>
                  <select
                    id="bathrooms"
                    className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:ring-1 focus:ring-ring focus:border-accent"
                    value={minBathrooms}
                    onChange={(e) => setMinBathrooms(e.target.value)}
                  >
                    <option value="all">كل الأعداد</option>
                    <option value="1">دورة مياه فأكثر</option>
                    <option value="2">دورتان فأكثر</option>
                    <option value="3">3 دورات فأكثر</option>
                    <option value="4">4 دورات فأكثر</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-primary mb-2 block">نطاق المساحة (م²)</label>
                  <div className="flex items-center gap-2 max-w-md">
                    <Input
                      aria-label="الحد الأدنى للمساحة"
                      type="number"
                      min="0"
                      placeholder="من"
                      className="h-11 bg-background"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      aria-label="الحد الأعلى للمساحة"
                      type="number"
                      min="0"
                      placeholder="إلى"
                      className="h-11 bg-background"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                    />
                  </div>
                </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-border/60">
                  <span className="text-sm text-muted-foreground">تتحدث النتائج فوراً عند تغيير أي خيار</span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-primary hover:bg-secondary"
                    onClick={resetFilters}
                  >
                    <RotateCcw className="w-4 h-4 ml-2" />
                    إعادة ضبط كل الفلاتر
                  </Button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-7 md:py-10">
          {/* Results toolbar: the view switch stays centered on every screen size. */}
          <div className="flex flex-col gap-5 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center mb-5">
            <div className="flex items-center gap-3 md:justify-self-end">
              <div>
                <h2 data-testid="results-count" className="text-xl md:text-2xl font-bold text-primary">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'عقار متاح' : 'عقارات متاحة'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">من أصل {officialProperties.length} عروض رسمية</p>
              </div>
            </div>

            <div
              className="flex items-center justify-center gap-1 bg-primary/10 rounded-xl p-1 w-full md:w-auto md:min-w-[220px] justify-self-center"
              role="tablist"
              aria-label="طريقة عرض العقارات"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'grid'}
                className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-primary/65 hover:bg-white/60'}`}
                onClick={() => setViewMode('grid')}
              >
                <List className="w-4 h-4" />
                قائمة
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'map'}
                className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-primary/65 hover:bg-white/60'}`}
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="w-4 h-4" />
                خريطة
              </button>
            </div>

            <div className="flex items-center gap-2 md:justify-self-start">
              <ArrowDownUp className="w-4 h-4 text-muted-foreground shrink-0" />
              <label htmlFor="sort-results" className="text-sm text-muted-foreground whitespace-nowrap">ترتيب حسب</label>
              <select
                id="sort-results"
                className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-medium text-primary focus:ring-1 focus:ring-ring focus:border-accent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">الأحدث</option>
                <option value="price-low">السعر: الأقل أولاً</option>
                <option value="price-high">السعر: الأعلى أولاً</option>
                <option value="area-large">المساحة: الأكبر أولاً</option>
                <option value="rooms">عدد الغرف: الأكثر أولاً</option>
              </select>
            </div>
          </div>

          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-7" aria-label="الفلاتر المفعلة">
              <span className="text-sm font-bold text-primary ml-1">الفلاتر:</span>
              {activeFilterChips.map((filter) => (
                <Badge key={filter.id} variant="secondary" className="gap-1.5 rounded-full px-3 py-1.5 bg-white border border-border text-primary font-medium">
                  {filter.label}
                  <button
                    type="button"
                    aria-label={`إزالة فلتر ${filter.label}`}
                    onClick={filter.onRemove}
                    className="rounded-full hover:bg-primary/10 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
              <Button type="button" variant="ghost" className="h-8 px-2 text-sm text-muted-foreground hover:text-primary" onClick={resetFilters}>
                إعادة ضبط
              </Button>
            </div>
          )}

          {viewMode === 'grid' ? (
            filteredProperties.length > 0 ? (
              <div data-testid="property-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div data-testid="list-empty-state" className="text-center py-24 px-5 rounded-2xl border border-dashed border-border bg-white/60">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
                  <Search className="w-7 h-7 text-primary/60" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">لم نعثر على عقار بهذه المواصفات</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">جرّب توسيع نطاق السعر أو المساحة، أو احذف أحد الفلاتر للوصول إلى العروض الرسمية المتاحة.</p>
                <Button type="button" onClick={resetFilters} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <RotateCcw className="w-4 h-4 ml-2" />
                  عرض كل العقارات
                </Button>
              </div>
            )
          ) : (
          <div data-testid="map-results" className="relative w-full overflow-hidden rounded-2xl border border-border shadow-sm">
            <MapContainer 
              center={[21.3891, 39.8579]} 
              zoom={12} 
              style={{ height: 'min(760px, calc(100dvh - 310px))', minHeight: '520px', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredProperties.map((property) => (
                <Marker 
                  key={property.id} 
                  position={property.coordinates}
                  icon={createCustomMarker(property.priceLabel, property.id)}
                >
                  <Popup className="map-popup-custom">
                    <div className="flex flex-col">
                      <img src={property.image} alt={property.title} className="w-full h-32 object-cover" />
                      <div className="p-3">
                        <div className="text-xs text-muted-foreground mb-1">{property.type} • {property.city ?? "مكة المكرمة"}، حي {property.neighborhood}</div>
                        <h4 className="font-bold text-sm mb-2 line-clamp-1">{property.title}</h4>
                        <div className="font-bold text-primary mb-3">{property.priceLabel}</div>
                        <div className="flex items-center gap-2">
                          <a href={`/properties/${property.id}`} className="block flex-1 text-center bg-primary text-white py-1.5 rounded text-xs font-medium hover:bg-primary/90">
                            التفاصيل
                          </a>
                          <a href={property.sourceUrl} target="_blank" rel="noreferrer" className="block flex-1 text-center border border-primary/20 text-primary py-1.5 rounded text-xs font-medium hover:bg-secondary">
                            العرض الرسمي
                          </a>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            {filteredProperties.length === 0 && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center p-5 pointer-events-none">
                <div data-testid="map-empty-state" className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-border p-6 text-center max-w-sm pointer-events-auto">
                  <Search className="w-9 h-9 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-bold text-primary mb-1">لا توجد عروض في هذه المنطقة</h3>
                  <p className="text-sm text-muted-foreground mb-4">غيّر خيارات البحث أو أعد ضبط الفلاتر لرؤية العروض الرسمية.</p>
                  <Button type="button" size="sm" onClick={resetFilters}>
                    إعادة ضبط الفلاتر
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

    </main>
  );
}
