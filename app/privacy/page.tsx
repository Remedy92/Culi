'use client'

import { useState } from 'react'
import LegalLayout from '@/components/legal/LegalLayout'
import { LegalAccordion } from '@/components/legal/LegalAccordion'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'

const sections = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: (
      <>
        <p>At Culi, we are committed to protecting your privacy. We collect different types of information depending on whether you are a restaurant owner or a guest.</p>
        
        <h4>For Restaurant Owners:</h4>
        <ul>
          <li>Account information (name, email, restaurant details)</li>
          <li>Billing information (processed securely through Stripe)</li>
          <li>Menu content and restaurant preferences</li>
          <li>Usage analytics and interaction data</li>
        </ul>

        <h4>For Guests:</h4>
        <ul>
          <li>Session information (anonymized and hashed)</li>
          <li>Language preferences</li>
          <li>General location (country/region only, no IP addresses stored)</li>
          <li>Questions asked and interactions with the menu</li>
        </ul>

        <p className="mt-4"><strong>Important:</strong> We do not store IP addresses or any personally identifiable information from guests unless explicitly provided.</p>
      </>
    )
  },
  {
    id: 'how-we-use-information',
    title: '2. How We Use Information',
    content: (
      <>
        <p>We use the collected information to:</p>
        <ul>
          <li>Provide and improve our AI-powered menu assistance service</li>
          <li>Process payments and manage subscriptions</li>
          <li>Analyze usage patterns to enhance user experience</li>
          <li>Communicate with restaurant owners about their accounts</li>
          <li>Ensure compliance with our terms of service</li>
          <li>Train and improve our AI models (using anonymized data only)</li>
        </ul>
      </>
    )
  },
  {
    id: 'data-storage-security',
    title: '3. Data Storage and Security',
    content: (
      <>
        <p>We take data security seriously:</p>
        <ul>
          <li>All data is encrypted in transit and at rest</li>
          <li>We use industry-standard security measures</li>
          <li>Access to data is restricted on a need-to-know basis</li>
          <li>Regular security audits and updates</li>
          <li>Secure infrastructure provided by Supabase and Vercel</li>
        </ul>

        <h4>Data Retention:</h4>
        <ul>
          <li>Guest session data: Automatically deleted after 90 days</li>
          <li>Restaurant data: Retained while account is active</li>
          <li>Deleted account data: Removed within 30 days of deletion request</li>
        </ul>
      </>
    )
  },
  {
    id: 'data-sharing',
    title: '4. Data Sharing and Third Parties',
    content: (
      <>
        <p>We do not sell your data. We share information only in these limited circumstances:</p>
        <ul>
          <li><strong>Service Providers:</strong> With trusted partners who help us operate our service (e.g., Stripe for payments, OpenAI/xAI for AI processing)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Business Transfers:</strong> In the event of a merger or acquisition</li>
          <li><strong>With Consent:</strong> When you explicitly authorize us to share</li>
        </ul>

        <p className="mt-4">All third-party providers are bound by strict confidentiality agreements.</p>
      </>
    )
  },
  {
    id: 'cookies-tracking',
    title: '5. Cookies and Tracking',
    content: (
      <>
        <p>We use minimal cookies and tracking technologies:</p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for the service to function properly</li>
          <li><strong>Analytics Cookies:</strong> To understand usage patterns (anonymized)</li>
          <li><strong>No Third-Party Marketing Cookies:</strong> We do not use advertising or marketing tracking</li>
        </ul>

        <p className="mt-4">You can control cookies through your browser settings. Note that disabling essential cookies may affect functionality.</p>
      </>
    )
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    content: (
      <>
        <p>Depending on your location, you may have the following rights:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update or correct inaccurate data</li>
          <li><strong>Deletion:</strong> Request deletion of your data</li>
          <li><strong>Portability:</strong> Receive your data in a portable format</li>
          <li><strong>Objection:</strong> Object to certain processing activities</li>
          <li><strong>Restriction:</strong> Request limited processing of your data</li>
        </ul>

        <p className="mt-4">To exercise these rights, contact us at privacy@culi.app</p>
      </>
    )
  },
  {
    id: 'international-transfers',
    title: '7. International Data Transfers',
    content: (
      <>
        <p>Your data may be transferred and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including:</p>
        <ul>
          <li>Standard contractual clauses approved by relevant authorities</li>
          <li>Compliance with applicable data protection laws</li>
          <li>Working only with providers who maintain adequate security standards</li>
        </ul>
      </>
    )
  },
  {
    id: 'childrens-privacy',
    title: '8. Children\'s Privacy',
    content: (
      <>
        <p>Culi is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 13, we will promptly delete it.</p>
      </>
    )
  },
  {
    id: 'changes-to-policy',
    title: '9. Changes to This Policy',
    content: (
      <>
        <p>We may update this Privacy Policy from time to time. When we make significant changes:</p>
        <ul>
          <li>We will update the &quot;Last updated&quot; date</li>
          <li>For material changes, we will notify restaurant owners via email</li>
          <li>Continued use of the service constitutes acceptance of the updated policy</li>
        </ul>
      </>
    )
  },
  {
    id: 'contact-us',
    title: '10. Contact Us',
    content: (
      <>
        <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> privacy@culi.app</li>
          <li><strong>Address:</strong> [Your Company Address]</li>
        </ul>

        <p className="mt-4">For data protection inquiries in the EU, you may also contact your local data protection authority.</p>
      </>
    )
  }
]

export default function PrivacyPolicyPage() {
  const [openSection, setOpenSection] = useState<string>('')

  return (
    <>
      <Header />
      <main className="pt-16">
        <LegalLayout
          title="Privacy Policy"
          lastUpdated="January 9, 2025"
          sections={sections}
          openAccordionSection={openSection}
          onAccordionChange={setOpenSection}
        >
          <div className="mb-8 p-6 bg-spanish-orange/5 rounded-lg border border-spanish-orange/20">
            <p className="text-lg text-eerie-black/90 leading-relaxed">
              Your privacy is fundamental to how we&apos;ve built Culi. We&apos;ve designed our service to collect 
              minimal data and protect your information at every step. This policy explains what data we 
              collect, how we use it, and your rights regarding your information.
            </p>
          </div>

          <LegalAccordion 
            sections={sections} 
            value={openSection}
            onValueChange={setOpenSection}
          />
        </LegalLayout>
      </main>
      <Footer />
    </>
  )
}