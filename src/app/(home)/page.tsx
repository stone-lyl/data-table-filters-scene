import { Link } from "@/components/custom/link";
import { SocialsFooter } from "@/components/layout/socials-footer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import { default as NextLink } from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col gap-8 p-4 sm:p-8 xl:gap-12 xl:p-12">
      <div className="px-2.5">
        <Hero />
      </div>
      <div className="border-b border-dashed border-border" />
      
      {/* Main features grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-8">
        {/* Default Table */}
        <NextLink href="/default" className="group flex flex-col gap-2.5">
          <div className="flex aspect-video flex-col justify-center rounded-lg border border-border/70 bg-muted/40 p-4 transition-all duration-200 group-hover:border-border group-hover:bg-muted/50 group-hover:shadow-sm">
            <DefaultTable />
          </div>
          <div className="px-2 py-1.5">
            <p className="font-medium group-hover:underline">Default Table</p>
            <p className="text-xs text-muted-foreground">Client-side filtering and pagination</p>
          </div>
        </NextLink>

        {/* Infinite Table */}
        <NextLink href="/infinite" className="group flex flex-col gap-2.5">
          <div className="flex aspect-video flex-col justify-center rounded-lg border border-border/70 bg-muted/40 p-4 transition-all duration-200 group-hover:border-border group-hover:bg-muted/50 group-hover:shadow-sm">
            <GridTable className="scale-[0.85]" />
          </div>
          <div className="px-2 py-1.5">
            <p className="font-medium group-hover:underline">Infinite Table</p>
            <p className="text-xs text-muted-foreground">Server-side filtering with infinite scroll</p>
          </div>
        </NextLink>

        {/* Analytics Table */}
        <NextLink href="/analyze" className="group flex flex-col gap-2.5">
          <div className="flex aspect-video flex-col justify-center rounded-lg border border-border/70 bg-muted/40 p-4 transition-all duration-200 group-hover:border-border group-hover:bg-muted/50 group-hover:shadow-sm">
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-hidden rounded-md border border-border bg-card">
                <div className="bg-muted/50 p-1 text-xs font-medium">Analytics</div>
                <div className="grid grid-cols-3 gap-px bg-muted/30 p-2 text-center text-xs">
                  <div className="rounded bg-card p-1">Metrics</div>
                  <div className="rounded bg-card p-1">Aggregations</div>
                  <div className="rounded bg-card p-1">Filters</div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-2 py-1.5">
            <p className="font-medium group-hover:underline">Analytics Table</p>
            <p className="text-xs text-muted-foreground">Advanced analytics with sticky headers and footers</p>
          </div>
        </NextLink>

        {/* Compare Table */}
        <NextLink href="/compare" className="group flex flex-col gap-2.5">
          <div className="flex aspect-video flex-col justify-center rounded-lg border border-border/70 bg-muted/40 p-4 transition-all duration-200 group-hover:border-border group-hover:bg-muted/50 group-hover:shadow-sm">
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-hidden rounded-md border border-border bg-card">
                <div className="bg-muted/50 p-1 text-xs font-medium">Comparison</div>
                <div className="grid grid-cols-2 gap-px bg-muted/30 p-2 text-center text-xs">
                  <div className="rounded bg-card p-1">Dataset A</div>
                  <div className="rounded bg-card p-1">Dataset B</div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-2 py-1.5">
            <p className="font-medium group-hover:underline">Compare Data</p>
            <p className="text-xs text-muted-foreground">Side-by-side data comparison</p>
          </div>
        </NextLink>
      </div>

      <div className="px-2.5 py-2">
        <div className="grid gap-8 xl:grid-cols-2 xl:gap-12">
          <Examples />
          <GuideBadgeLink className="self-start" />
        </div>
      </div>
      
      <div className="border-b border-dashed border-border" />
      <SocialsFooter />
    </div>
  );
}

