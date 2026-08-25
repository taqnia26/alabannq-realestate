import { useParams, Link } from "wouter";
import { mockProperties } from "@/data/mockProperties";
import { MapPin, Bed, Bath, Square, Check, ChevronRight, Map as MapIcon, Share2, Heart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { BrandLogo } from "@/components/BrandLogo";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";

// Fix for leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customMarkerIcon = L.divIcon({
  className: 'custom-map-marker-point',
  html: `<div style="background-color: hsl(0 0% 13%); width: 24px; height: 24px; border-radius: 50%; border: 3px solid hsl(52 86% 60%); box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const property = mockProperties.find(p => p.id === id);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">العقار غير موجود</h1>
        <Link href="/properties">
          <Button>العودة للعقارات</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full bg-background pb-24">
      
      {/* Breadcrumb */}
      <div className="bg-secondary/50 border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center text-sm text-muted-foreground gap-2">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/properties" className="hover:text-primary transition-colors">العقارات</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary font-medium">{property.title}</span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="w-full h-[50vh] md:h-[60vh] relative group bg-primary">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 relative h-full flex items-end pb-8">
          <div className="flex justify-between items-end w-full gap-4 flex-wrap">
            <div className="text-white">
              <div className="flex gap-2 mb-3">
                <Badge className="bg-accent text-primary font-bold border-none">{property.type}</Badge>
                {property.featured && <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-sm">عقار مميز</Badge>}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-white/80 text-lg">
                <MapPin className="w-5 h-5 text-accent" />
                {property.city ?? "مكة المكرمة"}، حي {property.neighborhood}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-accent text-accent' : ''}`} />
              </button>
              <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Price & Key Features Card */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {property.purpose === 'sale' ? 'سعر البيع' : 'الإيجار السنوي'}
                </div>
                <div className="text-3xl font-bold text-primary">{property.priceLabel}</div>
              </div>
              
              <div className="flex gap-8 text-center md:border-r border-border/50 md:pr-8 pl-4">
                <div>
                  <Bed className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="font-bold text-xl">{property.rooms || "—"}</div>
                  <div className="text-sm text-muted-foreground">غرف نوم</div>
                </div>
                <div>
                  <Bath className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="font-bold text-xl">{property.bathrooms || "—"}</div>
                  <div className="text-sm text-muted-foreground">دورات مياه</div>
                </div>
                <div>
                  <Square className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="font-bold text-xl">{property.area || "—"}</div>
                  <div className="text-sm text-muted-foreground">مساحة (م²)</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-accent rounded-full inline-block"></span>
                وصف العقار
              </h2>
              <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-accent rounded-full inline-block"></span>
                المميزات والمرافق
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Map */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-accent rounded-full inline-block"></span>
                الموقع على الخريطة
              </h2>
              <div className="h-[400px] rounded-2xl overflow-hidden border border-border shadow-sm">
                <MapContainer 
                  center={property.coordinates} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={property.coordinates} icon={customMarkerIcon} />
                </MapContainer>
              </div>
            </section>

          </div>

          {/* Sidebar / CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-primary text-white rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                <BrandLogo className="h-16 w-32 mx-auto mb-4 rounded-sm opacity-90" />
                  <h3 className="text-xl font-bold">مهتم بهذا العقار؟</h3>
                  <p className="text-white/70 text-sm mt-2">تواصل معنا الآن لترتيب زيارة ومناقشة التفاصيل.</p>
                </div>
                
                <div className="space-y-4">
                  <Link href="/contact">
                    <Button className="w-full h-14 bg-accent text-primary hover:bg-accent/90 text-lg font-bold">
                      طلب موعد للزيارة
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full h-14 border-white/20 text-white hover:bg-white/10 hover:text-white text-lg font-bold">
                    <Phone className="w-5 h-5 ml-2" />
                    اتصل بنا مباشرة
                  </Button>
                </div>

                <hr className="border-white/10 my-8" />
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">رقم المرجع:</span>
                    <span className="font-mono">{property.id.toUpperCase()}-2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">حالة العقار:</span>
                    <span className="text-accent font-medium">متاح</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </main>
  );
}
