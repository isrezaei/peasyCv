"use client";

import { useState, type FormEvent } from "react";
import { Box, Button, chakra, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { googleLoginUrl } from "@/lib/api/auth";
import { OCCUPATIONS } from "@/lib/occupations";

type Mode = "login" | "register";

const COPY = {
  login: {
    title: "ورود به حساب کاربری",
    submit: "ورود",
    switchPrompt: "حساب کاربری ندارید؟",
    switchAction: "ثبت‌نام",
  },
  register: {
    title: "ساخت حساب کاربری",
    submit: "ثبت‌نام",
    switchPrompt: "قبلاً ثبت‌نام کرده‌اید؟",
    switchAction: "ورود",
  },
} as const;

export function AuthScreen({ variant = "page" }: { variant?: "page" | "embedded" }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = COPY[mode];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name.trim() || undefined, occupation || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد. دوباره تلاش کنید.");
      setSubmitting(false);
    }
  };

  // "page" fills the viewport (the real /login route); "embedded" renders just
  // the card so the login modal (@auth intercepting route) can host it.
  const wrapperProps =
    variant === "page"
      ? ({ minH: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bg: "bg.muted", p: "4" } as const)
      : ({ display: "flex", alignItems: "center", justifyContent: "center" } as const);

  return (
    <Box {...wrapperProps}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        width="100%"
        maxW="380px"
        bg="bg.panel"
        borderWidth="1px"
        borderColor="border"
        borderRadius="xl"
        p="7"
        boxShadow="sm"
      >
        <Heading size="lg" textAlign="center" mb="1">
          رزومه‌ساز
        </Heading>
        <Text textAlign="center" color="fg.muted" mb="6" fontSize="sm">
          {copy.title}
        </Text>

        <Stack gap="3">
          {mode === "register" ? (
            <>
              <Input
                placeholder="نام و نام خانوادگی (اختیاری)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              {/* Optional at signup: keeps friction low and mirrors the Google
                  path, which can't collect it. Native select for reliable RTL. */}
              <chakra.select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                aria-label="حوزه شغلی"
                height="10"
                px="3"
                borderWidth="1px"
                borderColor="border"
                borderRadius="md"
                bg="bg"
                color={occupation ? "fg" : "fg.muted"}
                _focusVisible={{ outline: "none", borderColor: "accent.solid" }}
              >
                <option value="">حوزه شغلی (اختیاری)</option>
                {OCCUPATIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </chakra.select>
            </>
          ) : null}
          <Input
            type="email"
            placeholder="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="رمز عبور (حداقل ۸ کاراکتر)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          {error ? (
            <Text color="red.500" fontSize="sm" role="alert">
              {error}
            </Text>
          ) : null}

          <Button type="submit" colorPalette="accent" loading={submitting} width="100%">
            {copy.submit}
          </Button>
        </Stack>

        <Box position="relative" textAlign="center" my="4">
          <Box borderTopWidth="1px" borderColor="border" position="absolute" top="50%" left="0" right="0" />
          <Text as="span" position="relative" bg="bg.panel" px="2" color="fg.muted" fontSize="xs">
            یا
          </Text>
        </Box>

        <Button asChild variant="outline" width="100%">
          <a href={googleLoginUrl()}>ورود با گوگل</a>
        </Button>

        <Text textAlign="center" mt="5" fontSize="sm" color="fg.muted">
          {copy.switchPrompt}{" "}
          <chakra.button
            type="button"
            color="accent.fg"
            fontWeight="medium"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
          >
            {copy.switchAction}
          </chakra.button>
        </Text>
      </Box>
    </Box>
  );
}
