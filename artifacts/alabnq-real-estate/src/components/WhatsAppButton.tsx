import { FaWhatsapp } from "react-icons/fa";

const whatsappUrl = "https://wa.me/9668002450000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B9%D9%82%D8%A7%D8%B1%20%D9%81%D9%8A%20%D9%85%D9%83%D8%A9%20%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9.";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="whatsapp-float fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30"
    >
      <FaWhatsapp className="h-8 w-8" aria-hidden="true" />
      <span className="sr-only">تواصل عبر واتساب</span>
    </a>
  );
}