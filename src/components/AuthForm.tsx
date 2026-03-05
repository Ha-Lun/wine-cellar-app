import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wine, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (mode: "signin" | "signup") => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
        toast.success("Account created! You can now sign in.");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Wine className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-heading text-2xl">Wine Cellar</CardTitle>
          <p className="text-sm text-muted-foreground">Your personal wine collection</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-4 mt-4">
              <div><Label htmlFor="email-in">Email</Label><Input id="email-in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label htmlFor="pass-in">Password</Label><Input id="pass-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button className="w-full" onClick={() => handleSubmit("signin")} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Sign In
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 mt-4">
              <div><Label htmlFor="email-up">Email</Label><Input id="email-up" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label htmlFor="pass-up">Password</Label><Input id="pass-up" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button className="w-full" onClick={() => handleSubmit("signup")} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Account
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
