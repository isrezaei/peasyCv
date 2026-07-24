"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Dialog, Grid,
  Heading,
  HStack, Icon,
  IconButton,
  Input, SimpleGrid,
  Spinner,
  Stack,
  Text
} from "@chakra-ui/react";
import { ThemeProvider, useTheme } from "next-themes";
import useSWR from "swr";
import {
  CheckIcon,
  FilesIcon,
  HomeIcon,
  MoonIcon,
  OccupationAdminHrIcon,
  OccupationAzadIcon,
  OccupationContentMediaIcon,
  OccupationCustomerSupportIcon,
  OccupationDesignCreativeIcon,
  OccupationEducationTrainingIcon,
  OccupationEngineeringTechnicalIcon,
  OccupationFinanceAccountingIcon,
  OccupationHealthMedicalIcon,
  OccupationSalesMarketingIcon,
  OccupationSoftwareItIcon,
  PencilIcon,
  PlusIcon,
  SunIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { updateOccupationCategory } from "@/lib/api/auth";
import {
  createResume,
  deleteResume,
  getResume,
  listResumes,
  upsertResume,
  type ResumeSummary,
} from "@/lib/api/resumes";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";
import {
  DEFAULT_OCCUPATION_CATEGORY,
  isOccupationCategoryId,
  OCCUPATION_CATEGORY_IDS,
  setActiveOccupationCategory,
  type OccupationCategoryId,
} from "@/lib/occupationCategories";
import { HiMiniDocumentText } from "react-icons/hi2";
import { HiOutlineDocumentText } from "react-icons/hi";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

/**
 * The user's resume list — every resume in the account (the guest-merged one
 * included), newest edit first. Open routes back into the editor with
 * /?resume=<id>; the pencil action renames in place (re-PUTs the document
 * under the same id); delete asks for confirmation. All of it is enforced
 * server-side per resume (ownership checks on every endpoint) — this page is
 * just a view.
 *
 * Visual language: the app's neutral gray Chakra theme — a `bg.subtle` page
 * holding one grey section container; inside it, compact bordered info cards
 * (editable title + the resume's occupation-category line, newest badge,
 * edit/delete actions, hairline, justified date rows) laid out 4-up at desktop.
 * The header is an identity cluster (Avatar / email / occupation + pencil that
 * opens the occupation modal) opposite stock ghost icon buttons and the default
 * «رزومه جدید» Button. Data flow, routing and state are untouched.
 */
export default function DashboardPage() {
  // Same pattern as EditorApp: next-themes mounts only inside app chrome, so
  // the public /print and /share routes can never receive the `.dark` class.
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DashboardGate />
    </ThemeProvider>
  );
}

function DashboardGate() {
  const { status } = useAuth();
  const router = useRouter();

  if (status === "loading") {
    return (
      <Center height="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Center height="100vh" bg="bg.subtle">
        <Stack align="center" gap="4">
          <Text color="fg.muted">{t.dashboard.needLogin}</Text>
          <Button colorPalette="accent" onClick={() => router.push("/login")}>
            {t.topbar.login}
          </Button>
        </Stack>
      </Center>
    );
  }

  return <ResumeGrid />;
}

// Hydration-safe client detection (server snapshot false, client true) without
// a setState-in-effect cascade.
const emptySubscribe = () => () => {};
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

/** Light/dark toggle for the dashboard chrome (mounted-gated: no SSR flash). */
function ColorModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const dark = mounted && resolvedTheme === "dark";
  return (
    <Tooltip label={t.dashboard.colorMode}>
      <IconButton
        aria-label={t.dashboard.colorMode}
        rounded={"xl"}
        size="sm"
        variant="surface"
        onClick={() => setTheme(dark ? "light" : "dark")}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  );
}

// One distinct glyph per occupation-category id (all Tabler, routed through
// components/ui/icons.tsx like every other icon in the app).
const OCCUPATION_ICONS: Record<OccupationCategoryId, typeof OccupationAzadIcon> = {
  "software-it": OccupationSoftwareItIcon,
  "sales-marketing": OccupationSalesMarketingIcon,
  "finance-accounting": OccupationFinanceAccountingIcon,
  "admin-hr": OccupationAdminHrIcon,
  "design-creative": OccupationDesignCreativeIcon,
  "content-media": OccupationContentMediaIcon,
  "engineering-technical": OccupationEngineeringTechnicalIcon,
  "health-medical": OccupationHealthMedicalIcon,
  "education-training": OccupationEducationTrainingIcon,
  "customer-support": OccupationCustomerSupportIcon,
  azad: OccupationAzadIcon,
};

