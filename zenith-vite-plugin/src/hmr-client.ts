// ---------------------------------------------------------------------------
// Zenith HMR Client — State Preservation
// ---------------------------------------------------------------------------
//
// Injected into the browser to listen for surgical patches from the Sidecar.
// Uses Vite's HMR API to swap modules without full page reloads.

export function setupHmrClient() {
  const hot = (import.meta as any).hot;
  if (hot) {
    // Listen for custom 'zenith-hmr' events from the Vite dev server
    // (which are forwarded from the Rust Sidecar)
    hot.on('zenith-hmr', (data: { file: string, patch: string, __zenith_origin: boolean }) => {
      if (!data.__zenith_origin) return;

      console.log(`[Zenith HMR] Applying surgical patch to ${data.file}`);
      
      // Trigger Vite's HMR reload for the specific module
      // The dev server will now serve the Ghost-Proxy virtualized version
      hot.accept(data.file, (newModule: any) => {
        if (newModule) {
          console.log(`[Zenith HMR] Module ${data.file} updated successfully.`);
        }
      });
      
      // Invalidate the module to force a re-fetch
      hot.invalidate();
    });
  }
}
