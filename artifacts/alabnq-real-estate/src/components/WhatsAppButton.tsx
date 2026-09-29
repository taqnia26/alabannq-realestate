import { FaWhatsapp } from "react-icons/fa";
import { useSiteValue } from "@/data/siteContent";
import { usePreferences } from "@/lib/preferences";

const whatsappUrl = "https://wa.me/9668002450000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B9%D9%82%D8%A7%D8%B1%20%D9%81%D9%8A%20%D9%85%D9%83%D8%A9%20%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9.";

export function WhatsAppButton() {
  const { t } = usePreferences();
  const phone = useSiteValue("contact.whatsapp", "9668002450000").replace(/[^\d]/g, "");
  const href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(t("مرحبًا، أرغب بالاستفسار عن عقار.", "Hello, I would like to ask about a property."))}` : whatsappUrl;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={t("تواصل معنا عبر واتساب", "Contact us on WhatsApp")}
      className="fixed bottom-6 end-6 z-50 flex h-13 w-13 items-center justify-center rounded-full border border-[#e5c180]/50 bg-[#172329] text-[#e5c180] shadow-xl transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5c180]"
    >
      <FaWhatsapp className="h-8 w-8" aria-hidden="true" />
      <span className="sr-only">{t("تواصل عبر واتساب", "Chat on WhatsApp")}</span>
    </a>
  );
}