/**
 * The always-available place to change the occupation category (drives the
 * resume's example content), now a modal per the redesign: the pencil beside
 * the occupation label in the header identity cluster opens a Dialog listing
 * every category with its glyph; the current one is highlighted. Selecting
 * persists through the existing PATCH path. Changing it only swaps the example
 * placeholders the editor shows for still-empty fields; typed content is
 * stored data and is never touched by this.
 */
function OccupationModal() {
  const { user, applyUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rawCategory = user?.occupationCategory;
  const current = isOccupationCategoryId(rawCategory) ? rawCategory : null;

  const handleSelect = async (id: OccupationCategoryId) => {
    if (id === current) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      const profile = await updateOccupationCategory(id);
      applyUser(profile);
      // Keep the editor's active category in sync for the next navigation.
      setActiveOccupationCategory(id);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => setOpen(d.open)}
      lazyMount
      unmountOnExit
      scrollBehavior={"inside"}
    >
      <Dialog.Trigger asChild>
        <IconButton aria-label={t.occupations.edit} size="2xs" variant="solid" rounded={"lg"}>
          <PencilIcon size={12} />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content rounded={"lg"} bg="bg.panel" maxW="sm">
          <Dialog.Header>
            <Dialog.Title fontSize="md" fontWeight="bold">
              {t.occupations.edit}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text fontSize="sm" color="fg.muted" mb="4">
              {t.occupations.changeHint}
            </Text>
            <Stack gap="1" aria-label={t.occupations.panelLabel}>
              {OCCUPATION_CATEGORY_IDS.map((id) => {
                const Glyph = OCCUPATION_ICONS[id];
                const selected = id === current;
                return (
                  <Button
                    key={id}
                    variant={selected ? "subtle" : "ghost"}
                    aria-current={selected ? "true" : undefined}
                    disabled={busy}
                    onClick={() => void handleSelect(id)}
                    width="100%"
                    height="auto"
                    py="2"
                    justifyContent="flex-start"
                    gap="3"
                  >
                    <Center boxSize="9" borderRadius="md" bg="bg.muted" color="fg.muted" flexShrink={0}>
                      <Glyph size={18} />
                    </Center>
                    <Text flex="1" textAlign="start" fontSize="sm" fontWeight={selected ? "bold" : "medium"}>
                      {t.occupations.labels[id]}
                    </Text>
                    {selected ? (
                      <Box color="fg" flexShrink={0}>
                        <CheckIcon size={18} />
                      </Box>
                    ) : null}
                  </Button>
                );
              })}
            </Stack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

/**
 * The header identity cluster (spec's start side): avatar, email, and the
 * occupation label with the pencil that opens {@link OccupationModal}. The
 * dashboard IS the user's panel, so the account-level setting lives here,
 * beside the account chrome, rather than inside any single resume.
 */
function UserPanel() {
  const { user } = useAuth();
  const rawCategory = user?.occupationCategory;
  const category = isOccupationCategoryId(rawCategory) ? rawCategory : null;
  const displayName = user?.name?.trim() || user?.email || "؟";

  return (
    <HStack bg="bg.muted" border={"1px solid"} borderColor={"bg.emphasized"} rounded={"xl"} p={2} gap="3" minW="0">
      <Avatar.Root size={"xl"} colorPalette="gray" flexShrink={0}>
        <Avatar.Fallback  />
      </Avatar.Root>
      <Stack gapY="0" minW="0">

        <HStack>
          <Text fontSize="xs" fontWeight="medium" color="fg.muted" truncate>
            {category ? t.occupations.labels[category] : t.occupations.notSelected}
          </Text>
        </HStack>
        <Text fontSize="2xs" fontWeight="semibold" truncate>
          {user?.email}
        </Text>
      </Stack>

      <OccupationModal />
    </HStack>
  );
}

/**
 * The card title. The card's edit button flips `editing` on; the title then
 * becomes an in-place input, focused with its text selected. Enter and blur
 * commit (the parent applies the trim/empty-fallback rule); Esc cancels and
 * restores the previous title.
 */
function CardTitle({
  resume,
  editing,
  onEditingChange,
  onRename,
}: {
  resume: ResumeSummary;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onRename: (resume: ResumeSummary, rawTitle: string) => Promise<void>;
}) {
  const committing = useRef(false);
  const cancelled = useRef(false);

  const commit = async (raw: string) => {
    // Enter fires blur right after it — and Esc's unmount can too — so guard
    // against a double/cancelled commit.
    if (committing.current || cancelled.current) {
      cancelled.current = false;
      return;
    }
    committing.current = true;
    onEditingChange(false);
    await onRename(resume, raw);
    committing.current = false;
  };

  if (editing) {
    return (
      <Input
        autoFocus
        defaultValue={resume.title}
        onFocus={(e) => {
          cancelled.current = false;
          e.currentTarget.select();
        }}
        onBlur={(e) => void commit(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void commit(e.currentTarget.value);
          if (e.key === "Escape") {
            cancelled.current = true;
            onEditingChange(false);
          }
        }}
        size="sm"
        fontWeight="bold"
        variant="flushed"
        width="100%"
      />
    );
  }

  return (
    <Text fontSize="sm" fontWeight="bold" lineClamp={1}>
      {resume.title}
    </Text>
  );
}

/**
 * Auto-numbered default name: the highest existing «رزومه من - N» suffix among
 * the user's resumes, +1 — never the resume count, which would repeat a number
 * after a delete (e.g. delete «- 2» of three, count says 3 → duplicate «- 3»).
 */
function nextDefaultTitle(resumes: ResumeSummary[]): string {
  const base = t.dashboard.defaultTitleBase;
  const suffixPattern = new RegExp(`^${base} - (\\d+)$`);
  let max = 0;
  for (const resume of resumes) {
    const match = suffixPattern.exec(resume.title.trim());
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `${base} - ${max + 1}`;
}

function ResumeGrid() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR("dashboard:resumes", listResumes, {
    revalidateOnFocus: false,
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<ResumeSummary | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openResume = (id: string) => router.push(`/?resume=${id}`);

  const handleNew = async () => {
    setBusyId("new");
    try {
      const created = await createResume({ title: nextDefaultTitle(data ?? []) });
      openResume(created.id);
    } finally {
      setBusyId(null);
    }
  };

  const handleRename = async (summary: ResumeSummary, rawTitle: string) => {
    // The one trim-based emptiness rule: a blank name falls back to the next
    // auto-numbered default instead of ever persisting an empty title.
    const title = rawTitle.trim() || nextDefaultTitle(data ?? []);
    if (title === summary.title) return;
    setBusyId(summary.id);
    try {
      const full = await getResume(summary.id);
      await upsertResume({ ...full, title });
      await mutate();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (summary: ResumeSummary) => {
    setBusyId(summary.id);
    try {
      await deleteResume(summary.id);
      setConfirming(null);
      await mutate();
    } finally {
      setBusyId(null);
    }
  };

  return (
    // preflight is off (lib/chakra/system.ts), so bare <p> (Text) and <h2>
    // (Heading) keep the browser's UA `margin-block: 1em`; in a flex column those
    // margins don't collapse and dwarf every gapY. Zero them for this subtree so
    // gapY actually governs the text rhythm. Scoped to the page root — portaled
    // dialogs render outside it and keep their own explicit spacing.
    <Box minH="100vh" css={{ "& :is(p, h1, h2, h3, h4, h5, h6)": { margin: 0 } }}>
      <Box
        maxW="1440px"
        mx="auto"
        px={{ base: "4", md: "10" }}
        pt={{ base: "6", md: "10" }}

      >
        {/* Header: identity cluster (start) opposite the toolbar icons and the
            page's one dominant action — all stock Button/IconButton recipes. */}
        <HStack as="header" justify="space-between" align="center" gap="6" flexWrap="wrap">
          <UserPanel />
          <HStack gap="2" flexWrap="wrap">
            <Tooltip label={t.dashboard.backToEditor}>
              <IconButton
                aria-label={t.dashboard.backToEditor}
                variant="surface"
                size="sm"
                rounded={"xl"}
                onClick={() => router.push("/")}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <ColorModeToggle />
            <Button size="sm" rounded={"xl"} fontSize={"xs"} loading={busyId === "new"} onClick={() => void handleNew()}>
              <PlusIcon size={15} /> {t.dashboard.newResume}
            </Button>
          </HStack>
        </HStack>

        {/* The section container: a neutral light-grey surface (`bg.muted`),
            deliberately one step off the page so the cards read as raised. */}
        <Box mt="6" bg="bg.muted" border={"1px solid"} borderColor={"bg.emphasized"} borderRadius="xl" p={{ base: "4", md: "7" }}>
          <HStack gap="3" mb="5" align="center">
            <Center boxSize="10" borderRadius="lg" border="1px solid" borderColor={"border.emphasized"} color="fg.panel" flexShrink={0}>
              <HiOutlineDocumentText size={25} />
            </Center>
            <Stack gapY="0.5">
              <Heading size="md">{t.dashboard.title}</Heading>
              <Text fontSize="xs" color="fg.muted">
                {t.dashboard.subtitle}
              </Text>
            </Stack>
          </HStack>

          {isLoading ? (
            <Center py="24">
              <Spinner size="lg" />
            </Center>
          ) : error ? (
            <Center py="24">
              <Text color="fg.error">{t.dashboard.loadError}</Text>
            </Center>
          ) : !data || data.length === 0 ? (
            <Center py="24">
              <Stack align="center" gap="4" color="fg.muted">
                <FilesIcon size={40} />
                <Text>{t.dashboard.empty}</Text>
              </Stack>
            </Center>
          ) : (
            // Responsive auto-fit track: cards flow to fill the container's full
            // width and stretch to share leftover space (auto-fit COLLAPSES empty
            // tracks — a fixed column count left dead tracks pinned to the start
            // edge in RTL). `min(100%, 280px)` avoids overflow on narrow screens.
            <SimpleGrid
              columns={4}
              gap="6"
            >
              {data.map((resume, index) => (
                <Box
                  as="article"
                  key={resume.id}
                  data-testid="resume-card"
                  display="flex"
                  flexDirection="column"
                  gap="3"
                  bg="bg.panel"
                  border="1px solid"
                  borderColor="border.subtle"
                  rounded="xl"
                  overflow={"hidden"}
                  transition=" 0.15s ease, border-subtle 0.15s ease"
                  _hover={{ boxShadow: "none", borderColor: "border.emphasized" }}
                >
                  {/* Top row: title + occupation line (start) opposite the
                      newest badge and the edit / delete actions. */}
                  <HStack p={3} align="flex-start" justify="space-between" gap="2">
                    <Stack gapY="0.5" minW="0" flex="1">


                        <CardTitle
                          resume={resume}
                          editing={editingId === resume.id}
                          onEditingChange={(editing) => setEditingId(editing ? resume.id : null)}
                          onRename={handleRename}
                        />

                      <Text fontSize="xs" color="fg.muted" lineClamp={1}>
                        عنوان شغلی :
                        {" "}
                        {
                          t.occupations.labels[
                            isOccupationCategoryId(resume.occupationCategory)
                              ? resume.occupationCategory
                              : DEFAULT_OCCUPATION_CATEGORY
                          ]
                        }
                      </Text>
                    </Stack>
                    <HStack gap="2" flexShrink={0}>
                      {index === 0 ? (
                        <Badge data-testid="newest-badge" variant="solid" rounded={"lg"} fontSize={"2xs"} colorPalette="accent">
                          {t.dashboard.newestBadge}
                        </Badge>
                      ) : null}
                      <Tooltip label={t.dashboard.rename}>
                        <IconButton
                          aria-label={t.dashboard.rename}
                          size="2xs"
                          variant="subtle"
                          rounded={"lg"}
                          onClick={() => setEditingId(resume.id)}
                        >
                          <PencilIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip label={t.dashboard.delete}>
                        <IconButton
                          aria-label={t.dashboard.delete}
                          size="2xs"
                          rounded={"lg"}
                          variant="subtle"
                          colorPalette="red"
                          onClick={() => setConfirming(resume)}
                        >
                          <TrashIcon />
                        </IconButton>
                      </Tooltip>
                    </HStack>
                  </HStack>



                  {/* Primary action: hairline + date rows open the resume. */}
                  <Stack

                    bg="bg.emphasized"
                    aria-label={`${t.dashboard.open} ${resume.title}`}
                    display="flex"
                    flexDirection="column"
                    alignItems="stretch"
                    gap="3"
                    flex="1"
                    width="100%"
                    height="auto"
                    p="3"
                    cursor="pointer"
                    textAlign="start"
                    onClick={() => openResume(resume.id)}
                  >
                    <Stack gapY="0.5" width="100%">
                      <HStack justify="space-between" fontSize="2xs" color="fg.muted">
                        <Text>{t.dashboard.updatedAt}</Text>
                        <Text color="fg">
                          {formatDate(resume.updatedAt)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" fontSize="2xs" color="fg.muted">
                        <Text>{t.dashboard.createdAt}</Text>
                        <Text color="fg">
                          {formatDate(resume.createdAt)}
                        </Text>
                      </HStack>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>

      <Dialog.Root
        open={confirming !== null}
        onOpenChange={(d) => !d.open && setConfirming(null)}
        lazyMount
        unmountOnExit
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="bg.panel">
            <Dialog.Header>
              <Dialog.Title fontSize="md" fontWeight="bold">
                {t.dashboard.deleteConfirmTitle}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text color="fg.muted" fontSize="sm">
                {t.dashboard.deleteConfirmBody}
              </Text>
              {confirming ? (
                <Text mt="2" fontWeight="bold">
                  {confirming.title}
                </Text>
              ) : null}
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                colorPalette="red"
                variant="subtle"
                loading={confirming !== null && busyId === confirming.id}
                onClick={() => confirming && void handleDelete(confirming)}
              >
                {t.dashboard.delete}
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(null)}>
                {t.common.cancel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}
