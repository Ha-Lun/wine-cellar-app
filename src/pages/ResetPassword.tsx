import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Wine, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setHasRecoveryToken(true);
    }
  }, []);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Password updated successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Helmet>
        <title>Reset Password — Wine Cellar</title>
        <meta name="description" content="Set a new password for your Wine Cellar account." />
        <link rel="canonical" href="https://sip-guardian.lovable.app/reset-password" />
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Wine className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-semibold leading-none tracking-tight">
            {hasRecoveryToken ? "Set New Password" : "Invalid Reset Link"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasRecoveryToken
              ? "Enter your new password below"
              : "This link is invalid or has expired. Please request a new one."}
          </p>
        </CardHeader>
        <CardContent>
          {hasRecoveryToken ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Update Password
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => navigate("/")}>
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
