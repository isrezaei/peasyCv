"use client";

import { Fragment, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Button, Dialog, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { updateOccupationCategory } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";
import {
  DEFAULT_OCCUPATION_CATEGORY,
  getActiveOccupationCategory,
  isOccupationCategoryId,
  loadGuestCategoryChoice,
  OCCUPATION_CATEGORY_IDS,
  saveGuestCategoryChoice,
  setActiveOccupationCategory,
  subscribeOccupationCategory,
  type OccupationCategoryId,
} from "@/lib/occupationCategories";
import { flushPendingWork } from "@/store/useResumeStore";

// React binding for the framework-free category store (the store itself must
// stay hook-free — it is reachable from server components via the i18n dict).
const getServerSnapshot = () => DEFAULT_OCCUPATION_CATEGORY;
const useActiveOccupationCategory = (): OccupationCategoryId =>
  useSyncExternalStore(subscribeOccupationCategory, getActiveOccupationCategory, getServerSnapshot);

/**
 * First-entry occupation-category gate. Decides, once per auth state, whether
 * the one-time category prompt shows, and remounts the editor subtree whenever
 * the active category changes so every placeholder getter re-resolves.
 *
 * "Already chosen" is exactly:
 *  - guest: a guest choice exists in localStorage (a skip counts — it stores
 *    «آزاد» with explicit:false, silencing the GUEST prompt only);
 *  - authenticated: user.occupationCategory is non-null on the server.
 *
 * Carry-over: an EXPLICIT guest choice is PATCHed onto the account after login
 * while the server category is still null, so the choice survives the
 * guest→account merge; a guest skip is not carried, so such users are asked
 * once after login (skipping there persists «آزاد» and ends the prompting).
 */
export function OccupationGate({ children }: { children: ReactNode }) {
  const { status, user, applyUser } = useAuth();
  const authed = status === "authenticated";
  const rawServerCategory = user?.occupationCategory;
  const serverCategory =
    authed && isOccupationCategoryId(rawServerCategory) ? rawServerCategory : null;

  // Resolve synchronously on first render (lazy initializer) so the very first
  // canvas paint already shows the stored category's placeholders — AuthGate
  // remounts this subtree on every auth flip, re-running the resolution.
  const [initiallyResolved] = useState<OccupationCategoryId | null>(() => {
    const guest = loadGuestCategoryChoice();
    const resolved = serverCategory ?? (authed ? (guest?.explicit ? guest.id : null) : (guest?.id ?? null));
    if (resolved) setActiveOccupationCategory(resolved);
    return resolved;
  });

  const category = useActiveOccupationCategory();
  const [prompting, setPrompting] = useState(initiallyResolved === null);

  // Guest→account carry-over: runs at most once per login (the PATCH response
  // updates the cached profile, making serverCategory non-null).
  useEffect(() => {
    if (!authed || serverCategory) return;
    const guest = loadGuestCategoryChoice();
    if (!guest?.explicit) return;
    updateOccupationCategory(guest.id)
      .then(applyUser)
      .catch((error) => {
        // Non-fatal: the local category is already active; the carry simply
        // retries on the next mount while the server value is still null.
        console.error("Occupation category carry-over failed; will retry.", error);
      });
  }, [authed, serverCategory, applyUser]);

  const apply = (id: OccupationCategoryId, explicit: boolean) => {
    // Commit any in-flight field edits before the keyed remount below.
    flushPendingWork();
    setPrompting(false);
    setActiveOccupationCategory(id);
    if (authed) {
      // A skip persists «آزاد» too: non-null on the server is what "asked
      // once" means for accounts.
      updateOccupationCategory(id)
        .then(applyUser)
        .catch((error) => console.error("Saving occupation category failed.", error));
    } else {
      saveGuestCategoryChoice({ id, explicit });
    }
  };

  return (
    <>
      <Dialog.Root
        open={prompting}
        onOpenChange={(d) => {
          // Closing any other way (Esc / backdrop) is a skip — entry is never blocked.
          if (!d.open) apply("azad", false);
        }}
        size="lg"
        placement="center"
        lazyMount
        unmountOnExit
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl" mx="4">
            <Dialog.Header>
              <Stack gap="1">
                <Dialog.Title>{t.occupations.promptTitle}</Dialog.Title>
                <Text textStyle="sm" color="fg.muted">
                  {t.occupations.promptSubtitle}
                </Text>
              </Stack>
            </Dialog.Header>
            <Dialog.Body>
              <SimpleGrid columns={{ base: 2, sm: 3 }} gap="2">
                {OCCUPATION_CATEGORY_IDS.map((id) => (
                  <Button
                    key={id}
                    variant="subtle"
                    size="sm"
                    height="auto"
                    minH="10"
                    py="2"
                    whiteSpace="normal"
                    onClick={() => apply(id, true)}
                  >
                    {t.occupations.labels[id]}
                  </Button>
                ))}
              </SimpleGrid>
            </Dialog.Body>
            <Dialog.Footer justifyContent="center">
              <Button variant="ghost" size="sm" color="fg.muted" onClick={() => apply("azad", false)}>
                {t.occupations.promptSkip}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
      {/* Category in the key: a change re-resolves every placeholder getter. */}
      <Fragment key={category}>{children}</Fragment>
    </>
  );
}
