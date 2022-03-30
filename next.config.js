const api = 'http://192.168.43.159:*'
const connectSrc = 'http://192.168.43.159:* ws://192.168.43.159:*'
const fontSrc = '*.fonts.googleapis.com'

const ContentSecurityPolicy = `
  default-src 'self';
  connect-src 'self' ${connectSrc};
  style-src 'self' 'unsafe-inline';
  script-src 'self' 'unsafe-eval';
  img-src 'self' ${api}; 
  media-src 'self' ${api};
  font-src 'self' ${fontSrc};  
`
const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
    },
    {
        key: 'Content-Security-Policy',
        value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
    }
]

const config = {
    webpack: function (config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });
        return config
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ]
    }
};
module.exports = config