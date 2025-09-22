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
    limitations: [
      'Limited to 50 calls/month',
      'Basic features only',
    ],
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
    limitations: [
      '$0.50 per additional call',
    ],
    cta: 'Start Free Trial',
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
    limitations: [
      '$0.40 per additional call',
    ],
    cta: 'Start Free Trial',
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
      window.location.href = 'mailto:sales@lighthouse-ai.com?subject=Enterprise Plan Inquiry';
    } else {
      // Redirect to signup with plan parameter
      router.push(`/auth/signup?plan=${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Lighthouse AI Assistant
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ${isAnnual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">/{isAnnual ? 'month' : plan.period}</span>
                    )}
                    {plan.price === 0 && (
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    )}
                  </div>
                  {isAnnual && plan.price > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Billed annually (${Math.round(plan.price * 0.8 * 12)}/year)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-2">Limitations:</p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-gray-500">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => handleGetStarted(plan.planId)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How does the free trial work?
              </h3>
              <p className="text-gray-600">
                Start with a 14-day free trial that includes up to 50 calls. No credit card required. 
                You can upgrade or cancel anytime during the trial period.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What happens if I exceed my call limit?
              </h3>
              <p className="text-gray-600">
                Additional calls are charged at the overage rate shown for each plan. You'll receive 
                notifications as you approach your limit.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is my data secure and HIPAA compliant?
              </h3>
              <p className="text-gray-600">
                Yes, all data is encrypted end-to-end and we maintain full HIPAA compliance. 
                We never store or share patient information inappropriately.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect 
                at your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer custom integrations?
              </h3>
              <p className="text-gray-600">
                Professional and Enterprise plans include API access and custom integrations. 
                Contact us to discuss your specific needs.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What support do you provide?
              </h3>
              <p className="text-gray-600">
                All plans include support. Starter gets email & chat, Professional gets priority support, 
                and Enterprise gets a dedicated account manager.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your practice?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Demo Call
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
