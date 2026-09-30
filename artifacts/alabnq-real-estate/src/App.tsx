import { useEffect, useLayoutEffect, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

// Layout Components
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { PreferencesProvider, usePreferences } from '@/lib/preferences';
import { useLocalizedSiteValue } from '@/data/siteContent';

// Pages
import Home from '@/pages/Home';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Articles from '@/pages/Articles';
import ArticleDetail from '@/pages/ArticleDetail';
import Dashboard from '@/admin/Dashboard';
import { discardPendingImages } from '@/admin/ImageInput';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
function AdminRoute() {
  const { t } = usePreferences();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/session', { credentials: 'include', signal: controller.signal })
      .then(response => { if (response.status === 401) return false; if (!response.ok) throw new Error(); return true; })
      .then(setAuthorized)
      .catch(() => { if (!controller.signal.aborted) setError(t('تعذر التحقق من الجلسة. أعد تحميل الصفحة.', 'Could not check your session. Reload the page.')); });
    return () => controller.abort();
  }, []);
  if (error) return <main role="alert" className="min-h-screen grid place-items-center">{error}</main>;
  if (authorized === null) return <main className="min-h-screen grid place-items-center">{t('جارٍ التحقق من الحساب…', 'Checking your account…')}</main>;
  if (!authorized) return <AuthScreen onSuccess={() => setAuthorized(true)} />;
  const logout = async () => {
    await discardPendingImages();
    const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    if (!response.ok) { setError(t('تعذر تسجيل الخروج. حاول مجددًا.', 'Could not sign out. Try again.')); return; }
    queryClient.clear();
    setAuthorized(false);
  };
  return <Dashboard onLogout={() => void logout()} />;
}

function AuthScreen({ onSuccess }: { onSuccess?: () => void }) {
  const { t, locale } = usePreferences();
  const [, setLocation] = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error || t('تعذر تسجيل الدخول.', 'Could not sign in.'));
        return;
      }
      form.reset();
      if (onSuccess) onSuccess();
      else setLocation('/admin');
    } catch { setError(t('تعذر الاتصال بالخادم. حاول مجددًا.', 'Could not reach the server. Try again.')); }
    finally { setBusy(false); }
  };
  return <main dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background px-4 py-16">
    <img src={`${basePath}/brand/alabnq-logo.png`} alt={t('العبنق العقارية', 'Alabnq Real Estate')} className="h-20 w-20 rounded-lg object-cover object-center" />
    <div className="text-center"><h1 className="text-2xl font-bold">{t('إدارة العبنق العقارية', 'Alabnq Administration')}</h1><p className="text-sm text-muted-foreground mt-2">{t('الدخول مخصص لمدير الموقع المعتمد', 'Sign-in is reserved for the authorized administrator.')}</p></div>
    <form onSubmit={e => void submit(e)} className="w-full max-w-[440px] space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h2 className="text-xl font-bold">{t('تسجيل الدخول', 'Sign in')}</h2>
      <label className="block text-sm font-semibold" htmlFor="admin-email">{t('البريد الإلكتروني', 'Email')}</label>
      <input id="admin-email" data-testid="input-admin-email" name="email" type="email" autoComplete="username" required maxLength={254} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground" />
      <label className="block text-sm font-semibold" htmlFor="admin-password">{t('كلمة المرور', 'Password')}</label>
      <input id="admin-password" data-testid="input-admin-password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground" />
      {error && <p role="alert" data-testid="error-admin-login" className="text-sm text-red-600">{error}</p>}
      <button data-testid="button-admin-login" className="site-button w-full px-5 py-3" type="submit" disabled={busy}>{busy ? t('جارٍ الدخول...', 'Signing in...') : t('دخول', 'Sign in')}</button>
    </form>
  </main>;
}

function VisitTracker() {
  const [location] = useLocation();
  useEffect(() => {
    if (location.startsWith('/admin') || location.startsWith('/sign-')) return;
    let session = sessionStorage.getItem('alabnq-visit-session');
    if (!session) { session = crypto.randomUUID(); sessionStorage.setItem('alabnq-visit-session', session); }
    const params = new URLSearchParams(window.location.search);
    const campaign = params.get('utm_campaign') || sessionStorage.getItem('alabnq-utm-campaign') || undefined;
    const channel = params.get('utm_source') || sessionStorage.getItem('alabnq-utm-source') || undefined;
    if (campaign) sessionStorage.setItem('alabnq-utm-campaign', campaign);
    if (channel) sessionStorage.setItem('alabnq-utm-source', channel);
    void fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: location, session, campaign, channel }) });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <DocumentMetadata />
      <ScrollToTop />
      <VisitTracker />
      <div className="flex flex-col min-h-[100dvh] w-full font-sans selection:bg-accent selection:text-primary">
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/admin" component={AdminRoute} />
            <Route path="/sign-in" component={() => <AuthScreen />} />
            <Route path="/sign-up" component={() => <AuthScreen />} />
            <Route>
              <><Navbar /><Switch>
            <Route path="/" component={Home} />
            <Route path="/properties" component={Properties} />
            <Route path="/properties/:id" component={PropertyDetail} />
            <Route path="/articles" component={Articles} />
            <Route path="/articles/:id" component={ArticleDetail} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
              </Switch><Footer /><WhatsAppButton /></>
            </Route>
          </Switch>
        </RoutedErrorBoundary>
      </div>
    </>
  );
}

function DocumentMetadata() {
  const { locale } = usePreferences();
  const description = useLocalizedSiteValue(
    'seo.description',
    'شركة العبنق العقارية — خبرة عقارية.. وخدمات متكاملة.',
    'Alabnq Real Estate Company — real estate expertise and integrated services.',
  );
  useEffect(() => {
    const name = locale === 'ar' ? 'شركة العبنق العقارية' : 'Alabnq Real Estate Company';
    document.title = name;
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      document.querySelector(selector)?.setAttribute('content', description);
    }
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      document.querySelector(selector)?.setAttribute('content', name);
    }
  }, [description, locale]);
  return null;
}

function ScrollToTop() {
  const [location] = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <WouterRouter base={basePath}><PreferencesProvider><AppWithRouter /></PreferencesProvider></WouterRouter>;
}

function AppWithRouter() {
  return (
    <QueryClientProvider client={queryClient}>
       <TooltipProvider>
          <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
