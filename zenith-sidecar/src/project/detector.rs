//! # Framework Detector (Change #3 — Global Mode)
//!
//! Detects the frontend framework used by a project by reading `package.json`.
//! This drives Ghost-Proxy configuration, HMR plugin selection, and entry glob
//! patterns for Ghost-ID injection.
//!
//! ## Detection Order
//! Checks from most specific to most general to avoid false positives:
//! Next.js → Remix → Astro → Nuxt → SvelteKit → Vite → CRA → Unknown

use std::collections::HashSet;
use std::path::Path;

use serde::{Deserialize, Serialize};
use tracing::{debug, info, warn};

// ---------------------------------------------------------------------------
// Framework enum
// ---------------------------------------------------------------------------

/// Detected frontend framework for a workspace.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Framework {
    /// Vite (vite in devDependencies)
    Vite,
    /// Next.js (next in dependencies)
    NextJs,
    /// Create React App (react-scripts)
    CreateReactApp,
    /// Remix (@remix-run/react)
    Remix,
    /// Astro (astro in devDependencies)
    Astro,
    /// Nuxt (nuxt in dependencies)
    Nuxt,
    /// SvelteKit (@sveltejs/kit)
    SvelteKit,
    /// Could not detect — treat as generic JS/TS project
    Unknown,
}

impl Framework {
    pub fn as_str(&self) -> &'static str {
        match self {
            Framework::Vite             => "Vite",
            Framework::NextJs           => "NextJs",
            Framework::CreateReactApp   => "CreateReactApp",
            Framework::Remix            => "Remix",
            Framework::Astro            => "Astro",
            Framework::Nuxt             => "Nuxt",
            Framework::SvelteKit        => "SvelteKit",
            Framework::Unknown          => "Unknown",
        }
    }
}

impl std::str::FromStr for Framework {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "vite" => Ok(Framework::Vite),
            "nextjs" | "next.js" => Ok(Framework::NextJs),
            "createreactapp" | "cra" => Ok(Framework::CreateReactApp),
            "remix" => Ok(Framework::Remix),
            "astro" => Ok(Framework::Astro),
            "nuxt" => Ok(Framework::Nuxt),
            "sveltekit" | "svelte-kit" => Ok(Framework::SvelteKit),
            "unknown" => Ok(Framework::Unknown),
            _ => Err(()),
        }
    }
}

impl std::fmt::Display for Framework {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

// ---------------------------------------------------------------------------
// Proxy configuration per framework
// ---------------------------------------------------------------------------

/// The injection method used to serve Ghost-ID content.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum InjectMethod {
    /// Vite plugin via `load()` hook
    VitePlugin,
    /// Next.js webpack loader
    WebpackLoader,
    /// Astro integration via `astro:build:setup`
    AstroIntegration,
    /// Svelte preprocessor
    SveltePreprocess,
    /// Direct file-watch without framework integration
    DirectFileWatch,
}

