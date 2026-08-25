import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, SlidersHorizontal, Filter, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { mockProperties, uniqueNeighborhoods } from "@/data/mockProperties";
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

const ALL_CATEGORIES = ['الكل', 'عمائر للبيع', 'شقق للإيجار', 'أراضي للبيع'];

export default function Properties() {
  const [location] = useLocation();
  
  // Parse query params if any
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [activeNeighborhood, setActiveNeighborhood] = useState<string>('الكل');
  const [purposeFilter, setPurposeFilter] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('all');
  const [minRooms, setMinRooms] = useState<string>('all');
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredProperties = useMemo(() => {
    return mockProperties.filter(property => {
      const matchSearch = property.title.includes(searchQuery) || 
                          property.neighborhood.includes(searchQuery) ||
                          property.description.includes(searchQuery);
      
      const matchCategory = activeCategory === 'الكل' || property.type === activeCategory;
      const matchNeighborhood = activeNeighborhood === 'الكل' || property.neighborhood === activeNeighborhood;
      const matchPurpose = purposeFilter === 'all' || property.purpose === purposeFilter;
      const matchPrice = minPrice === 'all' || property.price >= Number(minPrice);
      const matchRooms = minRooms === 'all' || property.rooms >= Number(minRooms);
      
      return matchSearch && matchCategory && matchNeighborhood && matchPurpose && matchPrice && matchRooms;
    });
  }, [searchQuery, activeCategory, activeNeighborhood, purposeFilter, minPrice, minRooms]);

  const createCustomMarker = (price: string) => {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="background-color: hsl(0 0% 13%); color: hsl(52 86% 60%); padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 12px; white-space: nowrap; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 2px solid hsl(52 86% 60%); font-family: 'Cairo', sans-serif;">${price.replace(' ر.س', '')}</div>`,
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
                  placeholder="ابحث عن عقار..." 
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
              <div className="flex bg-primary/10 rounded-lg p-1 shrink-0 h-12">
                <button 
                  className={`px-6 py-1.5 rounded-md font-medium text-sm transition-colors ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-primary/70 hover:bg-white/60'}`}
                  onClick={() => setViewMode('grid')}
                >
                  قائمة
                </button>
                <button 
                  className={`px-6 py-1.5 rounded-md font-medium text-sm transition-colors ${viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-primary/70 hover:bg-white/60'}`}
                  onClick={() => setViewMode('map')}
                >
                  خريطة
                </button>
              </div>
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
              <div className="bg-white rounded-xl p-6 mt-2 animate-in fade-in slide-in-from-top-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-bold text-primary mb-3 block">الحي</label>
                  <select 
                    className="w-full h-11 rounded-md border border-border px-3 text-sm focus:ring-1 focus:ring-ring focus:border-accent"
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
                  <label className="text-sm font-bold text-primary mb-3 block">نوع العملية</label>
                  <select
                    className="w-full h-11 rounded-md border border-border px-3 text-sm focus:ring-1 focus:ring-ring focus:border-accent"
                    value={purposeFilter}
                    onChange={(e) => setPurposeFilter(e.target.value)}
                  >
                    <option value="all">البيع والإيجار</option>
                    <option value="sale">للبيع</option>
                    <option value="rent">للإيجار</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-primary mb-3 block">الحد الأدنى للسعر</label>
                  <select
                    className="w-full h-11 rounded-md border border-border px-3 text-sm focus:ring-1 focus:ring-ring focus:border-accent"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  >
                    <option value="all">كل الأسعار</option>
                    <option value="1000000">من مليون ريال</option>
                    <option value="3000000">من 3 ملايين ريال</option>
                    <option value="5000000">من 5 ملايين ريال</option>
                    <option value="10000000">من 10 ملايين ريال</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-primary mb-3 block">عدد الغرف</label>
                  <select
                    className="w-full h-11 rounded-md border border-border px-3 text-sm focus:ring-1 focus:ring-ring focus:border-accent"
                    value={minRooms}
                    onChange={(e) => setMinRooms(e.target.value)}
                  >
                    <option value="all">كل المساحات</option>
                    <option value="2">غرفتان فأكثر</option>
                    <option value="3">3 غرف فأكثر</option>
                    <option value="4">4 غرف فأكثر</option>
                    <option value="5">5 غرف فأكثر</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('الكل');
                      setActiveNeighborhood('الكل');
                      setPurposeFilter('all');
                      setMinPrice('all');
                      setMinRooms('all');
                    }}
                  >
                    إعادة ضبط
                  </Button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {viewMode === 'grid' ? (
          <div className="container mx-auto px-4 py-12">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary">
                {filteredProperties.length} عقار متاح
              </h2>
            </div>
            
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold text-primary mb-2">لا توجد نتائج مطابقة</h3>
                <p className="text-muted-foreground">جرب تغيير كلمات البحث أو استخدام تصفية مختلفة.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 h-full relative w-full">
            <MapContainer 
              center={[21.3891, 39.8579]} 
              zoom={12} 
              style={{ height: 'calc(100vh - 250px)', width: '100%' }}
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
                  icon={createCustomMarker(property.priceLabel)}
                >
                  <Popup className="map-popup-custom">
                    <div className="flex flex-col">
                      <img src={property.image} alt={property.title} className="w-full h-32 object-cover" />
                      <div className="p-3">
                        <div className="text-xs text-muted-foreground mb-1">{property.type} • {property.city ?? "مكة المكرمة"}، حي {property.neighborhood}</div>
                        <h4 className="font-bold text-sm mb-2 line-clamp-1">{property.title}</h4>
                        <div className="font-bold text-primary mb-3">{property.priceLabel}</div>
                        <a href={`/properties/${property.id}`} className="block w-full text-center bg-primary text-white py-1.5 rounded text-xs font-medium hover:bg-primary/90">
                          التفاصيل
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

    </main>
  );
}
