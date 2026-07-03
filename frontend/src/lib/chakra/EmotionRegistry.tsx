"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { useState, type ReactNode } from "react";

/**
 * Synchronizes Emotion's style insertion with Next.js App Router streaming SSR.
 * Without this, Chakra's emotion-based global style tag can land at a different
 * tree position between the server-rendered HTML and the client's hydration pass.
 */
export function EmotionRegistry({ children }: { children: ReactNode }) {
  const [cache] = useState(() => {
    const emotionCache = createCache({ key: "chakra" });
    emotionCache.compat = true;
    return emotionCache;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) return null;

    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
