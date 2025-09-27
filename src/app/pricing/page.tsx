'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Trial',
    price: 0,
    period: '14 days free',
    description: 'Perfect for trying out our AI assistant',
    features: [
      'Up to 50 calls per month',
      'Basic transcription',
      'Email support',
      'HIPAA compliant',
      'Basic analytics',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    popular: false,
    planId: 'trial',
  },
  {
    name: 'Starter',
    price: 79,
    period: 'per month',
    description: 'Great for small practices getting started',
    features: [
      'Up to 200 calls per month',
      'Advanced transcription & analysis',
      'Email & chat support',
      'HIPAA compliant',
      'Advanced analytics',
      'Custom AI training',
      'Appointment scheduling',
      'Patient intake forms',
    ],
    limitations: [],
    cta: 'Get Starter Plan',
    popular: false,
    planId: 'starter',
  },
  {
    name: 'Professional',
    price: 199,
    period: 'per month',
    description: 'Perfect for growing practices',
    features: [
      'Up to 500 calls per month',
      'Premium transcription & AI analysis',
      'Priority support',
      'HIPAA compliant',
      'Advanced analytics & reporting',
      'Custom AI training',
      'Appointment scheduling',
      'Patient intake forms',
      'Multi-user access',
      'Custom integrations',
      'API access',
    ],
    limitations: [],
    cta: 'Get Professional Plan',
    popular: true,
    planId: 'professional',
  },
  {
    name: 'Enterprise',
    price: 499,
    period: 'per month',
    description: 'For large practices and organizations',
    features: [
      'Unlimited calls',
      'Premium transcription & AI analysis',
      'Dedicated support',
      'HIPAA compliant',
      'Advanced analytics & reporting',
      'Custom AI training',
      'Appointment scheduling',
      'Patient intake forms',
      'Multi-user access',
      'Custom integrations',
      'API access',
      'White-label options',
      'Custom features',
      'Dedicated account manager',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    planId: 'enterprise',
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const router = useRouter();

  const handleGetStarted = (planId: string) => {
    if (planId === 'enterprise') {
      // Redirect to contact form
      window.location.href = 'mailto:sales@mentalhealthhub.com?subject=Enterprise Plan Inquiry';
    } else {
      // Redirect to signup with plan parameter
      router.push(`/auth/signup?plan=${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-px h-6 bg-gradient-to-b from-blue-500 to-cyan-400 mr-3"></div>
              <Link href="/" className="text-xl font-normal tracking-tight text-black hover:text-blue-600 transition-colors">
                The Mental Health Hub
              </Link>
            </div>
            <div className="flex items-center space-x-8">
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
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light text-black leading-tight mb-6">
            Simple, transparent pricing
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
            Choose the perfect plan for your practice. Start with a free trial and scale as you grow.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`mx-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white border transition-all duration-200 hover:border-blue-500 flex flex-col h-full ${
                plan.popular ? 'border-blue-500 shadow-sm' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-3 py-1 text-xs font-normal tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-normal text-black mb-2">{plan.name}</h3>
                <p className="text-gray-600 font-light text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-light text-black">
                      ${isAnnual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 font-light text-sm ml-2">/{isAnnual ? 'month' : plan.period}</span>
                    )}
                    {plan.price === 0 && (
                      <span className="text-gray-600 font-light text-sm ml-2">{plan.period}</span>
                    )}
                  </div>
                  {isAnnual && plan.price > 0 && (
                    <p className="text-xs text-gray-500 font-light mt-1">
                      Billed annually (${Math.round(plan.price * 0.8 * 12)}/year)
                    </p>
                  )}
                </div>

                <div className="flex-grow">
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 text-xs font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="mb-6 p-3 bg-gray-50 border border-gray-100">
                      <p className="text-xs font-light text-gray-600 mb-2">Limitations:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-xs text-gray-500 font-light">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => handleGetStarted(plan.planId)}
                    className={`w-full py-2 px-4 text-sm font-normal tracking-wide transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white'
                        : 'bg-white border border-gray-200 text-black hover:border-blue-500'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-light text-center text-black mb-6">
            Frequently Asked Questions
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-normal text-black mb-3">
                How does the free trial work?
              </h3>
              <p className="text-gray-600 font-light text-sm leading-relaxed">
                Start with a 14-day free trial that includes up to 50 calls. No credit card required. 
                You can upgrade or cancel anytime during the trial period.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-normal text-black mb-3">
                What happens if I exceed my call limit?
              </h3>
              <p className="text-gray-600 font-light text-sm leading-relaxed">
                Additional calls are charged at the overage rate shown for each plan. You'll receive 
                notifications as you approach your limit.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-normal text-black mb-3">
                Is my data secure and HIPAA compliant?
              </h3>
              <p className="text-gray-600 font-light text-sm leading-relaxed">
                Yes, all data is encrypted end-to-end and we maintain full HIPAA compliance. 
                We never store or share patient information inappropriately.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-normal text-black mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 font-light text-sm leading-relaxed">
                Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect 
                at your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-normal text-black mb-3">
                Do you offer custom integrations?
              </h3>
              <p className="text-gray-600 font-light text-sm leading-relaxed">
                Professional and Enterprise plans include API access and custom integrations. 
                Contact us to discuss your specific needs.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-normal text-black mb-3">
                What support do you provide?
              </h3>
              <p className="text-gray-600 font-light text-sm leading-relaxed">
                All plans include support. Starter gets email & chat, Professional gets priority support, 
                and Enterprise gets a dedicated account manager.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 border border-gray-200 p-12">
          <h2 className="text-3xl font-light text-black mb-4">
            Ready to transform your practice?
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto mb-6"></div>
          <p className="text-gray-600 font-light leading-relaxed mb-8">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-2 text-sm font-normal tracking-wide hover:from-blue-600 hover:to-cyan-500 transition-all duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              href="/"
              className="bg-white border border-gray-200 text-black px-6 py-2 text-sm font-normal tracking-wide hover:border-blue-500 transition-all duration-200"
            >
              Try Demo Call
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
