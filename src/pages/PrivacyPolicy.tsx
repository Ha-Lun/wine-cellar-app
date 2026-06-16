import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 px-4 py-4 backdrop-blur-md">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Privacy Policy</h1>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="mb-4 text-sm text-muted-foreground">Last Updated: June 16, 2026</p>
        <p className="mb-8 leading-relaxed">
          Welcome to Wine Cellar. We are committed to protecting your privacy and providing you with a safe and secure experience. This Privacy Policy explains how we collect, use, and share information when you use our mobile application.
        </p>
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information that you provide directly to us when you create an account, such as your email address. We also store the wine data you add to the app, including names, vintages, regions, varietals, tasting notes, ratings, drinking windows, label photos, and wishlist items.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to provide and improve our services, including wine collection management, search, and filtering. Your email is used for authentication and to sync your data across devices.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. AI Scanning and Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you use our label scanning features, we process label photos using third-party AI services. These services are used only to extract wine data and are subject to their own privacy policies.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using Supabase (a backend-as-a-service provider). We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time. You can delete wines or your entire account directly within the app settings.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or wish to remove your account, please contact us at hannes@lundstromslogiska.se.
            </p>
          </section>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          © 2026 Wine Cellar. All rights reserved.
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
