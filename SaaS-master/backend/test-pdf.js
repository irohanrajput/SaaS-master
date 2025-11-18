import pdfReportService from './services/pdfReportService.js';
import fs from 'fs';

/**
 * Test PDF generation
 */
async function testPDFGeneration() {
  console.log('🧪 Testing PDF Generation');
  console.log('========================');

  const mockData = {
    yourSite: {
      domain: 'agenticforge.tech',
      puppeteer: {
        technology: {
          cms: null,
          frameworks: ['React'],
          analytics: ['Google Analytics'],
          thirdPartyScripts: ['example.com']
        }
      }
    },
    competitorSite: {
      domain: 'pes.edu',
      puppeteer: {
        technology: {
          cms: 'WordPress',
          frameworks: ['jQuery'],
          analytics: ['Google Analytics', 'Google Tag Manager'],
          thirdPartyScripts: ['googletagmanager.com']
        }
      }
    },
    comparison: {
      performance: { yours: 85, competitor: 75, winner: 'yours', difference: 10 },
      seo: { yours: 100, competitor: 79, winner: 'yours', difference: 21 },
      traffic: { 
        your: { monthlyVisits: 1000 },
        competitor: { monthlyVisits: 5000 },
        winner: 'competitor'
      },
      backlinks: { yours: 150, competitor: 300, winner: 'competitor' }
    }
  };

  try {
    console.log('📄 Generating PDF...');
    const pdfBuffer = await pdfReportService.generateCompetitorReport(mockData);
    
    console.log('✅ PDF generated successfully!');
    console.log('📊 Buffer size:', pdfBuffer.length, 'bytes');
    
    // Save to file for testing
    fs.writeFileSync('test-report.pdf', pdfBuffer);
    console.log('💾 Test PDF saved as test-report.pdf');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPDFGeneration();