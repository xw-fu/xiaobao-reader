import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/base.css";
import App from "./App";
import Calendar from "./routes/Calendar";
import Report from "./routes/Report";
import Search from "./routes/Search";
import NotFound from "./routes/NotFound";
import { ManifestProvider } from "./data/ManifestContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ManifestProvider>
        <Routes>
          <Route element={<App />}>
            <Route index element={<Calendar />} />
            <Route path="/r/:date" element={<Report />} />
            <Route path="/r/:date/:edition" element={<Report />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ManifestProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