function DefaultTable() {
  return (
    <div className="divide-y overflow-hidden rounded-lg border border-border">
      <div className="flex gap-2 px-2.5 py-2 hover:bg-muted [&>*:last-child]:bg-foreground/60 [&>*:not(:last-child):nth-child(even)]:bg-foreground/70 [&>*:not(:last-child):nth-child(odd)]:bg-muted-foreground/30">
        <div className="size-2.5 rounded-sm" />
        <div className="h-2.5 w-12 rounded-sm" />
        <div className="h-2.5 w-12 rounded-sm sm:w-24" />
        <div className="h-2.5 w-16 rounded-sm" />
      </div>
      <div className="flex gap-2 px-2.5 py-2 hover:bg-muted [&>*:last-child]:bg-foreground/60 [&>*:not(:last-child):nth-child(even)]:bg-foreground/70 [&>*:not(:last-child):nth-child(odd)]:bg-muted-foreground/30">
        <div className="size-2.5 rounded-sm" />
        <div className="h-2.5 w-16 rounded-sm" />
        <div className="h-2.5 w-12 rounded-sm sm:w-24" />
        <div className="h-2.5 w-16 rounded-sm" />
      </div>
      <div className="flex gap-2 px-2.5 py-2 hover:bg-muted [&>*:last-child]:bg-foreground/60 [&>*:not(:last-child):nth-child(even)]:bg-foreground/70 [&>*:not(:last-child):nth-child(odd)]:bg-muted-foreground/30">
        <div className="size-2.5 rounded-sm" />
        <div className="h-2.5 w-12 rounded-sm" />
        <div className="h-2.5 w-12 rounded-sm sm:w-24" />
        <div className="h-2.5 w-16 rounded-sm" />
      </div>
      <div className="flex gap-2 px-2.5 py-2 hover:bg-muted [&>*:last-child]:bg-foreground/60 [&>*:not(:last-child):nth-child(even)]:bg-foreground/70 [&>*:not(:last-child):nth-child(odd)]:bg-muted-foreground/30">
        <div className="size-2.5 rounded-sm" />
        <div className="h-2.5 w-16 rounded-sm" />
        <div className="h-2.5 w-12 rounded-sm sm:w-24" />
        <div className="h-2.5 w-16 rounded-sm" />
      </div>
    </div>
  );
}

function GridTable({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "divide-y overflow-hidden border border-l-0 border-border",
        className,
      )}
    >
      <div className="grid grid-cols-6 divide-x hover:bg-muted [&>*:last-child>div]:ml-auto [&>*:nth-child(even)>div]:bg-foreground/70 [&>*:nth-child(odd)>div]:bg-muted-foreground/30">
        <div className="px-2.5 py-2">
          <div className="size-2.5 rounded-sm" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-10" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm" />
        </div>
        <div className="col-span-2 px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-20" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-8" />
        </div>
      </div>
      <div className="grid grid-cols-6 divide-x hover:bg-muted [&>*:last-child>div]:ml-auto [&>*:nth-child(even)>div]:bg-foreground/70 [&>*:nth-child(odd)>div]:bg-muted-foreground/30">
        <div className="px-2.5 py-2">
          <div className="size-2.5 rounded-sm" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-10" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm" />
        </div>
        <div className="col-span-2 px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-20" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-8" />
        </div>
      </div>
      <div className="grid grid-cols-6 divide-x hover:bg-muted [&>*:last-child>div]:ml-auto [&>*:nth-child(even)>div]:bg-foreground/70 [&>*:nth-child(odd)>div]:bg-muted-foreground/30">
        <div className="px-2.5 py-2">
          <div className="size-2.5 rounded-sm" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-10" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm" />
        </div>
        <div className="col-span-2 px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-20" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-8" />
        </div>
      </div>
      <div className="grid grid-cols-6 divide-x hover:bg-muted [&>*:last-child>div]:ml-auto [&>*:nth-child(even)>div]:bg-foreground/70 [&>*:nth-child(odd)>div]:bg-muted-foreground/30">
        <div className="px-2.5 py-2">
          <div className="size-2.5 rounded-sm" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-10" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm" />
        </div>
        <div className="col-span-2 px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-20" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-8" />
        </div>
      </div>
      <div className="grid grid-cols-6 divide-x hover:bg-muted [&>*:last-child>div]:ml-auto [&>*:nth-child(even)>div]:bg-foreground/70 [&>*:nth-child(odd)>div]:bg-muted-foreground/30">
        <div className="px-2.5 py-2">
          <div className="size-2.5 rounded-sm" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-10" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm" />
        </div>
        <div className="col-span-2 px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-20" />
        </div>
        <div className="px-2.5 py-2">
          <div className="h-2.5 w-full rounded-sm sm:w-8" />
        </div>
      </div>
    </div>
  );
}

