'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { config, formatPhoneForDisplay, getPhoneLink } from '@/lib/config';

export default function Home() {
  const { data: session, status } = useSession();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-px h-6 bg-gradient-to-b from-blue-500 to-cyan-400 mr-3"></div>
              <h1 className="text-xl font-normal tracking-tight text-black">
                The Mental Health Hub
              </h1>
            </div>
            <div className="flex items-center space-x-8">
              {session ? (
                <div className="flex items-center space-x-6">
                  <span className="text-sm text-gray-600 font-light">
                    {session.user.organization?.name}
                  </span>
                  <Link
                    href="/dashboard"
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-2 text-sm font-normal tracking-wide hover:from-blue-600 hover:to-cyan-500 transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="text-gray-700 hover:text-black text-sm font-normal tracking-wide transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-black text-sm font-normal tracking-wide transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-2 text-sm font-normal tracking-wide hover:from-blue-600 hover:to-cyan-500 transition-all duration-200"
                  >
                    Start Trial
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative">
          <div className="max-w-4xl mx-auto px-8 py-40 text-center">
            <div className="space-y-16 min-h-[70vh] flex flex-col justify-center">
              <div className="space-y-8">
                <h1 className="text-7xl lg:text-8xl font-light text-black leading-[0.85] tracking-tight">
                  Never miss
                  <br />
                  another call
                </h1>
                <div className="w-32 h-px bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto"></div>
                <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
                  AI assistant handles patient calls, scheduling, and intake interviews 24/7 while you focus on providing care.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-8 sm:space-y-0 sm:space-x-16">
                <div className="flex items-center space-x-6">
                  {session ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-3 text-sm font-normal tracking-wide hover:from-blue-600 hover:to-cyan-500 transition-all duration-200"
                      >
                        Dashboard
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signup"
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-3 text-sm font-normal tracking-wide hover:from-blue-600 hover:to-cyan-500 transition-all duration-200"
                      >
                        Start Trial
                      </Link>
                    </>
                  )}
                </div>
                
                {/* Integrated Demo Line */}
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full animate-pulse"></div>
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs text-gray-500 font-light uppercase tracking-widest">
                      Demo Line
                    </p>
                    <a 
                      href={`tel:${getPhoneLink(config.vapi.phoneNumber)}`}
                      className="block text-lg font-light text-black hover:text-blue-600 transition-colors tracking-wide"
                    >
                      {formatPhoneForDisplay(config.vapi.phoneNumber)}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.015]">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }}></div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 py-32">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Section Header */}
              <div className="col-span-12 lg:col-span-4">
                  <div className="space-y-6">
                  <h2 className="text-4xl font-light text-black leading-tight">
                    How it works
                  </h2>
                  <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Your AI assistant handles patient calls seamlessly while you focus on providing quality care.
                  </p>
                </div>
              </div>

              {/* Process Steps */}
              <div className="col-span-12 lg:col-span-8">
                <div className="space-y-16">
                  {/* Step 1 */}
                  <div className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center text-sm font-light rounded-full">
                        01
                      </div>
                    </div>
                    <div className="col-span-10">
                      <h3 className="text-xl font-light text-black mb-3">Patient Calls</h3>
                      <p className="text-gray-600 font-light leading-relaxed">
                        When patients call your practice, the AI assistant answers professionally and handles all scheduling inquiries with natural conversation.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center text-sm font-light rounded-full">
                        02
                      </div>
                    </div>
                    <div className="col-span-10">
                      <h3 className="text-xl font-light text-black mb-3">Intake & Screening</h3>
                      <p className="text-gray-600 font-light leading-relaxed">
                        Conducts thorough intake interviews, collects insurance information, and screens for urgency with HIPAA-compliant data handling.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center text-sm font-light rounded-full">
                        03
                      </div>
                    </div>
                    <div className="col-span-10">
                      <h3 className="text-xl font-light text-black mb-3">Schedule & Notify</h3>
                      <p className="text-gray-600 font-light leading-relaxed">
                        Schedules appointments in your calendar and provides you with detailed intake summaries and patient information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features Grid */}
            <div className="mt-32 pt-16 border-t border-blue-100/50">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-normal text-black uppercase tracking-widest">24/7 Coverage</h4>
                    <p className="text-sm text-gray-600 font-light leading-relaxed">Never miss calls while with clients</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-normal text-black uppercase tracking-widest">HIPAA Secure</h4>
                    <p className="text-sm text-gray-600 font-light leading-relaxed">Full encryption & secure handling</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-normal text-black uppercase tracking-widest">Instant Setup</h4>
                    <p className="text-sm text-gray-600 font-light leading-relaxed">Ready to use in minutes</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-normal text-black uppercase tracking-widest">Analytics</h4>
                    <p className="text-sm text-gray-600 font-light leading-relaxed">Track calls & conversions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-white py-32">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Section Header */}
              <div className="col-span-12 lg:col-span-4">
                  <div className="space-y-6">
                  <h2 className="text-4xl font-light text-black leading-tight">
                    Transparent pricing
                  </h2>
                  <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Start with a free trial and scale as your practice grows.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-block text-gray-700 hover:text-blue-600 text-sm font-normal tracking-wide transition-colors border-b border-gray-300 hover:border-blue-500 pb-1"
                  >
                    View all plans
                  </Link>
                </div>
              </div>

              {/* Pricing Plans */}
              <div className="col-span-12 lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Trial Plan */}
                  <div className="space-y-6 p-8 border border-gray-200">
                    <div className="space-y-4">
                      <h3 className="text-lg font-light text-black">Trial</h3>
                      <div className="space-y-1">
                        <div className="text-3xl font-light text-black">$0</div>
                        <div className="text-sm text-gray-600 font-light">14 days</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 font-light">• Up to 50 calls</div>
                      <div className="text-sm text-gray-600 font-light">• HIPAA compliant</div>
                      <div className="text-sm text-gray-600 font-light">• Basic analytics</div>
                    </div>
                  </div>

                  {/* Professional Plan */}
                  <div className="space-y-6 p-8 bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                    <div className="space-y-4">
                      <h3 className="text-lg font-light">Professional</h3>
                      <div className="space-y-1">
                        <div className="text-3xl font-light">$199</div>
                        <div className="text-sm text-blue-100 font-light">per month</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm text-blue-100 font-light">• Up to 500 calls/month</div>
                      <div className="text-sm text-blue-100 font-light">• Advanced AI analysis</div>
                      <div className="text-sm text-blue-100 font-light">• Multi-user access</div>
                      <div className="text-sm text-blue-100 font-light">• API access</div>
                    </div>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="space-y-6 p-8 border border-gray-200">
                    <div className="space-y-4">
                      <h3 className="text-lg font-light text-black">Enterprise</h3>
                      <div className="space-y-1">
                        <div className="text-3xl font-light text-black">$499</div>
                        <div className="text-sm text-gray-600 font-light">per month</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 font-light">• Unlimited calls</div>
                      <div className="text-sm text-gray-600 font-light">• White-label options</div>
                      <div className="text-sm text-gray-600 font-light">• Dedicated support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gray-50 py-32">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-5xl font-light text-black leading-tight max-w-4xl mx-auto">
                  Ready to transform your practice?
                </h2>
                <div className="w-24 h-px bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto"></div>
                <p className="text-lg text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
                  Start your free trial today. No credit card required. Setup takes less than 5 minutes.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-12 py-4 text-sm font-normal tracking-wide hover:from-blue-600 hover:to-cyan-500 transition-all duration-200"
                >
                  Start Free Trial
                </Link>
                <a 
                  href={`tel:${getPhoneLink(config.vapi.phoneNumber)}`}
                  className="text-gray-700 hover:text-blue-600 text-sm font-normal tracking-wide transition-colors border-b border-gray-300 hover:border-blue-500 pb-1"
                >
                  Try Demo Call
                </a>
              </div>
              
              <div className="flex items-center justify-center space-x-8 text-xs text-gray-500 font-light uppercase tracking-widest">
                <span>14-day free trial</span>
                <span>•</span>
                <span>No setup fees</span>
                <span>•</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
