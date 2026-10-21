"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
const Login = dynamic(() => import("./Login"));
const Signup = dynamic(() => import("./Signup"));

export default function AuthDialog({ initialMode = "login", children }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const pathname = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setMode(initialMode);
      }}
    >
      <Dialog.Trigger asChild>
        <Button
          variant={initialMode === "login" ? "ghost" : "default"}
          size="sm"
          className="px-2.5 sm:px-3"
        >
          {children}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="auth-overlay fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="auth-dialog fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_32px)] max-w-[520px] max-h-[calc(100dvh_-_32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-2xl bg-card text-card-foreground shadow-xl focus:outline-none">
          <Dialog.Title className="sr-only">
            {mode === "login"
              ? "Sign in to AbokiNews"
              : "Create your AbokiNews account"}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Sign in or create an account to save stories and follow topics.
          </Dialog.Description>
          <Dialog.Close
            className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md bg-card text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="Close account dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Dialog.Close>
          {mode === "login" ? (
            <Login
              embedded
              onNavigate={setMode}
              onComplete={() => setOpen(false)}
            />
          ) : (
            <Signup
              embedded
              onNavigate={setMode}
              onComplete={() => setOpen(false)}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
