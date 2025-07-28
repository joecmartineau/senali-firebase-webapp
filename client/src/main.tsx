import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("Senali app starting...");

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  console.log("Root element found, creating React app...");
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("React app rendered successfully");
} catch (error) {
  console.error("Failed to start app:", error);
  
  // Create error display using safe DOM methods
  const errorDiv = document.createElement('div');
  errorDiv.style.padding = '20px';
  errorDiv.style.color = 'red';
  errorDiv.style.fontFamily = 'monospace';
  
  const title = document.createElement('h1');
  title.textContent = 'Error starting Senali app';
  
  const errorPre = document.createElement('pre');
  errorPre.textContent = String(error);
  
  errorDiv.appendChild(title);
  errorDiv.appendChild(errorPre);
  
  document.body.appendChild(errorDiv);
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
