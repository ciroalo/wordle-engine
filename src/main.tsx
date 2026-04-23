import "./ui/styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameProvider } from "./ui/context/GameContext";
import App from "./ui/components/App/App";

// Set default theme before first paint
document.documentElement.setAttribute("data-theme", "dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
);
