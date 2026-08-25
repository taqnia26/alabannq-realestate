import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Bed, Bath, Square, Heart, HeartOff, ChevronLeft } from "lucide-react";
import { Property } from "@/data/mockProperties";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" />
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Tags */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Badge className="bg-primary text-primary-foreground border-none font-medium px-3 py-1">
            {property.type}
          </Badge>
          {property.featured && (
            <Badge className="bg-accent text-accent-foreground border-none font-medium px-3 py-1">
              مميز
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-primary hover:bg-accent transition-colors"
        >
          {isFavorite ? (
            <Heart className="w-5 h-5 fill-destructive stroke-destructive" />
          ) : (
            <Heart className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4 text-accent" />
          <span>{property.city ?? "مكة المكرمة"}، حي {property.neighborhood}</span>
        </div>

        <Link href={`/properties/${property.id}`} className="inline-block mb-2 group/title">
          <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover/title:text-accent transition-colors">
            {property.title}
          </h3>
        </Link>
        
        <div className="text-2xl font-bold text-primary mb-6 mt-auto">
          {property.priceLabel}
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/50 mb-6">
          <div className="flex flex-col items-center gap-1">
            <Bed className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">{property.rooms || "—"} <span className="text-muted-foreground font-normal">غرف</span></span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-border/50">
            <Bath className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">{property.bathrooms || "—"} <span className="text-muted-foreground font-normal">حمامات</span></span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Square className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">{property.area || "—"} <span className="text-muted-foreground font-normal">م²</span></span>
          </div>
        </div>

        <Link
          href={`/properties/${property.id}`}
          className="flex items-center justify-between w-full py-2 text-sm font-bold text-primary hover:text-accent transition-colors"
        >
          <span>عرض التفاصيل</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
