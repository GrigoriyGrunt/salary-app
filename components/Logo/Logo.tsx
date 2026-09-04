import Image from "next/image";
import styles from "./Logo.module.css";

type LogoProps = {
  variant?: "full" | "icon";
  className?: string;
};

export default function Logo({
  variant = "full",
  className = "",
}: LogoProps) {
  const src =
  variant === "icon"
    ? "/images/logo-icon-app.png"
    : "/images/logo-full-app.png";

  return (
    <div className={`${styles.logo} ${className}`}>
      <Image
        src={src}
        alt="Калькулятор ЗП"
        className={`${styles.image} ${
          variant === "icon" ? styles.icon : ""
        }`}
        width={variant === "icon" ? 48 : 180}
        height={variant === "icon" ? 48 : 48}
        priority
      />
    </div>
  );
}
