import React, { useEffect, useState } from 'react';
import { vscode } from './bridge';
import { 
  useSelectionStore, 
  useCanvasStore, 
  useExplorerStore, 
  useSystemStore, 
  useLogStore, 
  normalizeStyles 
} from './stores';
import { Toolbar } from './components/Toolbar';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { InspectorPanel } from './components/InspectorPanel';
import { Canvas } from './components/Canvas';
import { HomeView } from './components/HomeView';
import { QuickStartGuide } from './components/QuickStartGuide';
import { AuditPanel } from './components/AuditPanel';

const App: React.FC = () => {
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

  const selectionActions = useSelectionStore(state => state.actions);
  const canvasActions = useCanvasStore(state => state.actions);
  const explorerActions = useExplorerStore(state => state.actions);
  const systemActions = useSystemStore(state => state.actions);
  const logActions = useLogStore(state => state.actions);

  // Navigation: Jump to canvas ONLY if on the home screen and a URL is detected
  useEffect(() => {
    if (devServerUrl && view === 'home') {
       // v11.3: Defer navigation to broad-cast phase to avoid cascading render task
       Promise.resolve().then(() => {
         setView('canvas');
         canvasActions.setPan(0, 0);
         canvasActions.setZoom(1);
       });
    }
  }, [devServerUrl, view, canvasActions]);

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
            break;

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


          case 'requestSelect': {
            // v11.0 Hardening: Sidebar -> Canvas selection bridge
            const canvasIframes = document.querySelectorAll('iframe');
            canvasIframes.forEach(iframe => {
              iframe.contentWindow?.postMessage({ type: 'zenithForceSelect', id: m.zenithId }, '*');
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
        if (e.shiftKey) selectionActions.redo();
        else selectionActions.undo();
        e.preventDefault();
      }

      if (e.altKey && e.key.toLowerCase() === 'd') {
        systemActions.toggleDebugMode();
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
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#E0E0E0] overflow-hidden selection:bg-cyan-500/30">
      {/* Studio Header: Force Fixed Height */}
      <Toolbar 
        projectName={projectName}
        surgicalMode={surgicalMode}
        houdiniActive={false}
        connectedServer={connectedServer}
        onToggleSurgical={() => vscode.postMessage({ type: 'toggleSurgical' })}
        onHome={() => setView('home')}
        onOpenQuickStart={() => setIsQuickStartOpen(true)}
        onPublish={() => vscode.postMessage({ type: 'commit' })}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col h-screen">
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
              onPopOut={() => vscode.postMessage({ type: 'popOut' })}
            />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <LeftSidebar />
            <main className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
               <Canvas devServerUrl={devServerUrl} isSpacePressed={isSpacePressed} />
               {debugMode && <AuditPanel />}
            </main>
            <InspectorPanel />
          </div>
        )}

        {/* Visibility Safety Overlay / Status Pill */}
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
          <div className={`px-3 py-1.5 rounded-full text-[10px] font-mono border backdrop-blur-md flex items-center gap-2 ${
            connectedServer 
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
              : 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${connectedServer ? 'bg-cyan-400' : 'bg-red-400'}`} />
            {connectedServer ? 'ZENITH ENGINE ONLINE' : 'DISCONNECTED'}
          </div>
        </div>
      </div>

      <QuickStartGuide isOpen={isQuickStartOpen} onClose={() => setIsQuickStartOpen(false)} />
    </div>
  );
};

export default App;
