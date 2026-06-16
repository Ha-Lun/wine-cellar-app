import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wine, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function AuthForm() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (action: "signin" | "signup") => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (action === "signup") {
        await signUp(email, password);
        toast.success("Account created! You can now sign in.");
        setMode("signin");
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success("Reset link sent! Check your inbox.");
      setMode("signin");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Wine className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-semibold leading-none tracking-tight">Wine Cellar</h1>
          <p className="text-sm text-muted-foreground">Your personal wine collection</p>
        </CardHeader>
        <CardContent>
          {mode === "forgot" ? (
            <div className="space-y-4">
              <button
                onClick={() => setMode("signin")}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to sign in
              </button>
              <div>
                <Label htmlFor="email-forgot">Email</Label>
                <Input
                  id="email-forgot"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <Button className="w-full" onClick={handleForgot} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Send Reset Link
              </Button>
            </div>
          ) : (
            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="space-y-4 mt-4">
                <div><Label htmlFor="email-in">Email</Label><Input id="email-in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div>
                  <Label htmlFor="pass-in">Password</Label>
                  <div className="relative">
                    <Input
                      id="pass-in"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handleSubmit("signin")} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Sign In
                </Button>
                <button
                  onClick={() => setMode("forgot")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4 mt-4">
                <div><Label htmlFor="email-up">Email</Label><Input id="email-up" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div>
                  <Label htmlFor="pass-up">Password</Label>
                  <div className="relative">
                    <Input
                      id="pass-up"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handleSubmit("signup")} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Account
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <div className="px-6 pb-6 -mt-2 text-center">
          <Link
            to="/privacy-policy"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </Card>
    </div>
  );
}
