"use client";

import { chakra, Popover, Portal, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { ChartBarIcon, FilesIcon, LogInIcon, LogOutIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DOCK } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import { AvatarGlyph } from "./dockIcons";

interface MenuRowProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function MenuRow({ icon, label, onClick }: MenuRowProps) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap="10px"
      width="100%"
      px="10px"
      py="8px"
      fontSize="sm"
      color="fg"
      bg="transparent"
      cursor="pointer"
      borderRadius="md"
      transition="background .12s"
      _hover={{ bg: "bg.muted" }}
    >
      {icon}
      {label}
    </chakra.button>
  );
}

/**
 * The sole entry point for account actions (imported refactor spec): the
 * avatar itself when authenticated, a login glyph otherwise. Replaces the
 * standalone Files/Admin/Login/Logout buttons the rail used to render —
 * same routes and `useAuth` calls, now behind one dropdown. "User Panel"
 * maps to the app's actual authenticated destination, /dashboard.
 */
export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const authenticated = status === "authenticated";

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    setOpen(false);
    void logout();
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      positioning={{ placement: "bottom-end" }}
      lazyMount
      unmountOnExit
    >
      <Popover.Trigger asChild>
        <chakra.button
          type="button"
          aria-label={authenticated ? t.topbar.menuProfile : t.topbar.login}
          className="no-print"
          width="38px"
          height="38px"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          bg={DOCK.avatarBg}
          color={DOCK.avatarFg}
          transition="background .15s, color .15s"
          _hover={{ bg: DOCK.hoverBg, color: DOCK.hoverFg }}
        >
          {authenticated ? <AvatarGlyph /> : <LogInIcon size={18} />}
        </chakra.button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            width="196px"
            borderRadius="xl"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            boxShadow="lg"
            overflow="hidden"
            className="no-print"
          >
            <Popover.Body p="6px">
              <Stack gap="1px">
                {authenticated ? (
                  <>
                    <MenuRow icon={<FilesIcon />} label={t.topbar.menuResumes} onClick={() => go("/dashboard")} />
                    {user?.isAdmin ? (
                      <MenuRow icon={<ChartBarIcon />} label={t.admin.title} onClick={() => go("/admin")} />
                    ) : null}
                    <MenuRow icon={<LogOutIcon />} label={t.topbar.menuLogout} onClick={handleLogout} />
                  </>
                ) : (
                  <MenuRow icon={<LogInIcon />} label={t.topbar.login} onClick={() => go("/login")} />
                )}
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
