import React, { useEffect, useState } from 'react';
import { vscode } from './bridge';
import { 
  useSelectionStore, 
  useCanvasStore, 
  useExplorerStore, 
  useSystemStore, 
  useLogStore 
} from './stores';
import { Toolbar } from './components/Toolbar';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { InspectorPanel } from './components/InspectorPanel';
import { Canvas } from './components/Canvas';
import { ZoomPill } from './components/ZoomPill';
import { HomeView } from './components/HomeView';
import { QuickStartGuide } from './components/QuickStartGuide';
import { AuditPanel } from './components/AuditPanel';

const App: React.FC = () => {
  /* 
     v11.7: Forced Landing Enforcement.
     Starting view is strictly 'home' (Director's Hub).
  */
  const [view, setView] = useState<'home' | 'canvas'>('home');
  const [manualUrl, setManualUrl] = useState('http://localhost:5173');
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [surgicalMode, setSurgicalMode] = useState(false);

  // Store Selectors
  const isSpacePressed = useSystemStore(state => state.isSpacePressed);
  const debugMode = useSystemStore(state => state.debugMode);
  const projectName = useSystemStore(state => state.projectName);
  const connectedServer = useSystemStore(state => state.connectedServer);
  const devServerUrl = useSystemStore(state => state.devServerUrl);
  const detectedServers = useSystemStore(state => state.detectedServers || []);
  const stagedCount = useSelectionStore(state => state.stagedCount);

  const systemActions = useSystemStore(state => state.actions);
  const logActions = useLogStore(state => state.actions);
  const selectionActions = useSelectionStore(state => state.actions);
  const canvasActions = useCanvasStore(state => state.actions);
  const explorerActions = useExplorerStore(state => state.actions);
  const previewMode = useSystemStore(state => state.previewMode);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const m = event.data;
        if (!m || typeof m !== 'object') return;

        switch (m.type) {
          case 'status':
            systemActions.setConnectedServer(m.connected ? `Sidecar :${m.port || 8082}` : null);
            if (m.stagedCount !== undefined) {
               selectionActions.setStagedCount(m.stagedCount);
            }
            if (m.latency !== undefined) {
               systemActions.setLatency(m.latency);
            }
            break;

          case 'projectInfo':
            systemActions.setProjectName(m.name);
            if (m.devServerUrl) {
              systemActions.setDevServerUrl(m.devServerUrl);
            }
            setSurgicalMode(m.surgical || false);
            break;

          case 'sidecarState':
            if (m.state === 'ready') {
              systemActions.setConnectedServer(`Sidecar :${m.port}`);
              logActions.add('success', 'Sidecar connected');
            } else if (m.state === 'error') {
              systemActions.setConnectedServer(null);
              logActions.add('error', `Sidecar failed: ${m.error}`);
            }
            if (m.sandboxPort) {
              systemActions.setSandboxPort(m.sandboxPort);
            }
            break;
            
          case 'devServerDetected':
            if (m.url) {
              systemActions.setDetectedServers(prev => Array.from(new Set([...prev, m.url])));
            }
            break;

          case 'zenithForwardToFrame': {
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
              iframe.contentWindow?.postMessage(m.payload, '*');
            });
            break;
          }
          case 'zenithTreeUpdate':
            explorerActions.setTree(m.tree || []);
            // v12.2 Sync: Forward tree to extension so Sidebar can pick it up
            vscode.postMessage(m);
            break;

          case 'log':
            logActions.add(m.level || 'info', m.text);
            break;

          case 'zenithTextEdit':
          case 'zenithRequestTree':
          case 'zenithOpenSource':
            // v11.3 Hardening: Seamless Bridge -> Extension Forwarding
            vscode.postMessage(m);
            break;

          case 'zenithAuditResult':
            // v11.8: Bridge -> Doctor Audit result forwarding
            window.dispatchEvent(new CustomEvent('zenithAuditReceived', { detail: m.results }));
            break;

          case 'zenithSelect':
          case 'zenithSelectExtended':
            selectionActions.setSelected(
              m.zenithId,
              { id: m.zenithId, tagName: m.element || 'div' },
              m.rect,
              m.computedStyles || {},
              m.stack || []
            );
            // v6.0: Populate Audit & Measurements
            useSelectionStore.setState({ 
                auditIssues: m.audit || [],
                measurementData: m.rect // Reuse rect for simple rulers
            });
            break;

          case 'zenithHover':
            selectionActions.setHover(m.rect, m.tagName);
            break;
          case 'zenithHoverClear':
            selectionActions.setHover(null);
            break;
            
          case 'zenithRectSync':
            if (useSelectionStore.getState().selectedId === m.zenithId) {
              selectionActions.setRect(m.rect);
            }
            break;
 
          case 'zenithStructuralOpSuccess':
            if (m.newId) {
              // v9.5 Mechanical Perfection: Instant selection pivot for all structural ops
              selectionActions.setSelected(
                m.newId,
                { id: m.newId, tagName: m.operation === 'group' ? 'div' : (m.tagName || 'div') },
                null,
                {},
                []
              );
              console.log(`[Zenith] Predictive selection pivot [${m.operation}]: ${m.oldId || 'multiple'} -> ${m.newId}`);
              
              // Push to log for user visibility
              logActions.add('success', `Structural ${m.operation} successful - focusing new element`);
            }
            break;


          case 'zenithPresence':
            // v11.9: Auto-trigger hierarchy build on first presence if tree is offline
            if (useExplorerStore.getState().tree.length === 0) {
              vscode.postMessage({ type: 'zenithRequestTree' });
            }
            break;

          case 'requestSelect': {
            // v11.0 Hardening: Sidebar -> Canvas selection bridge
            const canvasIframes = document.querySelectorAll('iframe');
            canvasIframes.forEach(iframe => {
              iframe.contentWindow?.postMessage({ type: 'zenithForceSelect', id: m.zenithId }, '*');
            });
            break;
          }

          case 'requestHover': {
            const canvasIframes = document.querySelectorAll('iframe');
            canvasIframes.forEach(iframe => {
              iframe.contentWindow?.postMessage({ type: 'zenithForceHover', id: m.zenithId }, '*');
            });
            break;
          }

          case 'requestHoverClear': {
            const canvasIframes = document.querySelectorAll('iframe');
            canvasIframes.forEach(iframe => {
              iframe.contentWindow?.postMessage({ type: 'zenithHoverClear' }, '*');
            });
            break;
          }
         }
      } catch (err) {
        console.error('[Zenith Webview] IPC Message Handler Failed:', err);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) systemActions.setIsSpacePressed(true);
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmd && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          vscode.postMessage({ type: 'redo' });
        } else {
          vscode.postMessage({ type: 'undo' });
        }
        e.preventDefault();
      }

      if (e.altKey && e.key.toLowerCase() === 'd') {
        systemActions.toggleDebugMode();
      }

      if (e.key.toLowerCase() === 'p') {
        systemActions.togglePreview();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') systemActions.setIsSpacePressed(false);
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    vscode.postMessage({ type: 'ready' });

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [systemActions, logActions, selectionActions, explorerActions, canvasActions]);

  return (
    <div className="flex flex-col h-screen bg-black text-text-primary overflow-hidden selection:bg-accent/10">
      {/* Studio Toolbar (Fixed Position) */}
      <Toolbar 
        projectName={projectName}
        surgicalMode={surgicalMode}
        onToggleSurgical={() => vscode.postMessage({ type: 'toggleSurgical' })}
        onHome={() => setView('home')}
        onPublish={() => vscode.postMessage({ type: 'commit' })}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col pt-20">
        {view === 'home' ? (
          <div className="flex-1 overflow-y-auto">
            <HomeView 
              projectName={projectName}
              connectedServer={connectedServer}
              devServerUrl={devServerUrl}
              detectedServers={detectedServers}
              manualUrl={manualUrl}
              setManualUrl={setManualUrl}
              onConnect={(url) => {
                systemActions.setDevServerUrl(url);
                setView('canvas');
                vscode.postMessage({ type: 'setDevServerUrl', url });
              }}
              onStart={() => setView('canvas')}
            />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
             {!previewMode && <LeftSidebar />}
             <main className="flex-1 relative bg-surface border-x border-border-subtle overflow-hidden">
                <Canvas devServerUrl={devServerUrl} isSpacePressed={isSpacePressed} />
                {!previewMode && <ZoomPill />}
                {debugMode && <AuditPanel />}
             </main>
             {!previewMode && <InspectorPanel />}
          </div>
        )}

        {/* Visibility Safety Overlay / System Log */}
        <div className="fixed bottom-4 left-4 z-[9999] pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface border border-border-normal text-[9px] font-mono tracking-tighter">
              <span className="text-text-muted">SYSTEM STATUS //</span>
              <span className={connectedServer ? 'text-accent' : 'text-red-500'}>
                {connectedServer ? 'ONLINE' : 'OFFLINE'}
              </span>
           </div>
        </div>
      </div>

      <QuickStartGuide isOpen={isQuickStartOpen} onClose={() => setIsQuickStartOpen(false)} />
    </div>
  );
};

export default App;
