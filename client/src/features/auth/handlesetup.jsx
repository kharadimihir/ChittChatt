import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateHandle } from "./authApi";
import { toast } from "sonner";

const SetupPage = () => {
  const navigate = useNavigate();

  const [handle, setHandle] = useState("");
  const [previousHandle, setPreviousHandle] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandle = async () => {
    if (!handle || handle.trim().length < 3) {
      toast.error("Handle must be at least 3 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await updateHandle(handle);

      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Handle updated successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update handle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.handle) {
      setPreviousHandle(user.handle);
    }
  }, []);
  

  return (
    <div className="flex min-h-screen items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto bg-accent w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
          <User className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground mb-1 tracking-tighter">
            Who are you?
          </h2>
          <p className="text-muted-foreground">
            Pick a handle that fits your vibe today. You can change it anytime.
          </p>
        </div>
        <Input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder={previousHandle || "AnonymousHandle"}
          className="text-center text-xl h-14 rounded-2xl border-none bg-white/80 shadow-inner"
        />
        <Button
          onClick={submitHandle}
          disabled={loading}
          className="cursor-pointer w-full h-12 rounded-2xl bg-primary text-lg"
        >
          {loading ? "Saving..." : "Continue to Home"}
        </Button>
      </div>
    </div>
  );
};

export default SetupPage;
