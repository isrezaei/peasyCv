"use client";

import React, { useEffect, useRef } from "react";
import { Stack } from "@chakra-ui/react";

/*
 * Yektanet loader + slot re-render coordinator.
 *
 * Yektanet's "native-no-data" superscript scans the DOM and fills each
 * `<div id="pos-...">` exactly once on load, then marks itself done with per-unit
 * `..._is_loaded` window flags. In an SPA those flags make it SKIP re-scanning, so
 * when a sidebar panel is reopened the freshly-mounted (empty) slot never fills —
 * that is the re-render bug. There is no public `render`/`reload` queue command
 * (the loaded `window.yektanet(...)` rejects unknown commands and its `.q` queue is
 * drained away after load). The robust, provider-correct re-render — verified
 * against the live superscript — is to clear those per-unit flags and re-execute
 * the (cached) superscript so it re-scans and re-fills the current empty slots.
 *
 * We inject the base loader ONCE, then coalesce the re-scan into a single cached
 * re-execution per frame, and skip it entirely when no slot is empty — so multiple
 * slots mounting together (or returning to a panel) cost at most one cache-served
 * re-scan, never per-slot work.
 */

let loaderBootstrapped = false;
let refreshScheduled = false;
let refreshScript = null;

function ensureYektanetLoader() {
  if (typeof window === "undefined") return;
  // Bootstrapped already (this session, by a prior mount, or by the global stub).
  if (loaderBootstrapped || window.yektanet) {
    loaderBootstrapped = true;
    return;
  }
  loaderBootstrapped = true;

  const script = document.createElement("script");
  // Verbatim bootstrap: defines the `window.yektanet` analytics command queue and
  // appends the cache-busted superscript. Injected ONCE globally (the base loader).
  script.innerHTML = `
    !function(e,t,n){e.yektanetAnalyticsObject=n,e[n]=e[n]||function(){e[n].q.push(arguments)},e[n].q=e[n].q||[];var a=t.getElementsByTagName("head")[0],r=new Date,c="https://cdn.yektanet.com/superscript/EJAFdwBN/native-no-data-44496/yn_pub.js?v="+r.getFullYear().toString()+"0"+r.getMonth()+"0"+r.getDate()+"0"+r.getHours(),s=t.createElement("link");s.rel="preload",s.as="script",s.href=c,a.appendChild(s);var l=t.createElement("script");l.async=!0,l.src=c,a.appendChild(l)}(window,document,"yektanet");
  `;
  document.head.appendChild(script);
}

// The per-unit "loaded" guards. The global UA-analytics flag is deliberately left
// untouched so the re-scan never re-initialises analytics.
function unitLoadedFlags() {
  return Object.getOwnPropertyNames(window).filter(
    (k) => /is_loaded/i.test(k) && !/ua-script/i.test(k),
  );
}

function reExecuteSuperscript() {
  const tags = [...document.querySelectorAll('script[src*="yn_pub.js"]')];
  const src = tags.length ? tags[tags.length - 1].src : null;
  if (!src) return;
  // Drop the previous refresh tag so they don't accumulate across navigations.
  if (refreshScript && refreshScript.parentNode) {
    refreshScript.parentNode.removeChild(refreshScript);
  }
  const s = document.createElement("script");
  s.async = true;
  s.src = src; // same hourly URL → served from cache, but re-executes (re-scans).
  document.head.appendChild(s);
  refreshScript = s;
}

function runRefresh() {
  const flags = unitLoadedFlags();
  // First load: the superscript hasn't run yet (no flags). Its own first scan fills
  // the existing slots, so there is nothing to re-trigger here.
  if (flags.length === 0) return;
  // Nothing to do if every slot is already filled (avoids needless reloads/flicker).
  const slots = [...document.querySelectorAll('div[id^="pos-"]')];
  if (slots.length > 0 && slots.every((el) => el.innerHTML.trim() !== "")) return;
  for (const f of flags) {
    try {
      delete window[f];
    } catch {
      window[f] = undefined;
    }
  }
  reExecuteSuperscript();
}

function scheduleYektanetRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  // One coalesced refresh per frame: N slots mounting together → a single re-scan.
  requestAnimationFrame(() => {
    refreshScheduled = false;
    runRefresh();
  });
}

export default function YektanetAd({ adId, height = 250 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!adId || !container) return;

    // Start from a clean slot every mount: drop any markup from a previous mount,
    // then (re)create the position div the superscript fills by id.
    container.innerHTML = "";
    const adDiv = document.createElement("div");
    adDiv.id = adId;
    container.appendChild(adDiv);

    ensureYektanetLoader();
    // Ask the coordinator to (re)render this slot. Coalesced + cache-served, and a
    // no-op on the first load (the base superscript fills it) — so this reliably
    // re-fills on EVERY subsequent mount without per-slot reload cost.
    scheduleYektanetRefresh();

    return () => {
      // Leave the container clean on unmount so a remount never stacks slots.
      if (container) container.innerHTML = "";
    };
  }, [adId]);

  return (
    <Stack>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          minHeight: `${height}px`,
          borderRadius: "10px",
          overflow: "hidden",
        }}
      />
    </Stack>
  );
}