function CommandInput() {
  return (
    <div className="flex justify-between rounded-lg border border-border px-2.5 py-2 hover:bg-muted">
      <div className="flex gap-2.5">
        <div className="h-2.5 w-12 rounded-sm bg-foreground/70" />
        <div className="h-2.5 w-8 rounded-sm bg-foreground/70" />
      </div>
      <div className="h-2.5 w-4 rounded-sm bg-muted-foreground/40" />
    </div>
  );
}

function Toolbar() {
  return (
    <div className="flex justify-between gap-2.5">
      <div className="h-2.5 w-8 rounded-sm bg-muted-foreground/40" />
      <div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/40" />
    </div>
  );
}

const BARS = 50;
function Timeline() {
  return (
    <div className="flex items-end gap-px">
      {Array.from({ length: BARS }).map((_, i) => {
        const height = ["h-2.5", "h-2", "h-1.5", "h-1"][
          Math.floor(Math.random() * 4)
        ];
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-sm bg-muted-foreground/20 hover:bg-muted-foreground/30",
              height,
            )}
          />
        );
      })}
    </div>
  );
}

function Controls({ className }: { className?: string }) {
  return (
    <div className={cn("divide-y divide-transparent", className)}>
      <div className="flex flex-col gap-2 py-2">
        <div className="flex justify-between gap-2.5">
          <div className="h-2.5 w-10 rounded-sm bg-foreground/50" />
          <div className="size-2.5 rounded-sm bg-foreground/50" />
        </div>
        <div className="h-2.5 w-full rounded-sm bg-foreground/70" />
      </div>
      <div className="group/controls flex justify-between gap-2.5 py-2">
        <div className="h-2.5 w-10 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
        <div className="size-2.5 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
      </div>
      <div className="group/controls flex justify-between gap-2.5 py-2">
        <div className="h-2.5 w-10 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
        <div className="size-2.5 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
      </div>
      <div className="group/controls flex justify-between gap-2.5 py-2">
        <div className="h-2.5 w-10 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
        <div className="size-2.5 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
      </div>
      <div className="group/controls flex justify-between gap-2.5 py-2">
        <div className="h-2.5 w-10 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
        <div className="size-2.5 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
      </div>
      <div className="group/controls flex justify-between gap-2.5 py-2">
        <div className="h-2.5 w-10 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
        <div className="size-2.5 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
      </div>
      <div className="group/controls flex justify-between gap-2.5 py-2">
        <div className="h-2.5 w-10 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
        <div className="size-2.5 rounded-sm bg-muted-foreground/30 group-hover/controls:bg-muted-foreground/50" />
      </div>
    </div>
  );
}

function Pagination() {
  return (
    <div className="flex justify-end gap-2.5">
      <div className="h-2.5 w-8 rounded-sm bg-muted-foreground/30" />
      <div className="size-2.5 rounded-sm bg-foreground/50" />
      <div className="size-2.5 rounded-sm bg-foreground/50" />
      <div className="size-2.5 rounded-sm bg-foreground/70" />
      <div className="size-2.5 rounded-sm bg-foreground/70" />
    </div>
  );
}

