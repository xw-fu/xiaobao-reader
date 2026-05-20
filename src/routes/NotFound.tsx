import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <p>页面不存在。</p>
      <Link to="/">返回日历</Link>
    </div>
  );
}
