"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNavigation.module.css";

export default function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      <Link href="/" className={pathname === "/" ? styles.active : ""}>
  <Image
    src="/images/icons/home-black.png"
    alt="Главная"
    width={22}
    height={22}
    className={styles.icon}
  />
  <span>Главная</span>
</Link>

<Link
  href="/schedule"
  className={pathname === "/schedule" ? styles.active : ""}
>
  <Image
    src="/images/icons/schedule-black.png"
    alt="График"
    width={22}
    height={22}
    className={styles.icon}
  />
  <span>График</span>
</Link>

<Link
  href="/money"
  className={pathname === "/money" ? styles.active : ""}
>
  <Image
    src="/images/icons/money-black.png"
    alt="Деньги"
    width={22}
    height={22}
    className={styles.icon}
  />
  <span>Деньги</span>
</Link>

      <Link
  href="/statistics"
  className={pathname === "/statistics" ? styles.active : ""}
>
  <Image
    src="/images/icons/statistics-black.png"
    alt="Статистика"
    width={22}
    height={22}
    className={styles.icon}
  />
  <span>Статистика</span>
</Link>

<Link
  href="/profile"
  className={pathname === "/profile" ? styles.active : ""}
>
  <Image
    src="/images/icons/profile-black.png"
    alt="Профиль"
    width={22}
    height={22}
    className={styles.icon}
  />
  <span>Профиль</span>
</Link>
    </nav>
  );
}