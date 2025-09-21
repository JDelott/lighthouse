'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { referralFormSchema } from '@/lib/validation';
import { ReferralFormData } from '@/lib/types';
import { sanitizePhoneNumber, sanitizeString } from '@/lib/validation';

const COMMON_SYMPTOMS = [
  'anxiety',
  'depression',
  'panic attacks',
  'sleep issues',
  'substance abuse',
  'trauma',
  'PTSD',
  'bipolar disorder',
  'eating disorder',
  'OCD',
  'ADHD',
  'family conflict',
  'relationship issues',
  'grief',
  'anger management',
  'social anxiety',
  'phobias',
  'self-harm',
  'suicidal thoughts'
];

const SPECIALTIES = [
  'Anxiety Disorders',
  'Depression',
  'Trauma & PTSD',
  'Substance Abuse',
  'Eating Disorders',
  'Bipolar Disorder',
  'OCD',
  'ADHD',
  'Family Therapy',
  'Couples Therapy',
  'Child & Adolescent',
  'Grief Counseling',
  'Anger Management'
];

export default function NewReferralPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ReferralFormData>({
    resolver: zodResolver(referralFormSchema),
    defaultValues: {
      priority: 'medium',
      preferredContactMethod: 'phone',
      urgencyLevel: 5,
      symptoms: [],
      specialtyPreference: []
    }
  });

  const urgencyLevel = watch('urgencyLevel');

  const handleSymptomToggle = (symptom: string) => {
    const updated = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter(s => s !== symptom)
      : [...selectedSymptoms, symptom];
    
    setSelectedSymptoms(updated);
    setValue('symptoms', updated);
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const updated = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter(s => s !== specialty)
      : [...selectedSpecialties, specialty];
    
    setSelectedSpecialties(updated);
    setValue('specialtyPreference', updated);
  };

  const onSubmit = async (data: ReferralFormData) => {
    setIsSubmitting(true);
    
    try {
      // Sanitize form data
      const sanitizedData = {
        ...data,
        firstName: sanitizeString(data.firstName),
        lastName: sanitizeString(data.lastName),
        phone: sanitizePhoneNumber(data.phone),
        email: sanitizeString(data.email),
        address: {
          street: sanitizeString(data.address.street),
          city: sanitizeString(data.address.city),
          state: sanitizeString(data.address.state),
          zipCode: sanitizeString(data.address.zipCode)
        },
        emergencyContact: {
          ...data.emergencyContact,
          name: sanitizeString(data.emergencyContact.name),
          relationship: sanitizeString(data.emergencyContact.relationship),
          phone: sanitizePhoneNumber(data.emergencyContact.phone)
        },
        referralReason: sanitizeString(data.referralReason),
        notes: data.notes ? sanitizeString(data.notes) : undefined
      };

      // TODO: Submit to API endpoint
      console.log('Submitting referral:', sanitizedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      router.push('/');
    } catch (error) {
      console.error('Failed to submit referral:', error);
      alert('Failed to submit referral. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">New Mental Health Referral</h1>
            <p className="mt-1 text-sm text-gray-600">
              Submit a new referral request. All information is encrypted and HIPAA compliant.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-8">
            {/* Patient Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    {...register('firstName')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    {...register('lastName')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                  <input
                    type="date"
                    {...register('dateOfBirth')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...register('phone')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                  <input
                    type="text"
                    {...register('address.street')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.address?.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    {...register('address.city')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.address?.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State *</label>
                  <input
                    type="text"
                    placeholder="MA"
                    maxLength={2}
                    {...register('address.state')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.address?.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code *</label>
                  <input
                    type="text"
                    placeholder="02101"
                    {...register('address.zipCode')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.address?.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Insurance Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                  <input
                    type="text"
                    placeholder="Blue Cross Blue Shield"
                    {...register('insuranceProvider')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Insurance ID</label>
                  <input
                    type="text"
                    {...register('insuranceId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Emergency Contact *</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    {...register('emergencyContact.name')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.emergencyContact?.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship *</label>
                  <input
                    type="text"
                    placeholder="Spouse, Parent, Sibling, etc."
                    {...register('emergencyContact.relationship')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.emergencyContact?.relationship && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.relationship.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...register('emergencyContact.phone')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.emergencyContact?.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Referral Details */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Referral Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason for Referral *</label>
                  <textarea
                    rows={4}
                    {...register('referralReason')}
                    placeholder="Please describe the reason for this mental health referral..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.referralReason && (
                    <p className="mt-1 text-sm text-red-600">{errors.referralReason.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms (Select all that apply) *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {COMMON_SYMPTOMS.map((symptom) => (
                      <label key={symptom} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSymptoms.includes(symptom)}
                          onChange={() => handleSymptomToggle(symptom)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{symptom}</span>
                      </label>
                    ))}
                  </div>
                  {errors.symptoms && (
                    <p className="mt-1 text-sm text-red-600">{errors.symptoms.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority Level *</label>
                    <select
                      {...register('priority')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Contact Method *</label>
                    <select
                      {...register('preferredContactMethod')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="fax">Fax</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Urgency Level: {urgencyLevel}/10 *
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      {...register('urgencyLevel', { valueAsNumber: true })}
                      className="mt-2 block w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty Preferences (Optional)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SPECIALTIES.map((specialty) => (
                      <label key={specialty} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSpecialties.includes(specialty)}
                          onChange={() => handleSpecialtyToggle(specialty)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                  <textarea
                    rows={3}
                    {...register('notes')}
                    placeholder="Any additional information that might be helpful..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Referral'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
