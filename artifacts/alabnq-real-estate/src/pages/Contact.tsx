import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpLeft, Check, Mail, MapPin, Phone } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocalizedSiteValue, useSiteValue } from "@/data/siteContent";
import { usePreferences } from "@/lib/preferences";

const schema = z.object({ name: z.string().min(2), phone: z.string().min(9), email: z.string().email().optional().or(z.literal("")), message: z.string().min(10) });
type Values = z.infer<typeof schema>;

export default function Contact() {
  const { locale, t } = usePreferences();
  const heading = useLocalizedSiteValue("contact.heading", "تواصل معنا", "Let's talk");
  const intro = useLocalizedSiteValue("contact.intro", "شركة العبنق العقارية — شريككم في الخدمات العقارية.", "Alabnq Real Estate — your partner in property services.");
  const address = useLocalizedSiteValue("contact.address", "مكة المكرمة – العوالي – شارع الشيخ محمد بن مانع", "Makkah – Al-Awali – Sheikh Mohammed bin Manea Street");
  const phone = useSiteValue("contact.phone", "8002450000");
  const email = useSiteValue("footer.email", "info@alabnq.com");
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", phone: "", email: "", message: "" } });
  const onSubmit = async (values: Values) => { setSubmitError(""); setSubmitting(true); try { const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); if (!response.ok) throw new Error(t("تعذر إرسال الرسالة. حاول مرة أخرى.", "Could not send your message. Please try again.")); setSent(true); form.reset(); } catch (error) { setSubmitError(error instanceof Error ? error.message : t("تعذر إرسال الرسالة.", "Could not send your message.")); } finally { setSubmitting(false); } };
  return <main className="site-shell flex-1 pb-28">
    <section className="site-always-dark relative isolate overflow-hidden bg-[#172329] py-24 text-[#f0ebdf] md:py-32"><img src="/hero/riyadh-financial.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" /><div className="absolute inset-0 bg-gradient-to-l from-[#172329]/90 via-[#172329]/65 to-[#172329]/40" /><div className="site-container relative"><span className="site-eyebrow">{t("لنبدأ الحديث", "START A CONVERSATION")}</span><h1 className="site-display mt-7 text-5xl md:text-7xl">{heading}</h1><p className="mt-7 max-w-xl text-base leading-9 text-[#eee8db]/75">{intro}</p></div></section>
    <div className="site-container grid gap-14 py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-24 lg:py-28">
      <aside><span className="site-eyebrow">{t("تجدنا هنا", "FIND US HERE")}</span><h2 className="site-display mt-6 text-3xl md:text-4xl">{t("معلومات التواصل", "Contact details")}</h2><div className="mt-12 space-y-7">
        <div className="flex gap-5 border-b border-[var(--line-soft)] pb-7"><MapPin size={20} className="mt-1 shrink-0 text-accent" /><div><h3 className="mb-2 text-xs font-bold text-muted-foreground">{t("العنوان", "ADDRESS")}</h3><p className="text-sm leading-8">{address}</p></div></div>
        <div className="flex gap-5 border-b border-[var(--line-soft)] pb-7"><Phone size={20} className="mt-1 shrink-0 text-accent" /><div><h3 className="mb-2 text-xs font-bold text-muted-foreground">{t("الهاتف", "PHONE")}</h3><a href={`tel:${phone.replace(/[^\d+]/g, "")}`} dir="ltr" className="text-sm hover:text-accent">{phone}</a></div></div>
        <div className="flex gap-5 border-b border-[var(--line-soft)] pb-7"><Mail size={20} className="mt-1 shrink-0 text-accent" /><div><h3 className="mb-2 text-xs font-bold text-muted-foreground">{t("البريد الإلكتروني", "EMAIL")}</h3><a href={`mailto:${email}`} className="text-sm hover:text-accent">{email}</a></div></div>
      </div></aside>
      <div className="site-card p-7 md:p-12">{sent ? <div role="status" className="flex min-h-[440px] flex-col items-start justify-center"><span className="flex h-12 w-12 items-center justify-center border border-accent text-accent"><Check size={24} /></span><h2 className="site-display mt-7 text-3xl">{t("شكرًا لتواصلك معنا", "Thank you for reaching out")}</h2><p className="mt-4 text-sm leading-8 text-muted-foreground">{t("تم حفظ رسالتك بنجاح، وسيتمكن فريقنا من مراجعتها من لوحة التحكم.", "Your message has been saved. Our team will be able to review it.")}</p><button type="button" onClick={() => setSent(false)} className="site-button mt-8 px-7 py-3 text-sm">{t("إرسال رسالة أخرى", "Send another message")}</button></div> : <><span className="site-eyebrow">{t("اترك رسالة", "LEAVE A MESSAGE")}</span><h2 className="site-display mb-9 mt-5 text-3xl">{t("كيف يمكننا مساعدتك؟", "How can we help?")}</h2><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="grid gap-6 sm:grid-cols-2"><FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>{t("الاسم الكريم", "Your name")}</FormLabel><FormControl><Input data-testid="input-contact-name" placeholder={t("الاسم الكامل", "Full name")} className="site-input mt-2 h-12 rounded-none" {...field} /></FormControl><FormMessage>{form.formState.errors.name && t("أدخل اسمًا من حرفين على الأقل", "Enter a name with at least 2 characters")}</FormMessage></FormItem>} /><FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>{t("رقم الجوال", "Phone number")}</FormLabel><FormControl><Input data-testid="input-contact-phone" placeholder="05XXXXXXXX" dir="ltr" className="site-input mt-2 h-12 rounded-none" {...field} /></FormControl><FormMessage>{form.formState.errors.phone && t("أدخل رقم هاتف صحيحًا", "Enter a valid phone number")}</FormMessage></FormItem>} /></div>
        <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>{t("البريد الإلكتروني (اختياري)", "Email (optional)")}</FormLabel><FormControl><Input data-testid="input-contact-email" placeholder="name@example.com" dir="ltr" className="site-input mt-2 h-12 rounded-none" {...field} /></FormControl><FormMessage>{form.formState.errors.email && t("أدخل بريدًا إلكترونيًا صحيحًا", "Enter a valid email address")}</FormMessage></FormItem>} />
        <FormField control={form.control} name="message" render={({ field }) => <FormItem><FormLabel>{t("رسالتك", "Your message")}</FormLabel><FormControl><Textarea data-testid="input-contact-message" placeholder={t("اكتب رسالتك هنا...", "Write your message here...")} className="site-input mt-2 min-h-40 resize-y rounded-none" {...field} /></FormControl><FormMessage>{form.formState.errors.message && t("أدخل رسالة من 10 أحرف على الأقل", "Enter a message of at least 10 characters")}</FormMessage></FormItem>} />
        {submitError && <p role="alert" className="text-sm text-destructive">{locale === "en" ? t("تعذر إرسال الرسالة. حاول مرة أخرى.", "Could not send your message. Please try again.") : submitError}</p>}
        <button data-testid="button-contact-submit" type="submit" disabled={submitting} className="site-button flex min-h-14 w-full items-center justify-center gap-4 px-7 text-sm font-bold disabled:opacity-60">{submitting ? t("جارٍ الإرسال...", "Sending...") : t("إرسال الرسالة", "Send message")} <ArrowUpLeft size={17} /></button>
      </form></Form></>}</div>
    </div>
  </main>;
}