import { NavLink } from "react-router-dom";
import styles from "./Header.module.css";

const iconClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.iconBtn} ${styles.active}` : styles.iconBtn;

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          晓报
        </NavLink>
        <nav className={styles.actions}>
          <NavLink to="/search" className={iconClass} aria-label="搜索" title="搜索">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </NavLink>
          <NavLink to="/calendar" className={iconClass} aria-label="按日期浏览" title="按日期浏览">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M3 9h18M8 2v4M16 2v4" />
            </svg>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
