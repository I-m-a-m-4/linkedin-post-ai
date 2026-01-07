// src/app/privacy-policy/page.tsx
import { SiteHeader } from '@/components/app/site-header';
import { SiteFooter } from '@/components/app/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col font-inter">
      <SiteHeader user={null} onLogin={() => {}} credits={null} creditsLoading={false} userLoading={false} />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl py-16 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                Welcome to PostAI. We are committed to protecting your privacy. This Privacy Policy explains how we
                collect, use, and share information about you when you use our service.
              </p>

              <h2>Information We Collect</h2>
              <p>We collect information in the following ways:</p>
              <ul>
                <li>
                  <strong>Information you provide us:</strong> This includes your Google account information (email address,
                  name, profile picture) when you sign up and log in. We also collect any feedback or reviews you submit.
                </li>
                <li>
                  <strong>Information we collect automatically:</strong> When you use our service, we may log usage data,
                  such as when you use the "Auto Format" feature. We do not save or store the content of the posts you
                  format.
                </li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our service.</li>
                <li>Manage your account and credit balance.</li>
                <li>Communicate with you, including responding to your comments and questions.</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our service.</li>
              </ul>

              <h2>Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share information as follows:
              </p>
              <ul>
                <li>With your consent.</li>
                <li>For legal reasons, such as to comply with a law, regulation, or legal process.</li>
                <li>
                  With third-party service providers who perform services on our behalf, such as payment processing (Paystack)
                  and AI model providers (Google Gemini), subject to confidentiality obligations.
                </li>
              </ul>

              <h2>Data Storage and Security</h2>
              <p>
                Your user profile, credit balance, and transaction history are stored securely in Google Firebase. We do not
                store the text of the LinkedIn posts you format. We take reasonable measures to help protect information
                about you from loss, theft, misuse, and unauthorized access.
              </p>

              <h2>Your Choices</h2>
              <p>
                You have the right to access, update, or delete your personal information. You can delete your account from
                your profile page. Please note that deleting your account will remove your authentication record and reviews, and
                your credit balance will be reset to zero to prevent abuse of the free credit system.
              </p>

              <h2>Changes to This Policy</h2>
              <p>
                We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the
                date at the top of the policy and, in some cases, we may provide you with additional notice.
              </p>

              <h2>Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at belloimam431@gmail.com.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter reviewText="" setReviewText={() => {}} isSubmittingReview={false} userLoading={false} handleSubmitReview={() => {}} />
    </div>
  );
}
