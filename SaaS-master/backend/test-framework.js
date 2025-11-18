import puppeteer from 'puppeteer';

/**
 * Test script to check technology detection response structure
 */
async function testTechnologyDetection() {
  const url = 'https://agenticforge.tech/';
  let browser;

  try {
    console.log(`🚀 Testing technology detection for: ${url}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Navigate to page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Extract technology stack
    const techData = await page.evaluate(() => {
      const technology = {
        cms: null,
        frameworks: [],
        analytics: [],
        thirdPartyScripts: []
      };

      // CMS Detection
      if (document.querySelector('meta[name="generator"][content*="WordPress"]') || window.wp) {
        technology.cms = 'WordPress';
      } else if (window.Shopify) {
        technology.cms = 'Shopify';
      } else if (window.wixBiSession) {
        technology.cms = 'Wix';
      } else if (window.Webflow) {
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
      if (window.jQuery || window.$) {
        technology.frameworks.push('jQuery');
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
      if (window.mixpanel) {
        technology.analytics.push('Mixpanel');
      }
      if (document.querySelector('script[src*="googletagmanager"]')) {
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
        .filter((domain, index, self) => self.indexOf(domain) === index);

      return technology;
    });

    console.log('\n📊 Technology Stack Detection Results:\n');
    console.log(JSON.stringify(techData, null, 2));

    return {
      success: true,
      url: url,
      technology: techData
    };

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🔴 Browser closed');
    }
  }
}

// Run the test
testTechnologyDetection();
