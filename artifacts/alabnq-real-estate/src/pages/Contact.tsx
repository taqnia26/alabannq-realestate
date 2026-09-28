import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useSiteValue } from "@/data/siteContent";

const contactSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يكون أكثر من حرفين" }),
  phone: z.string().min(9, { message: "رقم الجوال غير صحيح" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }).optional().or(z.literal("")),
  message: z.string().min(10, { message: "الرسالة قصيرة جداً" }),
});

export default function Contact() {
  const address = useSiteValue("contact.address", "مكة المكرمة – العوالي – شارع الشيخ محمد بن مانع");
  const phone = useSiteValue("contact.phone", "8002450000");
  const heading = useSiteValue("contact.heading", "تواصل معنا");
  const intro = useSiteValue("contact.intro", "تواصل مع العبنق عقارات للاستفسار عن إدارة الأملاك، أو التسويق العقاري، أو العروض المتاحة.");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof contactSchema>) {
    setSubmitError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("تعذر إرسال الرسالة. حاول مرة أخرى.");
      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "تعذر إرسال الرسالة.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 w-full bg-background pt-16 pb-24">
      
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">{heading}</h1>
          <p className="text-lg text-muted-foreground">
            {intro}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-primary text-white p-10 rounded-2xl shadow-xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-20"></div>
              
              <h3 className="text-2xl font-bold mb-8 relative z-10">معلومات التواصل</h3>
              
              <div className="space-y-8 relative z-10 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">العنوان</h4>
                    <p className="text-white/70">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">الهاتف</h4>
                    <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-white/70 hover:text-accent transition-colors" dir="ltr">{phone}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">البريد الإلكتروني</h4>
                    <a href="mailto:info@alabnq.com" className="text-white/70 hover:text-accent transition-colors">info@alabnq.com</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border p-8 md:p-12 rounded-2xl shadow-sm h-full">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">شكراً لتواصلك معنا</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    تم حفظ رسالتك بنجاح، وسيتمكن فريقنا من مراجعتها من لوحة التحكم.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-primary mb-8">أرسل لنا رسالة</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">الاسم الكريم</FormLabel>
                              <FormControl>
                                <Input placeholder="الاسم الكامل" {...field} className="bg-secondary/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">رقم الجوال</FormLabel>
                              <FormControl>
                                <Input placeholder="05XXXXXXXX" dir="ltr" className="text-right bg-secondary/30" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">البريد الإلكتروني (اختياري)</FormLabel>
                            <FormControl>
                              <Input placeholder="example@domain.com" dir="ltr" className="text-right bg-secondary/30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">كيف يمكننا مساعدتك؟</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="اكتب رسالتك هنا..." 
                                className="min-h-[150px] resize-none bg-secondary/30" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {submitError && <p role="alert" className="text-red-700 text-sm">{submitError}</p>}
                      <Button type="submit" disabled={submitting} size="lg" className="w-full text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
                        <Send className="w-5 h-5 ml-2 rotate-180" />
                        {submitting ? "جارٍ إرسال الرسالة…" : "إرسال الرسالة"}
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
