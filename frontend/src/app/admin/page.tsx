"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Center,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import useSWR from "swr";
import { ChartBarIcon, DownloadIcon, FilesIcon, HomeIcon, UsersIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { BarChart } from "@/components/charts/BarChart";
import {
  getAdminDownloads,
  getAdminOccupations,
  getAdminSelections,
  getAdminSummary,
  getAdminUsers,
  getAdminVisits,
  type DailyCount,
  type SelectionKind,
  type SelectionOptionCount,
} from "@/lib/api/admin";
import { occupationLabel } from "@/lib/occupations";
import { t } from "@/lib/i18n";

const PAGE_SIZE = 20;
const RANGE_DAYS = 30;

const dayFormatter = new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const number = new Intl.NumberFormat("fa-IR");
const formatNumber = (value: number) => number.format(value);

function rangeStart(): string {
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - (RANGE_DAYS - 1));
  return from.toISOString().slice(0, 10);
}

/**
 * A card section heading: leading icon + title over a hairline bottom divider.
 * Stock Chakra primitives + inline props — no recipe.
 */
function SectionTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <HStack gap="2" pb="2" mb="4" borderBottomWidth="1px" borderColor="border" color="fg">
      {icon ? (
        <Box color="fg.muted" display="inline-flex" flexShrink={0}>
          {icon}
        </Box>
      ) : null}
      <Text fontSize="md" fontWeight="bold">
        {children}
      </Text>
    </HStack>
  );
}

/**
 * Admin dashboard: totals, the last 30 days of unique visitors and PDF
 * downloads, per-design-dimension selection breakdowns, and the paginated users
 * table. All data comes from the /admin API, which the backend AdminGuard
 * re-verifies on every request.
 *
 * Presentation is the app's neutral gray Chakra theme; charts are Chart.js via
 * {@link BarChart}. No data fetching, sorting or pagination logic changed.
 */
export default function AdminPage() {
  const router = useRouter();
  const from = rangeStart();
  const summary = useSWR("admin:summary", getAdminSummary, { revalidateOnFocus: false });
  const visits = useSWR("admin:visits", () => getAdminVisits(from), { revalidateOnFocus: false });
  const downloads = useSWR("admin:downloads", () => getAdminDownloads(from), {
    revalidateOnFocus: false,
  });

  const loadFailed = summary.error || visits.error || downloads.error;

  return (
    <Box minH="100vh" bg="bg.subtle" px={{ base: "4", md: "10" }} py="8">
      <HStack justify="space-between" mb="8" flexWrap="wrap" gap="3">
        <Heading size="2xl">{t.admin.title}</Heading>
        <Tooltip label={t.dashboard.backToEditor}>
          <IconButton
            aria-label={t.dashboard.backToEditor}
            variant="outline"
            onClick={() => router.push("/")}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>
      </HStack>

      {loadFailed ? (
        <Text color="fg.error" mb="6">
          {t.admin.loadError}
        </Text>
      ) : null}

      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="5" mb="8">
        <StatTile
          label={t.admin.summaryUsers}
          value={summary.data?.users}
          icon={<UsersIcon size={22} />}
        />
        <StatTile
          label={t.admin.summaryResumes}
          value={summary.data?.resumes}
          icon={<FilesIcon size={22} />}
        />
        <StatTile
          label={t.admin.summaryDownloads}
          value={summary.data?.downloads}
          icon={<DownloadIcon size={22} />}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5" mb="8">
        <ChartCard title={t.admin.visitsTitle} data={visits.data} loading={visits.isLoading} />
        <ChartCard
          title={t.admin.downloadsTitle}
          data={downloads.data}
          loading={downloads.isLoading}
        />
      </SimpleGrid>

      <Heading size="lg" mb="4">
        {t.admin.selectionsHeading}
      </Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5" mb="8">
        <SelectionChartCard title={t.admin.selBackground} kind="background" from={from} />
        <SelectionChartCard title={t.admin.selTheme} kind="theme" from={from} />
        <SelectionChartCard title={t.admin.selTemplate} kind="template" from={from} />
        <SelectionChartCard title={t.admin.selFont} kind="font" from={from} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1 }} gap="5" mb="8">
        <OccupationCard />
      </SimpleGrid>

      <UsersTable />
    </Box>
  );
}

/**
 * Ranked per-option card for one design dimension: two series — how many times
 * each option was SELECTED and how many DOWNLOADS used it. The server sorts by
 * total desc; we show the top 8 and fold the long tail into one «سایر گزینه‌ها»
 * row. Option ids are shown verbatim (dir=ltr) — they are data values.
 */
function SelectionChartCard({
  title,
  kind,
  from,
}: {
  title: string;
  kind: SelectionKind;
  from: string;
}) {
  const { data, isLoading } = useSWR(
    ["admin:selections", kind, from],
    () => getAdminSelections(kind, from),
    { revalidateOnFocus: false },
  );

  const rows = foldTopN(data ?? [], 8);
  const hasData = (data ?? []).some((r) => r.selections > 0 || r.downloads > 0);

  return (
    <Card.Root>
      <Card.Body p="5">
        <SectionTitle icon={<ChartBarIcon size={18} />}>{title}</SectionTitle>
        {isLoading ? (
          <Center height="220px">
            <Spinner />
          </Center>
        ) : !hasData ? (
          <Center height="220px">
            <Text fontSize="sm" color="fg.muted">
              {t.admin.empty}
            </Text>
          </Center>
        ) : (
          <BarChart
            horizontal
            showLegend
            height={Math.max(200, rows.length * 46)}
            labels={rows.map((r) => r.value)}
            datasets={[
              { label: t.admin.legendSelections, data: rows.map((r) => r.selections) },
              { label: t.admin.legendDownloads, data: rows.map((r) => r.downloads) },
            ]}
            formatValue={formatNumber}
          />
        )}
      </Card.Body>
    </Card.Root>
  );
}

