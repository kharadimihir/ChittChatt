import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, MessageCircle, Sparkles } from "lucide-react";
import React, { useState } from "react";

const CreateRoom = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !tag) return;

    onCreate({ title, tag });
    setTitle("");
    setTag("");
    onClose();
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none bg-white/90 backdrop-blur-2xl shadow-2xl p-8">
          <DialogHeader className="space-y-3 pb-4">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center rotate-3 mb-2">
              <PlusIcon className="text-primary w-8 h-8" />
            </div>

            <DialogTitle className="text-3xl font-black text-center tracking-tight text-primary">
              Start a Chat
            </DialogTitle>

            <DialogDescription className="text-center text-muted-foreground font-medium">
              Create a space for people to vibe and connect.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Room Title */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">
                  Room Name
                </Label>

                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input
                    placeholder="e.g., Midnight Tacos"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-14 pl-12 rounded-2xl border-none bg-secondary/50 focus-visible:ring-primary font-medium"
                  />
                </div>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">
                  Topic or Vibe
                </Label>

                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <Input
                    placeholder="e.g., Foodies, Late Night"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="h-14 pl-12 rounded-2xl border-none bg-secondary/50 focus-visible:ring-primary font-medium"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={!title || !tag}
                className="cursor-pointer w-full h-14 rounded-2xl bg-primary text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Let&apos;s Go!
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateRoom;

function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
