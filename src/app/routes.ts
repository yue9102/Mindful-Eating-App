import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { HomePage } from "./pages/home";
import { SessionPage } from "./pages/session";
import { SummaryPage } from "./pages/summary";
import { DiaryPage } from "./pages/diary";
import { DiaryDetailPage } from "./pages/diary-detail";
import { SettingsPage } from "./pages/settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "session", Component: SessionPage },
      { path: "summary", Component: SummaryPage },
      { path: "diary", Component: DiaryPage },
      { path: "diary/:id", Component: DiaryDetailPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
