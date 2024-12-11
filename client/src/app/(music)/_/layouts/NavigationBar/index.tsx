"use client";

import { ChartNoAxesColumn, Disc, Music, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

import { HeaderMenu } from "@/app/_/layouts";
import { useAlbums, useMobile } from "@/music/_/hooks";
import { Album } from "@/music/_/types";

import styles from "./styles.module.scss";

function AlbumsBadge({ currentAlbum }: { currentAlbum: Album | null }) {
  const { gradient, cover } = currentAlbum || {};
  const pathname = usePathname();
  const checkId = pathname.split("/");

  return (
    <div style={{ position: "relative" }}>
      <Disc />

      {checkId.length > 2 && (
        <div
          className={styles.currentAlbumBadge}
          style={{ background: cover ? `url(${cover})` : `${gradient}`, borderRadius: "50%" }}
        ></div>
      )}
    </div>
  );
}

const createNavigationList = (currentAlbum: Album | null) => {
  return [
    { path: "/allmusic", icon: <Music /> },
    { path: "/search", icon: <Search /> },
    {
      path: "/albums",
      icon: <AlbumsBadge currentAlbum={currentAlbum} />,
    },
    { path: "/charts", icon: <ChartNoAxesColumn /> },
  ];
};

const NavigationBar = ({ isMobile }: { isMobile: boolean }) => {
  const pathname = usePathname();
  const { albums } = useAlbums();

  const findCurrentAlbum = useCallback(
    (identifier: string) => {
      return albums?.albums.find((album) => album.id === identifier) || null;
    },
    [albums],
  );

  const currentAlbumId = findCurrentAlbum(pathname.split("/")[2]);
  const navigationList = createNavigationList(currentAlbumId);

  return (
    <ul className={isMobile ? styles.listMobile : styles.listDesktop}>
      {navigationList.map(({ path, icon }) => {
        const isActive = path === pathname;
        return (
          <li key={path}>
            <Link
              href={path}
              style={{ color: isActive ? "var(--accent)" : "var(--grey)" }}
              className={styles.link}
            >
              {icon}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export function DesktopNavigationBar() {
  const isMobile = useMobile(576);

  if (!isMobile) {
    return (
      <aside className={styles.desktopSidebarContainer}>
        <HeaderMenu />
        <NavigationBar isMobile={false} />
      </aside>
    );
  }

  return null;
}

export function MobileNavigationbar() {
  const isMobile = useMobile(576);

  if (isMobile) {
    return <NavigationBar isMobile={true} />;
  }

  return null;
}
