import { NavLink } from "react-router-dom";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>晓报</NavLink>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : "")}>
            日历
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => (isActive ? styles.active : "")}>
            搜索
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
