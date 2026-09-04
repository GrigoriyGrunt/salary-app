import styles from "./Loader.module.css";

type LoaderProps = {
  progress: number;
};

export default function Loader({ progress }: LoaderProps) {
  return (
    <div className={styles.container}>
      <div
        className={styles.bar}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}