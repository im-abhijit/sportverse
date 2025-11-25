import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy — SportVerse</h1>
          <p className="text-muted-foreground mb-8">Last Updated: 25 November 2025</p>

          <p className="text-lg mb-6">
            SportVerse ("we", "our", "us") provides a platform where users can discover sports venues, check slot availability, and book sessions. This Privacy Policy explains how we collect, use, and protect your information.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3">1.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email, phone number (if you provide it).</li>
              <li><strong>Booking Details:</strong> Selected venue, date, slot, and booking type.</li>
              <li><strong>Communication:</strong> Any messages you voluntarily send to venue owners (via WhatsApp).</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">1.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Usage Data:</strong> Pages viewed, clicks, interactions.</li>
              <li><strong>Device Data:</strong> IP address, browser type, device type.</li>
              <li><strong>Cookies:</strong> Used for improving user sessions and authentication.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">1.3 Third-Party Services</h3>
            <p className="mb-2">We may use:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>ImageKit</strong> — to store and optimize venue images.</li>
              <li><strong>WhatsApp Deep Links</strong> — to enable user–venue communication.</li>
              <li><strong>Google Analytics (optional)</strong> — to understand usage patterns.</li>
            </ul>
            <p className="mt-4">Each third-party may collect some information as per their own privacy policies.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Show venues, pricing, and slot availability.</li>
              <li>Handle bookings and notify venue owners.</li>
              <li>Improve platform performance and user experience.</li>
              <li>Maintain security and prevent misuse.</li>
            </ul>
            <p className="mt-4 font-semibold">We never sell your data to advertisers.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Payment & Screenshot Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Some venues may accept manual payments such as UPI.</li>
              <li>In such cases, you send your payment screenshot directly to the venue owner, not to SportVerse.</li>
              <li><strong>SportVerse does not receive, store, or process any payment screenshots.</strong></li>
              <li>All payment verification happens between you and the venue owner.</li>
              <li>If a venue uses online payment gateways, you will be redirected to their secure payment page.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
            <p className="mb-2">We only share information necessary for booking:</p>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">With Venue Owners:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your name</li>
                <li>Slot details</li>
                <li>Booking information</li>
                <li>Any details required to confirm your booking</li>
              </ul>
            </div>
            <p className="font-semibold">We do not share your data with unrelated third parties or marketers.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-2">We use security best practices such as:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>SSL/HTTPS encryption</li>
              <li>Secure access controls</li>
              <li>Minimal data retention</li>
            </ul>
            <p>Even so, no system is 100% secure.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="mb-2">You may:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request account deletion</li>
              <li>Request data removal</li>
              <li>Correct your information</li>
              <li>Opt out of analytics cookies</li>
            </ul>
            <p className="mt-4">Contact support for any request.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p>SportVerse is not meant for children under 13, and we do not knowingly collect information from them.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy occasionally. Changes will be posted here with a new "Last Updated" date.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> <a href="mailto:sportverse.co@gmail.com" className="text-primary hover:underline">sportverse.co@gmail.com</a></li>
              <li><strong>Website:</strong> sportverse.co.in</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

