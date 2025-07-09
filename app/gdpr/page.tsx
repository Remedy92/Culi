'use client'

import { useState } from 'react'
import LegalLayout from '@/components/legal/LegalLayout'
import { LegalAccordion } from '@/components/legal/LegalAccordion'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'

const sections = [
  {
    id: 'gdpr-commitment',
    title: '1. Our GDPR Commitment',
    content: (
      <>
        <p>Culi is committed to compliance with the General Data Protection Regulation (GDPR). This page explains how we meet GDPR requirements and protect the rights of individuals in the European Economic Area (EEA) and United Kingdom.</p>
        
        <p className="mt-4">Key principles we follow:</p>
        <ul>
          <li><strong>Lawfulness, fairness, and transparency:</strong> We process data legally and fairly</li>
          <li><strong>Purpose limitation:</strong> We only use data for stated purposes</li>
          <li><strong>Data minimization:</strong> We collect only what&apos;s necessary</li>
          <li><strong>Accuracy:</strong> We keep data accurate and up to date</li>
          <li><strong>Storage limitation:</strong> We don&apos;t keep data longer than needed</li>
          <li><strong>Integrity and confidentiality:</strong> We ensure appropriate security</li>
          <li><strong>Accountability:</strong> We take responsibility for compliance</li>
        </ul>
      </>
    )
  },
  {
    id: 'legal-basis',
    title: '2. Legal Basis for Processing',
    content: (
      <>
        <p>We process personal data under the following legal bases:</p>

        <h4>Contract Performance</h4>
        <ul>
          <li>Processing restaurant owner data to provide our services</li>
          <li>Managing subscriptions and billing</li>
          <li>Providing customer support</li>
        </ul>

        <h4 className="mt-4">Legitimate Interests</h4>
        <ul>
          <li>Improving our services through analytics</li>
          <li>Ensuring service security and preventing fraud</li>
          <li>Sending service-related communications</li>
        </ul>

        <h4 className="mt-4">Consent</h4>
        <ul>
          <li>Marketing communications (where required)</li>
          <li>Optional features that require additional data</li>
          <li>Non-essential cookies</li>
        </ul>

        <h4 className="mt-4">Legal Obligations</h4>
        <ul>
          <li>Maintaining records for tax purposes</li>
          <li>Responding to legal requests</li>
        </ul>
      </>
    )
  },
  {
    id: 'your-gdpr-rights',
    title: '3. Your GDPR Rights',
    content: (
      <>
        <p>Under GDPR, you have the following rights:</p>

        <h4>Right to Access (Article 15)</h4>
        <p>You can request a copy of your personal data and information about how we process it.</p>

        <h4 className="mt-4">Right to Rectification (Article 16)</h4>
        <p>You can request correction of inaccurate or incomplete personal data.</p>

        <h4 className="mt-4">Right to Erasure / &quot;Right to be Forgotten&quot; (Article 17)</h4>
        <p>You can request deletion of your personal data when:</p>
        <ul>
          <li>It&apos;s no longer necessary for the original purpose</li>
          <li>You withdraw consent (where consent is the legal basis)</li>
          <li>You object to processing and we have no overriding legitimate grounds</li>
          <li>The data has been unlawfully processed</li>
        </ul>

        <h4 className="mt-4">Right to Restrict Processing (Article 18)</h4>
        <p>You can request we limit processing while we:</p>
        <ul>
          <li>Verify accuracy of data you&apos;ve contested</li>
          <li>Consider your objection to processing</li>
          <li>Determine if data should be deleted</li>
        </ul>

        <h4 className="mt-4">Right to Data Portability (Article 20)</h4>
        <p>You can receive your data in a structured, commonly used, machine-readable format and transmit it to another controller.</p>

        <h4 className="mt-4">Right to Object (Article 21)</h4>
        <p>You can object to processing based on legitimate interests or for direct marketing purposes.</p>

        <h4 className="mt-4">Rights Related to Automated Decision-Making (Article 22)</h4>
        <p>You have the right not to be subject to decisions based solely on automated processing. Note: Culi&apos;s AI assists with information but doesn&apos;t make automated decisions about individuals.</p>
      </>
    )
  },
  {
    id: 'exercising-rights',
    title: '4. How to Exercise Your Rights',
    content: (
      <>
        <p>To exercise any of your GDPR rights:</p>

        <ol>
          <li><strong>Email us</strong> at gdpr@culi.app with your request</li>
          <li><strong>Include</strong> enough information to identify your account</li>
          <li><strong>Specify</strong> which right(s) you wish to exercise</li>
          <li><strong>Provide</strong> any relevant details about your request</li>
        </ol>

        <h4 className="mt-4">Identity Verification</h4>
        <p>To protect your privacy, we may ask you to verify your identity before processing your request.</p>

        <h4 className="mt-4">Response Timeline</h4>
        <ul>
          <li>We will acknowledge your request within 72 hours</li>
          <li>We will respond fully within one month</li>
          <li>For complex requests, we may extend by two additional months (with notice)</li>
        </ul>

        <h4 className="mt-4">No Fee</h4>
        <p>Exercising your rights is free of charge. However, we may charge a reasonable fee for manifestly unfounded or excessive requests.</p>
      </>
    )
  },
  {
    id: 'data-protection-measures',
    title: '5. Data Protection Measures',
    content: (
      <>
        <p>We implement comprehensive technical and organizational measures:</p>

        <h4>Technical Measures</h4>
        <ul>
          <li>Encryption of data in transit (TLS/SSL)</li>
          <li>Encryption of data at rest</li>
          <li>Regular security assessments and penetration testing</li>
          <li>Access controls and authentication</li>
          <li>Regular backups and disaster recovery procedures</li>
          <li>Anonymization and pseudonymization where appropriate</li>
        </ul>

        <h4 className="mt-4">Organizational Measures</h4>
        <ul>
          <li>Privacy by design and default principles</li>
          <li>Regular staff training on data protection</li>
          <li>Data Processing Agreements with all processors</li>
          <li>Incident response procedures</li>
          <li>Regular privacy impact assessments</li>
          <li>Appointment of a Data Protection Officer (if required)</li>
        </ul>
      </>
    )
  },
  {
    id: 'international-transfers',
    title: '6. International Data Transfers',
    content: (
      <>
        <p>When we transfer personal data outside the EEA, we ensure appropriate safeguards:</p>

        <h4>Transfer Mechanisms</h4>
        <ul>
          <li><strong>Standard Contractual Clauses (SCCs):</strong> EU-approved contracts for data transfers</li>
          <li><strong>Adequacy Decisions:</strong> Transfers to countries deemed adequate by the EU</li>
          <li><strong>Your Consent:</strong> Where legally appropriate</li>
        </ul>

        <h4 className="mt-4">Third-Party Processors</h4>
        <p>Our main processors and their safeguards:</p>
        <ul>
          <li><strong>Supabase:</strong> EU/US data centers, SCCs in place</li>
          <li><strong>Vercel:</strong> Global CDN, SCCs for EU data</li>
          <li><strong>Stripe:</strong> Certified under relevant frameworks</li>
          <li><strong>OpenAI/xAI:</strong> SCCs and appropriate safeguards</li>
        </ul>
      </>
    )
  },
  {
    id: 'data-retention',
    title: '7. Data Retention Periods',
    content: (
      <>
        <p>We retain personal data only as long as necessary:</p>

        <table className="min-w-full divide-y divide-cinereous/20 mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-eerie-black">Data Type</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-eerie-black">Retention Period</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-eerie-black">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cinereous/10">
            <tr>
              <td className="px-4 py-2 text-sm">Guest sessions</td>
              <td className="px-4 py-2 text-sm">90 days</td>
              <td className="px-4 py-2 text-sm">Service improvement</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm">Account data</td>
              <td className="px-4 py-2 text-sm">Duration of account + 30 days</td>
              <td className="px-4 py-2 text-sm">Service provision</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm">Billing records</td>
              <td className="px-4 py-2 text-sm">7 years</td>
              <td className="px-4 py-2 text-sm">Legal requirements</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm">Marketing data</td>
              <td className="px-4 py-2 text-sm">Until consent withdrawn</td>
              <td className="px-4 py-2 text-sm">Consent-based</td>
            </tr>
          </tbody>
        </table>
      </>
    )
  },
  {
    id: 'data-breach-procedures',
    title: '8. Data Breach Procedures',
    content: (
      <>
        <p>In the event of a data breach, we follow strict procedures:</p>

        <h4>Internal Response</h4>
        <ol>
          <li>Immediate containment and assessment</li>
          <li>Investigation of scope and impact</li>
          <li>Remediation of vulnerabilities</li>
          <li>Documentation of incident</li>
        </ol>

        <h4 className="mt-4">Notification Requirements</h4>
        <ul>
          <li><strong>To Supervisory Authority:</strong> Within 72 hours if risk to rights and freedoms</li>
          <li><strong>To Affected Individuals:</strong> Without undue delay if high risk</li>
          <li><strong>Content:</strong> Nature of breach, likely consequences, measures taken</li>
        </ul>

        <h4 className="mt-4">Our Commitment</h4>
        <p>We maintain an incident response team and regularly test our procedures to ensure rapid, effective response to any potential breaches.</p>
      </>
    )
  },
  {
    id: 'children-data',
    title: '9. Children\'s Data',
    content: (
      <>
        <p>Culi is not intended for children under 16 years of age.</p>
        
        <ul>
          <li>We do not knowingly collect data from children under 16</li>
          <li>Restaurant owners must be at least 18 years old</li>
          <li>If we discover we&apos;ve collected data from a child, we delete it immediately</li>
          <li>Parents can contact us at gdpr@culi.app if they believe we have their child&apos;s data</li>
        </ul>
      </>
    )
  },
  {
    id: 'supervisory-authority',
    title: '10. Supervisory Authority',
    content: (
      <>
        <p>You have the right to lodge a complaint with a supervisory authority, particularly in the EU member state of your habitual residence, place of work, or place of alleged infringement.</p>

        <h4>Finding Your Supervisory Authority</h4>
        <p>Each EU member state has its own data protection authority. You can find yours at:</p>
        <p className="mt-2">
          <a href="https://edpb.europa.eu/about-edpb/board/members_en" className="text-spanish-orange hover:underline" target="_blank" rel="noopener noreferrer">
            European Data Protection Board - Member List
          </a>
        </p>

        <h4 className="mt-4">Lead Supervisory Authority</h4>
        <p>Our lead supervisory authority is: [Your Lead Authority Based on Main Establishment]</p>
      </>
    )
  },
  {
    id: 'updates-contact',
    title: '11. Updates and Contact Information',
    content: (
      <>
        <h4>Policy Updates</h4>
        <p>We review and update this GDPR information regularly to ensure ongoing compliance. Material changes will be communicated to affected users.</p>

        <h4 className="mt-4">Data Protection Contact</h4>
        <p>For all GDPR-related inquiries:</p>
        <ul>
          <li><strong>Email:</strong> gdpr@culi.app</li>
          <li><strong>Postal Address:</strong> [Your Company Address]</li>
          <li><strong>Response Time:</strong> Within 72 hours for acknowledgment</li>
        </ul>

        <h4 className="mt-4">Data Protection Officer</h4>
        <p>[If applicable: Contact details for your DPO]</p>
      </>
    )
  }
]

export default function GDPRCompliancePage() {
  const [openSection, setOpenSection] = useState<string>('')

  return (
    <>
      <Header />
      <main className="pt-16">
        <LegalLayout
          title="GDPR Compliance"
          lastUpdated="January 9, 2025"
          sections={sections}
          openAccordionSection={openSection}
          onAccordionChange={setOpenSection}
        >
          <div className="mb-8 p-6 bg-spanish-orange/5 rounded-lg border border-spanish-orange/20">
            <p className="text-lg text-eerie-black/90 leading-relaxed">
              The General Data Protection Regulation (GDPR) gives individuals in the European Economic Area 
              and United Kingdom important rights over their personal data. This page explains how Culi 
              complies with GDPR and how you can exercise your rights.
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