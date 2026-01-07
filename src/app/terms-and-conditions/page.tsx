// src/app/terms-and-conditions/page.tsx
import { SiteHeader } from '@/components/app/site-header';
import { SiteFooter } from '@/components/app/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col font-inter">
      <SiteHeader user={null} onLogin={() => {}} credits={null} creditsLoading={false} userLoading={false} />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl py-16 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Terms and Conditions</CardTitle>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                Please read these Terms and Conditions ("Terms") carefully before using the PostAI service (the "Service")
                operated by Imam Bello ("us", "we", or "our").
              </p>

              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of
                the terms, then you may not access the Service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                PostAI is an AI-powered tool designed to format text for social media platforms like LinkedIn. The Service
                uses credits for certain features, such as "Auto Format".
              </p>

              <h2>3. User Accounts</h2>
              <p>
                To access most features of the Service, you must register for an account using Google Authentication. You
                are responsible for safeguarding your account and for any activities or actions under your account.
              </p>

              <h2>4. Credits and Payments</h2>
              <p>
                The Service operates on a credit system. You may receive free credits upon signup and may be granted
                additional free credits under certain conditions (e.g., monthly grants). Additional credits can be
                purchased through our third-party payment processor, Paystack. All purchases are final and
                non-refundable. Credits are non-transferable and have no cash value.
              </p>

              <h2>5. User Conduct</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Submit any content that is unlawful, harmful, threatening, or otherwise objectionable.</li>
                <li>Impersonate any person or entity.</li>
                <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
                <li>Abuse the free credit system by repeatedly creating and deleting accounts.</li>
              </ul>

              <h2>6. Privacy</h2>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal
                information. By using our Service, you agree to the collection and use of information in accordance with our
                Privacy Policy. We do not store, save, or claim any ownership over the content you format using our Service.
              </p>

              <h2>7. Termination</h2>
              <p>
                We may terminate or suspend your access to our Service immediately, without prior notice or liability, for
                any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right
                to use the Service will immediately cease. If you wish to terminate your account, you may do so from your
                profile page.
              </p>

              <h2>8. Disclaimer of Warranties</h2>
              <p>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or
                implied, that the Service will be uninterrupted, timely, secure, or error-free.
              </p>
              
              <h2>9. Limitation of Liability</h2>
              <p>
                In no event shall Imam Bello be liable for any indirect, incidental, special, consequential or punitive
                damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                resulting from your access to or use of or inability to access or use the Service.
              </p>

              <h2>10. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its
                conflict of law provisions.
              </p>

              <h2>11. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide
                notice of any changes by posting the new Terms on this page.
              </p>

              <h2>Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at belloimam431@gmail.com.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter reviewText="" setReviewText={() => {}} isSubmittingReview={false} userLoading={false} handleSubmitReview={() => {}} />
    </div>
  );
}