/** Keep the top-N options; fold the rest into one aggregated «others» row. */
function foldTopN(rows: SelectionOptionCount[], n: number): SelectionOptionCount[] {
  if (rows.length <= n) return rows;
  const head = rows.slice(0, n);
  const tail = rows.slice(n);
  const others = tail.reduce(
    (acc, r) => ({
      value: acc.value,
      selections: acc.selections + r.selections,
      downloads: acc.downloads + r.downloads,
    }),
    { value: t.admin.othersLabel, selections: 0, downloads: 0 },
  );
  return [...head, others];
}

/** Registrations by occupation — single series, all rows (there are ≤20). */
function OccupationCard() {
  const { data, isLoading } = useSWR("admin:occupations", getAdminOccupations, {
    revalidateOnFocus: false,
  });
  const rows = data ?? [];
  const hasData = rows.some((r) => r.count > 0);

  return (
    <Card.Root>
      <Card.Body p="5">
        <SectionTitle icon={<ChartBarIcon size={18} />}>{t.admin.occupationsTitle}</SectionTitle>
        {isLoading ? (
          <Center height="220px">
            <Spinner />
          </Center>
        ) : !hasData ? (
          <Center height="220px">
            <Text fontSize="sm" color="fg.muted">
              {t.admin.empty}
            </Text>
          </Center>
        ) : (
          <Box maxH="420px" overflowY="auto">
            <BarChart
              horizontal
              height={Math.max(200, rows.length * 34)}
              labels={rows.map((r) => occupationLabel(r.occupation))}
              datasets={[{ data: rows.map((r) => r.count) }]}
              formatValue={formatNumber}
            />
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
}

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value?: number;
  icon: React.ReactNode;
}) {
  return (
    <Card.Root>
      <Card.Body p="5">
        <HStack gap="4">
          <Center boxSize="11" borderRadius="full" bg="bg.muted" color="fg.muted">
            {icon}
          </Center>
          <Stack gap="0">
            <Text fontSize="sm" color="fg.muted">
              {label}
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {value === undefined ? "—" : number.format(value)}
            </Text>
          </Stack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}

/**
 * A single-series daily bar chart (last 30 days). Missing days render as zero.
 * Identity is named by the card title, so no legend.
 */
function ChartCard({
  title,
  data,
  loading,
}: {
  title: string;
  data?: DailyCount[];
  loading: boolean;
}) {
  const byDate = new Map((data ?? []).map((d) => [d.date, d.count]));
  const days: DailyCount[] = [];
  for (let i = RANGE_DAYS - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  const hasData = days.some((d) => d.count > 0);

  return (
    <Card.Root>
      <Card.Body p="5">
        <SectionTitle icon={<ChartBarIcon size={18} />}>{title}</SectionTitle>
        {loading ? (
          <Center height="200px">
            <Spinner />
          </Center>
        ) : !hasData ? (
          <Center height="200px">
            <Text fontSize="sm" color="fg.muted">
              {t.admin.empty}
            </Text>
          </Center>
        ) : (
          <BarChart
            height={200}
            labels={days.map((d) => dayFormatter.format(new Date(d.date)))}
            datasets={[{ data: days.map((d) => d.count) }]}
            formatValue={formatNumber}
          />
        )}
      </Card.Body>
    </Card.Root>
  );
}

function UsersTable() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    ["admin:users", page],
    () => getAdminUsers(page, PAGE_SIZE),
    { revalidateOnFocus: false },
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <Card.Root>
      <Card.Body p="5">
        <SectionTitle icon={<UsersIcon size={18} />}>{t.admin.usersTitle}</SectionTitle>

        {isLoading ? (
          <Center py="10">
            <Spinner />
          </Center>
        ) : error ? (
          <Center py="10">
            <Text color="fg.error">{t.admin.loadError}</Text>
          </Center>
        ) : !data || data.users.length === 0 ? (
          <Center py="10">
            <Text fontSize="sm" color="fg.muted">
              {t.admin.empty}
            </Text>
          </Center>
        ) : (
          <>
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>{t.admin.colName}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.admin.colEmail}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.admin.colPhone}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.admin.colOccupation}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.admin.colCreated}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t.admin.colResumes}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.users.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.Cell>{user.name ?? "—"}</Table.Cell>
                      <Table.Cell dir="ltr">{user.email}</Table.Cell>
                      <Table.Cell dir="ltr">{user.phone ?? "—"}</Table.Cell>
                      <Table.Cell>
                        {user.occupation ? occupationLabel(user.occupation) : "—"}
                      </Table.Cell>
                      <Table.Cell>{dateTimeFormatter.format(new Date(user.createdAt))}</Table.Cell>
                      <Table.Cell>{number.format(user.resumeCount)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
            <HStack justify="space-between" mt="4">
              <Button
                size="xs"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t.admin.prevPage}
              </Button>
              <Text fontSize="xs" color="fg.muted">
                {t.admin.pageOf
                  .replace("{page}", number.format(page))
                  .replace("{total}", number.format(totalPages))}
              </Text>
              <Button
                size="xs"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t.admin.nextPage}
              </Button>
            </HStack>
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}