function Hero() {
  return (
    <div className="flex flex-col-reverse items-start justify-between gap-6 sm:flex-row">
      <div className="max-w-4xl">
        <h1 className="mb-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Data Tables for React
        </h1>
        <p className="max-w-[650px] text-muted-foreground">
          Fast, flexible data tables with{" "}
          <Link href="https://tanstack.com/table">TanStack Table</Link>,{" "}
          <Link href="https://ui.shadcn.com">shadcn/ui</Link> and{" "}
          <Link href="https://nuqs.47ng.com">nuqs</Link> for search params.
          <span className="block mt-1 text-sm">Multiple table variations for different use cases.</span>
        </p>
      </div>
      <NextLink
        href="https://github.com/openstatusHQ/data-table-filters"
        target="_blank"
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-white sm:h-12 sm:w-12 hover:border-border/80"
      >
        <Image
          src="/logos/OpenStatus.png"
          alt="OpenStatus Logo"
          className="aspect-square object-cover p-1"
          fill
        />
      </NextLink>
    </div>
  );
}

const changelog: {
  date: Date;
  description: React.ReactNode;
}[] = [
  {
    date: new Date("03-30-2025"),
    description: (
      <>
        Blog post about vercel-edge-ping UI:{" "}
        <Link href="https://www.openstatus.dev/blog/openstatus-light-viewer">
          OpenStatus Light Viewer
        </Link>
      </>
    ),
  },
  {
    date: new Date("03-16-2025"),
    description: (
      <>
        Blog post about tanstack infinite query usage:{" "}
        <Link href="https://www.openstatus.dev/blog/live-mode-infinite-query">
          Live Mode
        </Link>
      </>
    ),
  },
  {
    date: new Date("02-02-2025"),
    description: (
      <>
        Blog post about features and caveats:{" "}
        <Link href="http://openstatus.dev/blog/data-table-redesign">
          The React data-table I always wanted
        </Link>
      </>
    ),
  },
];

function Changelog() {
  return (
    <div className="grid gap-2">
      <p className="font-medium">Changelog</p>
      <ul className="grid gap-2">
        {changelog.map((item, i) => {
          return (
            <li key={i} className="flex flex-col gap-0.5">
              <time className="font-mono text-sm text-muted-foreground">
                {item.date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <p className="text-foreground/80">{item.description}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Examples() {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium">Examples & Resources</p>
      <ul
        role="list"
        className="grid list-inside list-disc gap-2 marker:text-muted-foreground"
      >
        <li><Link href="/light">OpenStatus Light Viewer</Link></li>
        <li><Link href="/default">Default Table</Link></li>
        <li><Link href="/infinite">Infinite Scroll Table</Link></li>
        <li><Link href="/analyze">Analytics Table</Link></li>
        <li><Link href="/compare">Compare Data</Link></li>
      </ul>
    </div>
  );
}

function GuideBadgeLink({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="font-medium">Documentation</p>
      <div className="flex flex-col gap-2">
        <NextLink href="/guide" className="group inline-flex items-center gap-1 text-sm text-foreground hover:underline">
          <Badge
            variant="outline"
            className="border-border bg-background pr-1.5"
          >
            View Guide{" "}
            <ArrowRight className="relative mb-[1px] inline h-3 w-0 transition-all group-hover:w-3" />
            <ChevronRight className="relative mb-[1px] inline h-3 w-3 transition-all group-hover:w-0" />
          </Badge>
        </NextLink>
        <NextLink href="/analyze-doc" className="group inline-flex items-center gap-1 text-sm text-foreground hover:underline">
          <Badge
            variant="outline"
            className="border-border bg-background pr-1.5"
          >
            Analytics Table Docs{" "}
            <ArrowRight className="relative mb-[1px] inline h-3 w-0 transition-all group-hover:w-3" />
            <ChevronRight className="relative mb-[1px] inline h-3 w-3 transition-all group-hover:w-0" />
          </Badge>
        </NextLink>
      </div>
    </div>
  );
}