/// Per-framework Ghost-Proxy configuration.
#[derive(Debug, Clone)]
pub struct ProxyConfig {
    /// Which config file to look for in the workspace root
    pub config_file: &'static str,
    /// npm package to suggest installing
    pub plugin_package: &'static str,
    /// How to inject Ghost-IDs at dev-server file serving time
    pub inject_method: InjectMethod,
    /// Glob pattern for source files to inject Ghost-IDs into
    pub entry_glob: &'static str,
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/// Detect the frontend framework used in a workspace root.
///
/// Reads `package.json` and checks `dependencies`, `devDependencies`,
/// and `peerDependencies` for known framework packages.
pub fn detect_framework(workspace_root: &Path) -> Framework {
    let pkg_path = workspace_root.join("package.json");

    let pkg_text = match std::fs::read_to_string(&pkg_path) {
        Ok(t) => t,
        Err(_) => {
            debug!("No package.json found at {:?} — framework unknown", pkg_path);
            return Framework::Unknown;
        }
    };

    let pkg: serde_json::Value = match serde_json::from_str(&pkg_text) {
        Ok(v) => v,
        Err(e) => {
            warn!("Failed to parse package.json: {}", e);
            return Framework::Unknown;
        }
    };

    // Collect all dependency names from all dep groups
    let mut all_deps = HashSet::<String>::new();
    for key in &["dependencies", "devDependencies", "peerDependencies"] {
        if let Some(obj) = pkg[key].as_object() {
            all_deps.extend(obj.keys().cloned());
        }
    }

    // Order matters — more specific before more general
    let framework = if all_deps.contains("next") {
        Framework::NextJs
    } else if all_deps.contains("@remix-run/react") {
        Framework::Remix
    } else if all_deps.contains("astro") {
        Framework::Astro
    } else if all_deps.contains("nuxt") {
        Framework::Nuxt
    } else if all_deps.contains("@sveltejs/kit") {
        Framework::SvelteKit
    } else if all_deps.contains("vite") {
        Framework::Vite
    } else if all_deps.contains("react-scripts") {
        Framework::CreateReactApp
    } else {
        Framework::Unknown
    };

    info!("Detected framework: {} for {:?}", framework, workspace_root);
    framework
}

// ---------------------------------------------------------------------------
// Proxy config lookup
// ---------------------------------------------------------------------------

/// Return the Ghost-Proxy configuration for a detected framework.
pub fn proxy_config_for(framework: &Framework) -> ProxyConfig {
    match framework {
        Framework::Vite => ProxyConfig {
            config_file:    "vite.config.ts",
            plugin_package: "@zenith/vite-plugin",
            inject_method:  InjectMethod::VitePlugin,
            entry_glob:     "src/**/*.{tsx,jsx,ts,js}",
        },
        Framework::NextJs => ProxyConfig {
            config_file:    "next.config.{js,ts,mjs}",
            plugin_package: "@zenith/next-plugin",
            inject_method:  InjectMethod::WebpackLoader,
            entry_glob:     "{app,pages,components}/**/*.{tsx,jsx}",
        },
        Framework::Remix => ProxyConfig {
            config_file:    "remix.config.{js,ts}",
            plugin_package: "@zenith/remix-plugin",
            inject_method:  InjectMethod::VitePlugin, // Remix v2 uses Vite
            entry_glob:     "app/**/*.{tsx,jsx}",
        },
        Framework::Astro => ProxyConfig {
            config_file:    "astro.config.{mjs,ts}",
            plugin_package: "@zenith/astro-integration",
            inject_method:  InjectMethod::AstroIntegration,
            entry_glob:     "src/**/*.{tsx,jsx,astro}",
        },
        Framework::SvelteKit => ProxyConfig {
            config_file:    "svelte.config.js",
            plugin_package: "@zenith/svelte-plugin",
            inject_method:  InjectMethod::SveltePreprocess,
            entry_glob:     "src/**/*.svelte",
        },
        Framework::CreateReactApp => ProxyConfig {
            config_file:    "package.json",
            plugin_package: "@zenith/cra-plugin",
            inject_method:  InjectMethod::DirectFileWatch,
            entry_glob:     "src/**/*.{tsx,jsx}",
        },
        Framework::Nuxt | Framework::Unknown => ProxyConfig {
            config_file:    "",
            plugin_package: "",
            inject_method:  InjectMethod::DirectFileWatch,
            entry_glob:     "src/**/*.{tsx,jsx,ts,js,vue}",
        },
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::TempDir;

    fn write_pkg(dir: &TempDir, deps: &[&str]) {
        let mut dep_obj = serde_json::Map::new();
        for dep in deps {
            dep_obj.insert(dep.to_string(), serde_json::Value::String("*".into()));
        }
        let pkg = serde_json::json!({ "dependencies": dep_obj });
        let path = dir.path().join("package.json");
        std::fs::write(&path, pkg.to_string()).unwrap();
    }

    #[test]
    fn test_detect_vite() {
        let dir = TempDir::new().unwrap();
        write_pkg(&dir, &["react", "vite"]);
        assert_eq!(detect_framework(dir.path()), Framework::Vite);
    }

    #[test]
    fn test_detect_next() {
        let dir = TempDir::new().unwrap();
        write_pkg(&dir, &["next", "react"]);
        assert_eq!(detect_framework(dir.path()), Framework::NextJs);
    }

    #[test]
    fn test_detect_next_before_vite() {
        // Next.js projects often also have vite in devDeps — Next should win
        let dir = TempDir::new().unwrap();
        let pkg = serde_json::json!({
            "dependencies": { "next": "*", "react": "*" },
            "devDependencies": { "vite": "*" }
        });
        std::fs::write(dir.path().join("package.json"), pkg.to_string()).unwrap();
        assert_eq!(detect_framework(dir.path()), Framework::NextJs);
    }

    #[test]
    fn test_detect_remix() {
        let dir = TempDir::new().unwrap();
        write_pkg(&dir, &["@remix-run/react", "react"]);
        assert_eq!(detect_framework(dir.path()), Framework::Remix);
    }

    #[test]
    fn test_detect_svelte() {
        let dir = TempDir::new().unwrap();
        write_pkg(&dir, &["@sveltejs/kit"]);
        assert_eq!(detect_framework(dir.path()), Framework::SvelteKit);
    }

    #[test]
    fn test_detect_unknown_no_package_json() {
        let dir = TempDir::new().unwrap();
        assert_eq!(detect_framework(dir.path()), Framework::Unknown);
    }

    #[test]
    fn test_proxy_config_vite() {
        let cfg = proxy_config_for(&Framework::Vite);
        assert_eq!(cfg.inject_method, InjectMethod::VitePlugin);
        assert_eq!(cfg.plugin_package, "@zenith/vite-plugin");
    }

    #[test]
    fn test_proxy_config_next() {
        let cfg = proxy_config_for(&Framework::NextJs);
        assert_eq!(cfg.inject_method, InjectMethod::WebpackLoader);
    }
}
