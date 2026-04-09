/**
 * @zenith/next-plugin — Next.js webpack loader integration (Change #4 — Global Mode)
 *
 * Wraps Next.js config with a custom webpack loader that intercepts every
 * JSX/TSX source file and queries the Ghost-Proxy for the Ghost-ID injected
 * version. Falls back transparently to the original file if the sidecar is
 * offline or the file is not in the VFS cache.
 *
 * Usage (next.config.ts):
 *   import { withZenith } from '@zenith/next-plugin';
 *   export default withZenith(nextConfig);
 */

import type { NextConfig } from 'next';

const ZENITH_PROXY_PORT = parseInt(process.env.ZENITH_PORT ?? '8083', 10);

export function withZenith(nextConfig: NextConfig = {}): NextConfig {
    return {
        ...nextConfig,
        webpack(config: any, options: any) {
            // Inject Zenith Ghost-Proxy loader before Babel/SWC transforms
            config.module.rules.unshift({
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('./zenith-loader'),
                        options: {
                            proxyPort: ZENITH_PROXY_PORT,
                        },
                    },
                ],
            });

            // Preserve user's webpack customization
            if (typeof nextConfig.webpack === 'function') {
                return nextConfig.webpack(config, options);
            }
            return config;
        },
    };
}
