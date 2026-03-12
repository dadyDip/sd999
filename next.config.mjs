/** @type {import('next').NextConfig} */
import WebpackObfuscator from 'webpack-obfuscator';

const nextConfig = {
  reactStrictMode: true,
  
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack configuration for obfuscation
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new WebpackObfuscator({
          rotateStringArray: true,
          stringArray: true,
          stringArrayThreshold: 0.75,
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: true,
          debugProtectionInterval: true,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: true,
          renameGlobals: false,
          selfDefending: true,
          simplify: true,
          splitStrings: true,
          splitStringsChunkLength: 10,
          stringArrayEncoding: ['rc4'],
          stringArrayIndexShift: true,
          stringArrayWrappersCount: 5,
          stringArrayWrappersChainedCalls: true,
          transformObjectKeys: true,
          unicodeEscapeSequence: false
        })
      );
    }
    return config;
  },
};

export default nextConfig;