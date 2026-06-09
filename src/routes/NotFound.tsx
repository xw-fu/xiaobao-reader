import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
      <p>页面不存在。</p>
      <Link to="/" style={{ color: "var(--accent)", fontWeight: 600 }}>
        返回首页
      </Link>
    </div>
  );
}
