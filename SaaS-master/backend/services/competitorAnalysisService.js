import puppeteer from 'puppeteer';
import axios from 'axios';

const competitorAnalysisService = {
  /**
   * Main function to analyze a website using Puppeteer
   * @param {string} domain - The domain to analyze
   * @returns {Object} Comprehensive analysis data
   */
  async analyzeWebsite(domain) {
    let browser;
    
    // Validate input
    if (!domain || typeof domain !== 'string') {
      console.error('❌ Invalid domain provided:', domain);
      return {
        success: false,
        error: 'Invalid domain parameter',
        domain: domain
      };
    }

    let url = domain.trim();

    // Ensure URL has protocol
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    try {
      console.log(`🔍 Starting Puppeteer analysis for: ${url}`);

      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-web-security',
        ],
        timeout: 30000
      });

      const page = await browser.newPage();

      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Set timeout
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      // Capture response headers
      let responseHeaders = {};
      let serverInfo = null;
      let statusCode = null;

      page.on('response', response => {
        if (response.url() === url) {
          responseHeaders = response.headers();
          serverInfo = response.headers()['server'] || null;
          statusCode = response.status();
        }
      });

      // Navigate to page
      console.log(`📄 Loading page: ${url}`);
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Check if HTTPS
      const isHTTPS = url.startsWith('https://');

      // Extract all data from page
      const pageData = await page.evaluate(() => {
        // ========== 1. ON-PAGE SEO ELEMENTS ==========
        const seoElements = {
          title: document.title || null,
          metaDescription: document.querySelector('meta[name="description"]')?.content || null,
          canonical: document.querySelector('link[rel="canonical"]')?.href || null,
          robotsMeta: document.querySelector('meta[name="robots"]')?.content || null,
          
          // Heading tags
          headings: {
            h1: Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim()),
            h2: Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim()),
            h3: Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim()),
            h1Count: document.querySelectorAll('h1').length,
            h2Count: document.querySelectorAll('h2').length,
            h3Count: document.querySelectorAll('h3').length
          },
          
          // Open Graph tags
          openGraph: {
            title: document.querySelector('meta[property="og:title"]')?.content || null,
            description: document.querySelector('meta[property="og:description"]')?.content || null,
            image: document.querySelector('meta[property="og:image"]')?.content || null,
            type: document.querySelector('meta[property="og:type"]')?.content || null,
            url: document.querySelector('meta[property="og:url"]')?.content || null
          },
          
          // Twitter Card tags
          twitterCard: {
            card: document.querySelector('meta[name="twitter:card"]')?.content || null,
            title: document.querySelector('meta[name="twitter:title"]')?.content || null,
            description: document.querySelector('meta[name="twitter:description"]')?.content || null,
            image: document.querySelector('meta[name="twitter:image"]')?.content || null,
            site: document.querySelector('meta[name="twitter:site"]')?.content || null
          },
          
          // Schema markup
          schemaMarkup: Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map(script => {
              try {
                const json = JSON.parse(script.textContent);
                return {
                  type: json['@type'] || (json['@graph'] ? 'Graph' : 'Unknown'),
                  raw: json
                };
              } catch (e) {
                return { type: 'Invalid JSON', error: e.message };
              }
            })
        };

        // ========== 2. CONTENT ANALYSIS ==========
        const bodyText = document.body?.innerText || '';
        const words = bodyText.trim().split(/\s+/).filter(w => w.length > 0);
        const paragraphs = document.querySelectorAll('p');
        
        const images = Array.from(document.querySelectorAll('img'));
        const imagesWithAlt = images.filter(img => img.alt && img.alt.trim().length > 0);
        
        const allLinks = Array.from(document.querySelectorAll('a[href]'));
        const currentDomain = window.location.hostname;
        
        const internalLinks = allLinks.filter(link => {
          try {
            const linkUrl = new URL(link.href, window.location.href);
            return linkUrl.hostname === currentDomain;
          } catch {
            return false;
          }
        });
        
        const externalLinks = allLinks.filter(link => {
          try {
            const linkUrl = new URL(link.href, window.location.href);
            return linkUrl.hostname !== currentDomain && !link.href.startsWith('#');
          } catch {
            return false;
          }
        });

        // Check for broken links (invalid hrefs)
        const brokenLinks = allLinks.filter(link => {
          const href = link.getAttribute('href');
          return !href || href === '#' || href === '' || href === 'javascript:void(0)';
        }).length;

        const contentAnalysis = {
          wordCount: words.length,
          paragraphCount: paragraphs.length,
          images: {
            total: images.length,
            withAlt: imagesWithAlt.length,
            altCoverage: images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 100) : 0
          },
          links: {
            total: allLinks.length,
            internal: internalLinks.length,
            external: externalLinks.length,
            broken: brokenLinks
          }
        };

        // ========== 3. TECHNOLOGY STACK ==========
        const technology = {
          // CMS Detection
          cms: null,
          
          // JavaScript Frameworks
          frameworks: [],
          
          // Analytics Tools
          analytics: [],
          
          // Third-party scripts
          thirdPartyScripts: []
        };

        // CMS Detection
        if (document.querySelector('meta[name="generator"][content*="WordPress"]') || 
            document.body.classList.contains('wp-admin') ||
            window.wp) {
          technology.cms = 'WordPress';
        } else if (document.querySelector('meta[name="shopify-digital-wallet"]') ||
                   window.Shopify) {
          technology.cms = 'Shopify';
        } else if (document.querySelector('meta[name="generator"][content*="Wix"]') ||
                   window.wixBiSession) {
          technology.cms = 'Wix';
        } else if (document.querySelector('[data-wf-page]') ||
                   window.Webflow) {
          technology.cms = 'Webflow';
        }

        // Framework Detection
        if (window.React || document.querySelector('[data-reactroot], [data-reactid]')) {
          technology.frameworks.push('React');
        }
        if (window.Vue || document.querySelector('[data-v-]')) {
          technology.frameworks.push('Vue.js');
        }
        if (window.angular || document.querySelector('[ng-version]')) {
          technology.frameworks.push('Angular');
        }
        if (window.next || document.querySelector('#__next')) {
          technology.frameworks.push('Next.js');
        }
        if (document.querySelector('[data-nuxt]') || window.__NUXT__) {
          technology.frameworks.push('Nuxt.js');
        }

        // Analytics Detection
        if (window.ga || window.gtag || document.querySelector('script[src*="google-analytics"]')) {
          technology.analytics.push('Google Analytics');
        }
        if (window.fbq || document.querySelector('script[src*="facebook.net"]')) {
          technology.analytics.push('Facebook Pixel');
        }
        if (window.hj || document.querySelector('script[src*="hotjar"]')) {
          technology.analytics.push('Hotjar');
        }
        if (window.mixpanel || document.querySelector('script[src*="mixpanel"]')) {
          technology.analytics.push('Mixpanel');
        }
        if (window.gtag || document.querySelector('script[src*="googletagmanager"]')) {
          technology.analytics.push('Google Tag Manager');
        }

        // Third-party scripts
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        technology.thirdPartyScripts = scripts
          .map(script => {
            try {
              const url = new URL(script.src);
              return url.hostname !== window.location.hostname ? url.hostname : null;
            } catch {
              return null;
            }
          })
          .filter(domain => domain !== null)
          .filter((domain, index, self) => self.indexOf(domain) === index); // unique

        // ========== 4. SECURITY & TECHNICAL ==========
        const security = {
          mixedContent: [],
          hasServiceWorker: !!navigator.serviceWorker
        };

        // Check for mixed content (https page loading http resources)
        if (window.location.protocol === 'https:') {
          const httpResources = Array.from(document.querySelectorAll('[src], [href]'))
            .map(el => el.src || el.href)
            .filter(url => url && typeof url === 'string' && url.startsWith('http://'));
          security.mixedContent = httpResources.slice(0, 10); // First 10
        }

        return {
          seoElements,
          contentAnalysis,
          technology,
          security
        };
      });

      // ========== Additional Checks Outside Browser Context ==========
      
      // Check robots.txt
      const robotsTxt = await this.checkRobotsTxt(url);
      
      // Check sitemap
      const sitemap = await this.checkSitemap(url);

      // Detect CDN from headers
      const cdn = this.detectCDN(responseHeaders);

      console.log(`✅ Puppeteer analysis completed for: ${domain}`);

      return {
        success: true,
        url: url,
        domain: domain,
        timestamp: new Date().toISOString(),
        statusCode: statusCode,
        
        // Security & Technical
        security: {
          isHTTPS: isHTTPS,
          server: serverInfo,
          cdn: cdn,
          mixedContent: pageData.security.mixedContent.length > 0,
          mixedContentCount: pageData.security.mixedContent.length,
          hasServiceWorker: pageData.security.hasServiceWorker
        },
        
        // Robots and Sitemap
        robotsTxt: robotsTxt,
        sitemap: sitemap,
        
        // SEO Elements
        seo: pageData.seoElements,
        
        // Content Analysis
        content: pageData.contentAnalysis,
        
        // Technology Stack
        technology: pageData.technology
      };

    } catch (error) {
      console.error(`❌ Puppeteer analysis failed for ${domain}:`, error.message);

      return {
        success: false,
        url: url,
        domain: domain,
        error: error.message,
        errorType: this.categorizeError(error),
        timestamp: new Date().toISOString()
      };
    } finally {
      // Always cleanup browser instance
      if (browser) {
        try {
          await browser.close();
          console.log(`🔴 Browser closed for ${domain}`);
        } catch (closeError) {
          console.error(`⚠️ Error closing browser for ${domain}:`, closeError.message);
        }
      }
    }
  },

  /**
   * Check robots.txt file
   */
  async checkRobotsTxt(url) {
    try {
      const robotsUrl = new URL('/robots.txt', url).href;
      const response = await axios.get(robotsUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 SEO-Analyzer' }
      });
      
      return {
        exists: true,
        accessible: true,
        content: response.data.substring(0, 1000)
      };
    } catch (error) {
      return {
        exists: false,
        accessible: false,
        error: error.message
      };
    }
  },

  /**
   * Check sitemap.xml file
   */
  async checkSitemap(url) {
    const sitemapUrls = [
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/sitemap-index.xml'
    ];

    for (const sitemapPath of sitemapUrls) {
      try {
        const sitemapUrl = new URL(sitemapPath, url).href;
        const response = await axios.get(sitemapUrl, {
          timeout: 10000,
          headers: { 'User-Agent': 'Mozilla/5.0 SEO-Analyzer' }
        });
        
        // Count URLs in sitemap
        const urlMatches = response.data.match(/<loc>/g);
        const urlCount = urlMatches ? urlMatches.length : 0;
        
        return {
          exists: true,
          accessible: true,
          url: sitemapUrl,
          urlCount: urlCount
        };
      } catch (error) {
        // Try next sitemap URL
        continue;
      }
    }

    return {
      exists: false,
      accessible: false,
      error: 'No sitemap found'
    };
  },

  /**
   * Detect CDN from response headers
   */
  detectCDN(headers) {
    const cdnIndicators = {
      'cf-ray': 'Cloudflare',
      'x-amz-cf-id': 'CloudFront (AWS)',
      'x-cache': headers['x-cache']?.includes('cloudfront') ? 'CloudFront (AWS)' : null,
      'server': headers['server']?.toLowerCase().includes('cloudflare') ? 'Cloudflare' : null,
      'x-fastly-request-id': 'Fastly',
      'x-akamai-request-id': 'Akamai'
    };

    for (const [header, cdnName] of Object.entries(cdnIndicators)) {
      if (headers[header] && cdnName) {
        return cdnName;
      }
    }

    return null;
  },

  /**
   * Categorize error type for better error handling
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'TIMEOUT';
    }
    if (message.includes('enotfound') || message.includes('dns')) {
      return 'DNS_ERROR';
    }
    if (message.includes('econnrefused') || message.includes('connection refused')) {
      return 'CONNECTION_REFUSED';
    }
    if (message.includes('certificate') || message.includes('ssl')) {
      return 'SSL_ERROR';
    }
    if (message.includes('navigation') || message.includes('net::')) {
      return 'NAVIGATION_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }
};

export default competitorAnalysisService;
