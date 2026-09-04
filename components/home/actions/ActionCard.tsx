import styles from "./ActionCard.module.css";

import Image from "next/image";
import Link from "next/link";

type ActionCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  href: string;
};

export default function ActionCard({
  icon,
  title,
  subtitle,
  href,
}: ActionCardProps) {
  return (
    <Link href={href} className={styles.card}>
  <Image
    src={icon}
    alt={title}
    width={30}
    height={30}
  />

  <div className={styles.content}>
    <strong>{title}</strong>
    <span>{subtitle}</span>
  </div>
</Link>
  );
}