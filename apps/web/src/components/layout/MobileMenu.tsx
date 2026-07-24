"use client";

import { Button, Dropdown } from "@heroui/react";
import { primaryNav } from "@/lib/nav";
import { site } from "@/lib/site";

/**
 * Mobile navigation — a HeroUI Dropdown (React Aria menu) so it's fully
 * keyboard + screen-reader accessible and mirrors to RTL from the fa-IR locale.
 * The one interactive island in the header; desktop nav is plain server links.
 * Menu items carry `href`, so React Aria renders them as anchors.
 */
export function MobileMenu() {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          aria-label="باز کردن منو"
          className="md:hidden"
        >
          <MenuIcon />
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end" className="min-w-52">
        <Dropdown.Menu aria-label="منوی اصلی">
          {[
            ...primaryNav.map((item) => (
              <Dropdown.Item key={item.href} href={item.href}>
                {item.label}
              </Dropdown.Item>
            )),
            <Dropdown.Item
              key="studio"
              href={site.studioUrl}
              target="_blank"
            >
              ساخت رزومه
            </Dropdown.Item>,
          ]}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
