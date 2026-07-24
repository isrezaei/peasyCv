import { Card } from "@heroui/react";
import { Icon } from "@/components/ui/Icon";
import type { Feature } from "@/lib/content/features";

const toneBadge: Record<Feature["tone"], string> = {
  brand: "bg-brand/10 text-brand",
  orange: "bg-accent-orange/10 text-accent-orange",
  lavender: "bg-accent-lavender/10 text-accent-lavender",
  turquoise: "bg-accent-turquoise/15 text-[#1899ad]",
  red: "bg-accent-red/10 text-accent-red",
};

/**
 * Outlined feature card (HeroUI Card). Hairline border, no shadow — hover only
 * darkens the border, per the design system's "trust from definition, not lift".
 */
export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Card
      variant="default"
      className="h-full rounded-2xl border border-ink-10 bg-surface p-6 transition-colors hover:border-ink-20"
    >
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${toneBadge[feature.tone]}`}
      >
        <Icon name={feature.icon} size={22} />
      </span>
      <Card.Title className="mt-4 text-h4 font-bold text-ink">
        {feature.title}
      </Card.Title>
      <Card.Description className="mt-2 text-p3 leading-7 text-ink-60">
        {feature.desc}
      </Card.Description>
    </Card>
  );
}
