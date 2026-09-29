import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
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

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

function AdminRoute() {
  const { t, locale } = usePreferences();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  if (!isLoaded) return <main className="min-h-screen grid place-items-center">{t('جارٍ التحقق من الحساب…', 'Checking your account…')}</main>;
  if (!isSignedIn) return <AuthScreen signUp={false} />;
  const email = user.primaryEmailAddress;
  if (email?.emailAddress.toLowerCase() !== 'info@alabannaq.com' || email.verification?.status !== 'verified') {
    return <main className="min-h-screen grid place-items-center p-6 text-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}><div><h1 className="text-2xl font-bold mb-4">{t('غير مصرح بالدخول', 'Access denied')}</h1><p>{t('هذا الحساب ليس حساب مدير الموقع.', 'This account is not a site administrator.')}</p><button className="mt-6 underline" onClick={() => signOut({ redirectUrl: basePath || '/' })}>{t('تسجيل الخروج', 'Sign out')}</button></div></main>;
  }
  return <Dashboard onLogout={() => void signOut({ redirectUrl: basePath || '/' })} />;
}

function AuthScreen({ signUp }: { signUp: boolean }) {
  const { t, locale } = usePreferences();
  return <main dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background px-4 py-16">
    <img src={`${basePath}/brand/alabnq-logo.png`} alt={t('العبنق العقارية', 'Alabnq Real Estate')} className="h-20 w-20 rounded-lg object-cover object-center" />
    <div className="text-center"><h1 className="text-2xl font-bold">{t('إدارة العبنق العقارية', 'Alabnq Administration')}</h1><p className="text-sm text-muted-foreground mt-2">{t('الدخول مخصص لمدير الموقع المعتمد', 'Sign-in is reserved for the authorized administrator.')}</p></div>
    {signUp
      ? <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      : <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/admin`} />}
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
            <Route path="/sign-in/*?" component={() => <AuthScreen signUp={false} />} />
            <Route path="/sign-up/*?" component={() => <AuthScreen signUp />} />
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
  const [, setLocation] = useLocation();
  const { locale } = usePreferences();
  if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={{
        theme: shadcn, cssLayerName: 'clerk',
        options: { logoPlacement: 'inside', logoImageUrl: `${window.location.origin}${basePath}/logo.svg`, logoLinkUrl: basePath || '/' },
        variables: { colorPrimary: '#b39445', colorForeground: '#222222', colorMutedForeground: '#595959', colorBackground: '#ffffff', colorInput: '#f8f6f0', colorInputForeground: '#222222', colorNeutral: '#dedbd1', fontFamily: 'Cairo, sans-serif', borderRadius: '12px' },
        elements: { cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden', card: '!shadow-none !border-0 !bg-transparent', footer: '!shadow-none !border-0 !bg-transparent', headerTitle: 'text-[#222]', headerSubtitle: 'text-[#595959]', formFieldLabel: 'text-[#222]', footerActionLink: 'text-[#806223]', footerActionText: 'text-[#595959]', dividerText: 'text-[#595959]', socialButtonsBlockButtonText: 'text-[#222]', formButtonPrimary: 'bg-[#b39445] text-white', formFieldInput: 'bg-[#f8f6f0] text-[#222]' },
      }}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
       localization={locale === 'ar' ? { signIn: { start: { title: 'تسجيل الدخول', subtitle: 'أدخل بريد المدير وكلمة المرور' } }, signUp: { start: { title: 'إنشاء حساب المدير', subtitle: 'أنشئ حسابك ببريد المدير المعتمد' } } } : undefined}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
    <QueryClientProvider client={queryClient}>
       <TooltipProvider>
          <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
