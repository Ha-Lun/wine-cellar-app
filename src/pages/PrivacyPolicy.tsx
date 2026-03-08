import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "CookieDeclaration";
    script.src = "https://consent.cookiebot.com/8f21cac1-549a-4339-a1e9-9dd48a9c27ba/cd.js";
    script.type = "text/javascript";
    script.async = true;
    const container = document.getElementById("cookie-declaration-container");
    container?.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        We value your privacy. This page describes how we collect, use, and protect your personal data when you use our wine cellar application. Below you can find the full cookie declaration managed by our consent platform.
      </p>
      <div id="cookie-declaration-container" />
    </div>
  );
};

export default PrivacyPolicy;
