import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Self-hosted fonts — bundled by Vite into dist/, no CDN call at runtime.
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";

import "./styles/archlens-tokens.css"; // @archlens/tokens（vendored）— 須在本地 tokens 之前
import "./styles/tokens.css";
import "./styles/buttons.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
