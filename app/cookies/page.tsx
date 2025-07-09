import LegalLayout from '@/components/legal/LegalLayout'
import { LegalAccordion } from '@/components/legal/LegalAccordion'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'

const sections = [
  {
    id: 'what-are-cookies',
    title: '1. What Are Cookies?',
    content: (
      <>
        <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by:</p>
        <ul>
          <li>Remembering your preferences and settings</li>
          <li>Understanding how you use our service</li>
          <li>Improving our service based on usage patterns</li>
          <li>Ensuring the security of your session</li>
        </ul>

        <p className="mt-4">Cookies do not contain personally identifiable information and cannot harm your device.</p>
      </>
    )
  },
  {
    id: 'types-of-cookies',
    title: '2. Types of Cookies We Use',
    content: (
      <>
        <h4>Essential Cookies</h4>
        <p>These cookies are necessary for the website to function properly. They enable core functionality such as:</p>
        <ul>
          <li>Security and authentication</li>
          <li>Session management</li>
          <li>Language preferences</li>
          <li>Accessibility features</li>
        </ul>

        <h4 className="mt-4">Functional Cookies</h4>
        <p>These cookies remember your choices to provide enhanced features:</p>
        <ul>
          <li>Language and region preferences</li>
          <li>User interface customizations</li>
          <li>Recently viewed menus</li>
        </ul>

        <h4 className="mt-4">Analytics Cookies</h4>
        <p>We use analytics cookies to understand how visitors interact with our service:</p>
        <ul>
          <li>Pages visited and time spent</li>
          <li>Features used most frequently</li>
          <li>Error messages encountered</li>
          <li>Performance metrics</li>
        </ul>

        <p className="mt-4"><strong>Note:</strong> We do not use third-party advertising or marketing cookies.</p>
      </>
    )
  },
  {
    id: 'cookie-details',
    title: '3. Specific Cookies We Use',
    content: (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cinereous/20">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-eerie-black">Cookie Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-eerie-black">Purpose</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-eerie-black">Duration</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-eerie-black">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinereous/10">
              <tr>
                <td className="px-4 py-2 text-sm">culi_session</td>
                <td className="px-4 py-2 text-sm">Maintains user session</td>
                <td className="px-4 py-2 text-sm">Session</td>
                <td className="px-4 py-2 text-sm">Essential</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">culi_lang</td>
                <td className="px-4 py-2 text-sm">Stores language preference</td>
                <td className="px-4 py-2 text-sm">1 year</td>
                <td className="px-4 py-2 text-sm">Functional</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">culi_analytics</td>
                <td className="px-4 py-2 text-sm">Anonymous usage analytics</td>
                <td className="px-4 py-2 text-sm">30 days</td>
                <td className="px-4 py-2 text-sm">Analytics</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">culi_consent</td>
                <td className="px-4 py-2 text-sm">Cookie consent preferences</td>
                <td className="px-4 py-2 text-sm">1 year</td>
                <td className="px-4 py-2 text-sm">Essential</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    )
  },
  {
    id: 'third-party-cookies',
    title: '4. Third-Party Cookies',
    content: (
      <>
        <p>Some third-party services we use may set their own cookies:</p>
        
        <h4>Stripe (Payment Processing)</h4>
        <ul>
          <li>Used only during payment transactions</li>
          <li>Ensures secure payment processing</li>
          <li>Subject to Stripe&apos;s privacy policy</li>
        </ul>

        <h4 className="mt-4">Supabase (Authentication)</h4>
        <ul>
          <li>Manages secure user authentication</li>
          <li>Session management for logged-in users</li>
          <li>Subject to Supabase&apos;s privacy policy</li>
        </ul>

        <p className="mt-4">We carefully select our third-party partners and ensure they maintain high privacy standards.</p>
      </>
    )
  },
  {
    id: 'managing-cookies',
    title: '5. Managing Your Cookie Preferences',
    content: (
      <>
        <p>You have several options for managing cookies:</p>

        <h4>Browser Settings</h4>
        <p>Most browsers allow you to:</p>
        <ul>
          <li>View and delete cookies</li>
          <li>Block all cookies</li>
          <li>Block third-party cookies only</li>
          <li>Clear cookies when you close the browser</li>
          <li>Receive a warning before accepting cookies</li>
        </ul>

        <h4 className="mt-4">Cookie Consent Tool</h4>
        <p>When you first visit our site, you can choose which types of cookies to accept. You can change these preferences at any time through our cookie settings.</p>

        <h4 className="mt-4">Impact of Disabling Cookies</h4>
        <p>Please note that disabling certain cookies may:</p>
        <ul>
          <li>Prevent you from accessing secure areas</li>
          <li>Reduce functionality of the service</li>
          <li>Require you to re-enter preferences each visit</li>
        </ul>
      </>
    )
  },
  {
    id: 'cookie-settings-browsers',
    title: '6. Browser-Specific Cookie Settings',
    content: (
      <>
        <p>Here&apos;s how to manage cookies in popular browsers:</p>
        
        <ul>
          <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
          <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
          <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
          <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site data</li>
        </ul>

        <p className="mt-4">For other browsers, please check your browser&apos;s help documentation.</p>
      </>
    )
  },
  {
    id: 'do-not-track',
    title: '7. Do Not Track Signals',
    content: (
      <>
        <p>Some browsers offer a &quot;Do Not Track&quot; (DNT) setting. Currently, there is no industry standard for handling DNT signals. Our service does not change its behavior based on DNT signals, but we:</p>
        <ul>
          <li>Respect your cookie preferences set through our consent tool</li>
          <li>Minimize data collection by default</li>
          <li>Do not use tracking for advertising purposes</li>
        </ul>
      </>
    )
  },
  {
    id: 'updates-to-policy',
    title: '8. Updates to This Policy',
    content: (
      <>
        <p>We may update this Cookie Policy to reflect:</p>
        <ul>
          <li>Changes in our cookies or purposes</li>
          <li>New legal requirements</li>
          <li>Improvements to our service</li>
        </ul>

        <p className="mt-4">When we make significant changes, we will:</p>
        <ul>
          <li>Update the &quot;Last updated&quot; date</li>
          <li>Notify you through our cookie consent tool</li>
          <li>Request renewed consent if necessary</li>
        </ul>
      </>
    )
  },
  {
    id: 'contact-information',
    title: '9. Contact Information',
    content: (
      <>
        <p>If you have questions about our use of cookies or this policy, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> privacy@culi.app</li>
          <li><strong>Address:</strong> [Your Company Address]</li>
        </ul>

        <p className="mt-4">For general privacy inquiries, please refer to our Privacy Policy.</p>
      </>
    )
  }
]

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <LegalLayout
          title="Cookie Policy"
          lastUpdated="January 9, 2025"
          sections={sections}
        >
          <div className="mb-8 p-6 bg-spanish-orange/5 rounded-lg border border-spanish-orange/20">
            <p className="text-lg text-eerie-black/90 leading-relaxed">
              This Cookie Policy explains how Culi uses cookies and similar technologies to provide and 
              improve our service. We believe in transparency about our data practices and want you to 
              understand how and why we use cookies.
            </p>
          </div>

          <LegalAccordion sections={sections} />
        </LegalLayout>
      </main>
      <Footer />
    </>
  )
}