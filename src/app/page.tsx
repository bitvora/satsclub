import Image from "next/image";
import Link from "next/link";
import { prisma } from "../../lib/prisma";

async function getSettings() {
  console.log('🔍 getSettings: Starting function');
  console.log('🔍 getSettings: Environment NODE_ENV:', process.env.NODE_ENV);
  console.log('🔍 getSettings: Database URL exists:', !!process.env.DATABASE_URL);
  
  try {
    console.log('🔍 getSettings: Attempting to query database...');
    let settings = await prisma.settings.findFirst();
    console.log('🔍 getSettings: Query completed');
    console.log('🔍 getSettings: Settings found:', !!settings);
    
    if (settings) {
      console.log('🔍 getSettings: Settings data:', {
        id: settings.id,
        siteName: settings.siteName,
        description: settings.description?.substring(0, 50) + '...',
        subscriptionPrice: settings.subscriptionPrice,
        currency: settings.currency
      });
      return settings;
    }
    
    // Create default settings if none exist
    console.log('🔍 getSettings: No settings found, creating default...');
    settings = await prisma.settings.create({
      data: {
        siteName: "SatsClub",
        description: "Premium content powered by Bitcoin subscriptions",
        subscriptionPrice: 10.00,
        currency: "USD"
      }
    });
    console.log('🔍 getSettings: Default settings created:', settings.id);
    
    return settings;
  } catch (error) {
    console.error('❌ getSettings: Error occurred:', error);
    console.error('❌ getSettings: Error name:', (error as Error)?.name);
    console.error('❌ getSettings: Error message:', (error as Error)?.message);
    console.error('❌ getSettings: Error stack:', (error as Error)?.stack);
    
    // Return default settings if database is not available
    console.log('🔍 getSettings: Returning fallback default settings');
    return {
      id: 'fallback',
      siteName: "SatsClub",
      description: "Premium content powered by Bitcoin subscriptions",
      profilePicture: null,
      bannerPicture: null,
      subscriptionPrice: 10.00,
      currency: "USD",
      paymentProvider: "btcpay",
      webhookSecret: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export default async function Home() {
  const settings = await getSettings();

  const formatPeriodDisplay = (period: string) => {
    switch (period) {
      case 'DAILY': return 'day'
      case 'WEEKLY': return 'week'
      case 'MONTHLY': return 'month'
      case 'QUARTERLY': return 'quarter'
      case 'ANNUALLY': return 'year'
      default: return 'month'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Banner Image */}
        {settings.bannerPicture && (
          <div className="absolute inset-0 z-0">
            <Image
              src={settings.bannerPicture}
              alt="Banner"
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900" />
          </div>
        )}

        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Profile Picture */}
            <div className="mb-8">
              {settings.profilePicture ? (
                <Image
                  src={settings.profilePicture}
                  alt={settings.siteName}
                  width={120}
                  height={120}
                  className="mx-auto rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="mx-auto w-30 h-30 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {settings.siteName[0]?.toUpperCase() || 'S'}
                </div>
              )}
            </div>

            {/* Site Name */}
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              {settings.siteName}
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              {settings.description}
            </p>

            {/* Pricing */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full px-8 py-4 shadow-lg border border-slate-200 dark:border-slate-700">
                <span className="text-3xl">₿</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {settings.currency === 'BTC' ? '' : '$'}{settings.subscriptionPrice?.toString() || '10.00'}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {settings.currency === 'BTC' ? 'sats' : `/${settings.currency}`} per month
                  {/* per {formatPeriodDisplay(settings.subscriptionPeriod || 'MONTHLY')} */}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 min-w-[200px]"
              >
                Start Subscription
              </Link>
              
              <Link
                href="/auth/signin"
                className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold px-8 py-4 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 min-w-[200px]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
              Why Choose SatsClub?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">₿</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Bitcoin Payments
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Secure, decentralized payments with Bitcoin. No banks, no intermediaries.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Self-Hosted
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Complete control over your content and subscriber data.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Premium Content
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  High-quality videos, images, and blog posts for subscribers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
