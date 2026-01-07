import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./authApi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

const Login = () => {
  const navigate = useNavigate();

  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await login(email, password);
      const { user, token } = res.data;


      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setAuth({ user, token });

      if (user.handle) {
        navigate("/");
      } else {
        navigate("/setup");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-none bg-white/60 backdrop-blur-xl shadow-2xl shadow-primary/10">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-primary w-16 h-16 rounded-3xl flex items-center justify-center rotate-6 mb-4">
            <MessageCircle className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            ChittChaat
          </CardTitle>
          <p className="text-muted-foreground">Welcome back, neighbor.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border-none bg-secondary/50 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border-none bg-secondary/50 focus-visible:ring-primary"
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 cursor-pointer rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="cursor-pointer text-primary font-semibold hover:underline"
            >
              Create Account
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
