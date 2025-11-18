import geminiService from './services/geminiService.js';

console.log('🧪 Testing Gemini Service...\n');

// Test data
const mockYourSite = {
  domain: 'example.com',
  lighthouse: {
    categories: {
      performance: { displayValue: 75 },
      seo: { displayValue: 90 },
      accessibility: { displayValue: 85 },
      'best-practices': { displayValue: 80 }
    }
  },
  pagespeed: {
    desktop: { performanceScore: 78 },
    mobile: { performanceScore: 65 }
  },
  puppeteer: {
    content: {
      wordCount: 1200,
      images: { total: 15, altCoverage: 90 },
      links: { total: 45, internal: 30, external: 15 }
    },
    seo: {
      headings: { h1Count: 1, h2Count: 5 },
      metaDescription: 'A good meta description'
    }
  },
  backlinks: {
    totalBacklinks: 250,
    totalRefDomains: 50
  }
};

const mockCompetitorSite = {
  domain: 'competitor.com',
  lighthouse: {
    categories: {
      performance: { displayValue: 85 },
      seo: { displayValue: 80 },
      accessibility: { displayValue: 90 },
      'best-practices': { displayValue: 85 }
    }
  },
  pagespeed: {
    desktop: { performanceScore: 88 },
    mobile: { performanceScore: 75 }
  },
  puppeteer: {
    content: {
      wordCount: 1800,
      images: { total: 20, altCoverage: 95 },
      links: { total: 60, internal: 45, external: 15 }
    },
    seo: {
      headings: { h1Count: 1, h2Count: 8 },
      metaDescription: 'Competitor meta description'
    }
  },
  backlinks: {
    totalBacklinks: 500,
    totalRefDomains: 120
  }
};

const mockComparison = {
  performance: { winner: 'competitor', gap: -10 },
  seo: { winner: 'yours', gap: 10 },
  backlinks: { winner: 'competitor', gap: -250 },
  content: { winner: 'competitor', gap: -600 }
};

async function testGeminiService() {
  try {
    console.log('📊 Calling Gemini API...');
    
    const recommendations = await geminiService.generateRecommendations(
      mockYourSite,
      mockCompetitorSite,
      mockComparison
    );
    
    console.log('\n✅ SUCCESS! Generated recommendations:\n');
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title}`);
      console.log(`   Impact: ${rec.impact} | Effort: ${rec.effort}`);
      console.log(`   ${rec.description}`);
      console.log(`   Steps:`);
      rec.steps.forEach((step, i) => {
        console.log(`      ${i + 1}. ${step}`);
      });
      console.log('');
    });
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testGeminiService();
