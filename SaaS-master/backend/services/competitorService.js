import competitorAnalysisService from './competitorAnalysisService.js';
import competitorPageSpeedService from './competitorPageSpeedService.js';
import competitorLighthouseService from './competitorLighthouseService.js';
import technicalSEOService from './technicalSEOService.js';
import similarWebTrafficService from './similarWebTrafficService.js';
import contentUpdatesService from './contentUpdatesService.js';
import trafficService from './trafficService.js';
import userAnalyticsService from './userAnalyticsService.js';
import seRankingService from './seRankingService.js';

const competitorService = {
  /**
   * Comprehensive competitor analysis comparing two websites
   * @param {string} yourSite - Your website domain
   * @param {string} competitorSite - Competitor website domain
   * @param {string} email - User email for GA/GSC data
   * @returns {Object} Detailed comparison data
   */
  async compareWebsites(yourSite, competitorSite, email = null) {
    try {
      console.log(`\n🔄 Starting competitor analysis...`);
      console.log(`   Your Site: ${yourSite}`);
      console.log(`   Competitor: ${competitorSite}`);
      console.log(`   Email: ${email || 'Not provided'}\n`);

      // Run analyses SEQUENTIALLY to avoid Chrome instance conflicts
      console.log(`📊 Analyzing YOUR site first: ${yourSite}`);
      const yourAnalysis = await this.analyzeSingleSite(yourSite, email, true);
      
      // Add delay between analyses to ensure Chrome instances are fully closed
      console.log(`⏳ Waiting 3 seconds before analyzing competitor...\n`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log(`📊 Now analyzing COMPETITOR site: ${competitorSite}`);
      const competitorAnalysis = await this.analyzeSingleSite(competitorSite, null, false);

      console.log(`✅ Analysis completed for both sites\n`);

      // Generate comparison insights
      const comparison = this.generateComparison(yourAnalysis, competitorAnalysis);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        yourSite: {
          domain: yourSite,
          ...yourAnalysis
        },
        competitorSite: {
          domain: competitorSite,
          ...competitorAnalysis
        },
        comparison: comparison
      };

    } catch (error) {
      console.error('❌ Competitor analysis failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Analyze a single website using all available tools
   * ⚡ OPTIMIZED: Parallelized non-Chrome services for 2-3x faster analysis
   * @param {string} domain - Website domain to analyze
   * @param {string} email - User email for GA/GSC data (optional)
   * @param {boolean} isUserSite - Whether this is the user's site (affects data source)
   * @returns {Object} Complete analysis data
   */
  async analyzeSingleSite(domain, email = null, isUserSite = false) {
    console.log(`\n⚡ OPTIMIZED ANALYSIS for: ${domain}`);
    const startTime = Date.now();

    try {
      // ========== PHASE 1: Chrome-based analyses (SEQUENTIAL) ==========
      console.log(`\n🔍 PHASE 1: Chrome-based analyses (sequential to avoid conflicts)`);
      
      console.log(`   Step 1/2: Puppeteer analysis...`);
      const puppeteerStart = Date.now();
      const puppeteerResult = await competitorAnalysisService.analyzeWebsite(domain)
        .catch(err => ({ status: 'rejected', reason: err }));
      console.log(`   ✅ Puppeteer done (${Date.now() - puppeteerStart}ms)`);
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay
      
      console.log(`   Step 2/2: Lighthouse audit...`);
      const lighthouseStart = Date.now();
      const maxRetries = 2; // Reduced from 3 for speed
      let lighthouseResult;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          lighthouseResult = await competitorLighthouseService.analyzeSite(domain);
          console.log(`   ✅ Lighthouse done (${Date.now() - lighthouseStart}ms)`);
          break;
        } catch (err) {
          console.error(`   ❌ Attempt ${attempt} failed:`, err.message);
          if (attempt === maxRetries) {
            lighthouseResult = { status: 'rejected', reason: err };
          } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
      }
      
      const phase1Time = Date.now() - startTime;
      console.log(`✅ PHASE 1 complete (${phase1Time}ms)\n`);
      
      // ========== PHASE 2: Non-Chrome analyses (PARALLEL) ==========
      console.log(`⚡ PHASE 2: Running 4 analyses in PARALLEL...`);
      const phase2Start = Date.now();
      
      const [
        pagespeedResult,
        technicalSEOResult,
        trafficResult,
        backlinksResult
      ] = await Promise.allSettled([
        // 1. PageSpeed (API call)
        (async () => {
          console.log(`   📱 PageSpeed starting...`);
          const start = Date.now();
          const result = await competitorPageSpeedService.getPageSpeedData(domain);
          console.log(`   ✅ PageSpeed done (${Date.now() - start}ms)`);
          return result;
        })(),
        
        // 2. Technical SEO (HTTP requests)
        (async () => {
          console.log(`   🔧 Technical SEO starting...`);
          const start = Date.now();
          const result = await technicalSEOService.getTechnicalSEOData(domain);
          console.log(`   ✅ Technical SEO done (${Date.now() - start}ms)`);
          return result;
        })(),
        
        // 3. Traffic data
        (async () => {
          console.log(`   📊 Traffic analysis starting...`);
          const start = Date.now();
          let result;
          
          if (isUserSite && email) {
            try {
              const gaData = await userAnalyticsService.getUserAnalyticsData(email);
              if (gaData && gaData.sessions) {
                const sessionValues = Object.values(gaData.sessions || {});
                const totalSessions = Array.isArray(sessionValues) ? sessionValues.reduce((a, b) => a + (b || 0), 0) : 0;
                const avgDailySessions = Array.isArray(sessionValues) && sessionValues.length > 0 ? totalSessions / sessionValues.length : 0;
                
                result = {
                  success: true,
                  source: 'google_analytics',
                  data: gaData,
                  metrics: {
                    monthlyVisits: Math.round(totalSessions),
                    avgDailyVisits: Math.round(avgDailySessions),
                    bounceRate: gaData.bounceRate || 'N/A',
                    avgSessionDuration: gaData.avgSessionDuration || 'N/A'
                  }
                };
                console.log(`   ✅ Traffic done - GA: ${totalSessions} sessions (${Date.now() - start}ms)`);
              } else {
                result = await similarWebTrafficService.getCompetitorTraffic(domain);
                console.log(`   ✅ Traffic done - SimilarWeb (${Date.now() - start}ms)`);
              }
            } catch (err) {
              result = await similarWebTrafficService.getCompetitorTraffic(domain);
              console.log(`   ✅ Traffic done - SimilarWeb fallback (${Date.now() - start}ms)`);
            }
          } else {
            result = await similarWebTrafficService.getCompetitorTraffic(domain);
            console.log(`   ✅ Traffic done - SimilarWeb (${Date.now() - start}ms)`);
          }
          return result;
        })(),
        
        // 4. SE Ranking Backlinks
        (async () => {
          console.log(`   � SE Ranking backlinks starting...`);
          const start = Date.now();
          const result = await seRankingService.getBacklinksSummary(domain);
          console.log(`   ✅ Backlinks done (${Date.now() - start}ms)`);
          return result;
        })()
      ]);
      
      const phase2Time = Date.now() - phase2Start;
      console.log(`✅ PHASE 2 complete - All parallel tasks done (${phase2Time}ms)\n`);
      
      // ========== PHASE 3: Content monitoring (PARALLEL) ==========
      console.log(`📝 PHASE 3: Content monitoring...`);
      const phase3Start = Date.now();
      
      let contentChangesResult;
      let contentUpdatesResult;
      
      try {
        const changeDetectionService = (await import('./changeDetectionService.js')).default;
        const contentResults = await Promise.allSettled([
          changeDetectionService.analyzeContentChanges(domain),
          contentUpdatesService.getContentUpdates(domain)
        ]);
        contentChangesResult = contentResults[0];
        contentUpdatesResult = contentResults[1];
      } catch (err) {
        contentChangesResult = { status: 'rejected', reason: err };
        contentUpdatesResult = await contentUpdatesService.getContentUpdates(domain)
          .catch(err => ({ status: 'rejected', reason: err }));
      }
      
      const phase3Time = Date.now() - phase3Start;
      console.log(`✅ PHASE 3 complete (${phase3Time}ms)\n`);
      
      const totalTime = Date.now() - startTime;
      console.log(`🎉 TOTAL ANALYSIS TIME: ${(totalTime / 1000).toFixed(1)}s`);
      console.log(`   Phase 1 (Chrome): ${(phase1Time / 1000).toFixed(1)}s`);
      console.log(`   Phase 2 (Parallel): ${(phase2Time / 1000).toFixed(1)}s`);
      console.log(`   Phase 3 (Content): ${(phase3Time / 1000).toFixed(1)}s\n`);

      return {
        // Puppeteer analysis
        puppeteer: puppeteerResult.status !== 'rejected' ? puppeteerResult : {
          success: false,
          error: puppeteerResult.reason?.message || 'Analysis failed'
        },

        // Lighthouse audit
        lighthouse: lighthouseResult.status !== 'rejected' ? lighthouseResult : {
          dataAvailable: false,
          error: lighthouseResult.reason?.message || 'Audit failed'
        },

        // PageSpeed metrics
        pagespeed: pagespeedResult.status === 'fulfilled' ? pagespeedResult.value : {
          dataAvailable: false,
          error: pagespeedResult.reason?.message || 'PageSpeed failed'
        },

        // Technical SEO
        technicalSEO: technicalSEOResult.status === 'fulfilled' ? technicalSEOResult.value : {
          score: 0,
          error: technicalSEOResult.reason?.message || 'Technical SEO failed'
        },

        // Traffic data
        traffic: trafficResult.status === 'fulfilled' ? trafficResult.value : {
          success: false,
          error: trafficResult.reason?.message || 'Traffic data unavailable'
        },

        // SE Ranking Backlinks
        backlinks: backlinksResult.status === 'fulfilled' ? backlinksResult.value : {
          available: false,
          error: backlinksResult.reason?.message || 'Backlinks data unavailable',
          totalBacklinks: 0,
          totalRefDomains: 0
        },

        // Content changes monitoring
        contentChanges: contentChangesResult && contentChangesResult.status === 'fulfilled' && contentChangesResult.value?.success ? contentChangesResult.value : {
          success: false,
          error: contentChangesResult?.reason?.message || 'ChangeDetection unavailable'
        },

        // Content updates
        contentUpdates: contentUpdatesResult && contentUpdatesResult.status === 'fulfilled' ? contentUpdatesResult.value : {
          error: contentUpdatesResult?.reason?.message || 'Content updates unavailable'
        },
        
        // Performance metadata
        _performance: {
          totalTime: totalTime,
          phase1Time: phase1Time,
          phase2Time: phase2Time,
          phase3Time: phase3Time
        }
      };

    } catch (error) {
      console.error(`❌ Error analyzing ${domain}:`, error.message);
      throw error;
    }
  },

  /**
   * Generate comparison insights between two sites
   */
  generateComparison(yourData, competitorData) {
    const comparison = {
      performance: this.comparePerformance(yourData, competitorData),
      seo: this.compareSEO(yourData, competitorData),
      content: this.compareContent(yourData, competitorData),
      technology: this.compareTechnology(yourData, competitorData),
      security: this.compareSecurity(yourData, competitorData),
      traffic: this.compareTraffic(yourData, competitorData),
      backlinks: this.compareBacklinks(yourData, competitorData), // NEW
      contentUpdates: this.compareContentUpdates(yourData, competitorData)
    };

    // Calculate overall winner and gaps
    comparison.summary = this.generateSummary(comparison);

    return comparison;
  },

  /**
   * Compare performance metrics
   */
  comparePerformance(yourData, competitorData) {
    const yourLighthouse = yourData.lighthouse;
    const compLighthouse = competitorData.lighthouse;
    const yourPagespeed = yourData.pagespeed;
    const compPagespeed = competitorData.pagespeed;

    const comparison = {
      lighthouse: {
        your: {
          performance: yourLighthouse?.categories?.performance?.score || 0,
          accessibility: yourLighthouse?.categories?.accessibility?.score || 0,
          bestPractices: yourLighthouse?.categories?.['best-practices']?.score || 0,
          seo: yourLighthouse?.categories?.seo?.score || 0
        },
        competitor: {
          performance: compLighthouse?.categories?.performance?.score || 0,
          accessibility: compLighthouse?.categories?.accessibility?.score || 0,
          bestPractices: compLighthouse?.categories?.['best-practices']?.score || 0,
          seo: compLighthouse?.categories?.seo?.score || 0
        }
      },
      pagespeed: {
        your: {
          desktop: yourPagespeed?.desktop?.performanceScore || 0,
          mobile: yourPagespeed?.mobile?.performanceScore || 0
        },
        competitor: {
          desktop: compPagespeed?.desktop?.performanceScore || 0,
          mobile: compPagespeed?.mobile?.performanceScore || 0
        }
      }
    };

    // Determine winner
    const yourAvg = (comparison.lighthouse.your.performance + 
                     comparison.pagespeed.your.desktop + 
                     comparison.pagespeed.your.mobile) / 3;
    const compAvg = (comparison.lighthouse.competitor.performance + 
                     comparison.pagespeed.competitor.desktop + 
                     comparison.pagespeed.competitor.mobile) / 3;

    comparison.winner = yourAvg > compAvg ? 'yours' : 'competitor';
    comparison.gap = Math.abs(yourAvg - compAvg).toFixed(1);

    return comparison;
  },

  /**
   * Compare SEO elements
   */
  compareSEO(yourData, competitorData) {
    const yourSEO = yourData.puppeteer?.seo || {};
    const compSEO = competitorData.puppeteer?.seo || {};

    const comparison = {
      metaTags: {
        your: {
          hasTitle: !!yourSEO.title,
          hasDescription: !!yourSEO.metaDescription,
          hasCanonical: !!yourSEO.canonical,
          titleLength: yourSEO.title?.length || 0,
          descriptionLength: yourSEO.metaDescription?.length || 0
        },
        competitor: {
          hasTitle: !!compSEO.title,
          hasDescription: !!compSEO.metaDescription,
          hasCanonical: !!compSEO.canonical,
          titleLength: compSEO.title?.length || 0,
          descriptionLength: compSEO.metaDescription?.length || 0
        }
      },
      headings: {
        your: yourSEO.headings || { h1Count: 0, h2Count: 0, h3Count: 0 },
        competitor: compSEO.headings || { h1Count: 0, h2Count: 0, h3Count: 0 }
      },
      socialMedia: {
        your: {
          hasOpenGraph: !!(yourSEO.openGraph?.title || yourSEO.openGraph?.description),
          hasTwitterCard: !!(yourSEO.twitterCard?.card)
        },
        competitor: {
          hasOpenGraph: !!(compSEO.openGraph?.title || compSEO.openGraph?.description),
          hasTwitterCard: !!(compSEO.twitterCard?.card)
        }
      },
      structuredData: {
        your: yourSEO.schemaMarkup?.length || 0,
        competitor: compSEO.schemaMarkup?.length || 0
      }
    };

    // Calculate SEO score
    const yourScore = this.calculateSEOScore(comparison.metaTags.your, comparison.headings.your, comparison.socialMedia.your, comparison.structuredData.your);
    const compScore = this.calculateSEOScore(comparison.metaTags.competitor, comparison.headings.competitor, comparison.socialMedia.competitor, comparison.structuredData.competitor);

    comparison.scores = { your: yourScore, competitor: compScore };
    comparison.winner = yourScore > compScore ? 'yours' : 'competitor';

    return comparison;
  },

  /**
   * Calculate SEO score
   */
  calculateSEOScore(meta, headings, social, structuredData) {
    let score = 0;
    
    // Meta tags (40 points)
    if (meta.hasTitle) score += 10;
    if (meta.hasDescription) score += 10;
    if (meta.hasCanonical) score += 10;
    if (meta.titleLength >= 30 && meta.titleLength <= 60) score += 5;
    if (meta.descriptionLength >= 120 && meta.descriptionLength <= 160) score += 5;
    
    // Headings (20 points)
    if (headings.h1Count === 1) score += 10; // Exactly one H1
    if (headings.h2Count > 0) score += 5;
    if (headings.h3Count > 0) score += 5;
    
    // Social media (20 points)
    if (social.hasOpenGraph) score += 10;
    if (social.hasTwitterCard) score += 10;
    
    // Structured data (20 points)
    if (structuredData > 0) score += 20;
    
    return score;
  },

  /**
   * Compare content metrics
   */
  compareContent(yourData, competitorData) {
    const yourContent = yourData.puppeteer?.content || {};
    const compContent = competitorData.puppeteer?.content || {};

    return {
      your: {
        wordCount: yourContent.wordCount || 0,
        paragraphCount: yourContent.paragraphCount || 0,
        imageCount: yourContent.images?.total || 0,
        imageAltCoverage: yourContent.images?.altCoverage || 0,
        totalLinks: yourContent.links?.total || 0,
        internalLinks: yourContent.links?.internal || 0,
        externalLinks: yourContent.links?.external || 0,
        brokenLinks: yourContent.links?.broken || 0
      },
      competitor: {
        wordCount: compContent.wordCount || 0,
        paragraphCount: compContent.paragraphCount || 0,
        imageCount: compContent.images?.total || 0,
        imageAltCoverage: compContent.images?.altCoverage || 0,
        totalLinks: compContent.links?.total || 0,
        internalLinks: compContent.links?.internal || 0,
        externalLinks: compContent.links?.external || 0,
        brokenLinks: compContent.links?.broken || 0
      },
      winner: (yourContent.wordCount || 0) > (compContent.wordCount || 0) ? 'yours' : 'competitor'
    };
  },

  /**
   * Compare technology stacks
   */
  compareTechnology(yourData, competitorData) {
    const yourTech = yourData.puppeteer?.technology || {};
    const compTech = competitorData.puppeteer?.technology || {};

    return {
      your: {
        cms: yourTech.cms || 'Unknown',
        frameworks: yourTech.frameworks || [],
        analytics: yourTech.analytics || [],
        thirdPartyScripts: yourTech.thirdPartyScripts?.length || 0
      },
      competitor: {
        cms: compTech.cms || 'Unknown',
        frameworks: compTech.frameworks || [],
        analytics: compTech.analytics || [],
        thirdPartyScripts: compTech.thirdPartyScripts?.length || 0
      }
    };
  },

  /**
   * Compare security & technical aspects
   */
  compareSecurity(yourData, competitorData) {
    console.log('🔍 compareSecurity - yourData.puppeteer keys:', yourData.puppeteer ? Object.keys(yourData.puppeteer) : 'undefined');
    console.log('🔍 compareSecurity - yourData.puppeteer?.robotsTxt:', yourData.puppeteer?.robotsTxt);
    console.log('🔍 compareSecurity - yourData.puppeteer?.sitemap:', yourData.puppeteer?.sitemap);
    console.log('🔍 compareSecurity - competitorData.puppeteer keys:', competitorData.puppeteer ? Object.keys(competitorData.puppeteer) : 'undefined');
    
    const yourSecurity = yourData.puppeteer?.security || {};
    const compSecurity = competitorData.puppeteer?.security || {};

    const result = {
      your: {
        isHTTPS: yourSecurity.isHTTPS || false,
        hasCDN: !!yourSecurity.cdn,
        cdnProvider: yourSecurity.cdn || null,
        hasMixedContent: yourSecurity.mixedContent || false,
        hasRobotsTxt: yourData.puppeteer?.robotsTxt?.exists || false,
        hasSitemap: yourData.puppeteer?.sitemap?.exists || false,
        sitemapUrls: yourData.puppeteer?.sitemap?.urlCount || 0
      },
      competitor: {
        isHTTPS: compSecurity.isHTTPS || false,
        hasCDN: !!compSecurity.cdn,
        cdnProvider: compSecurity.cdn || null,
        hasMixedContent: compSecurity.mixedContent || false,
        hasRobotsTxt: competitorData.puppeteer?.robotsTxt?.exists || false,
        hasSitemap: competitorData.puppeteer?.sitemap?.exists || false,
        sitemapUrls: competitorData.puppeteer?.sitemap?.urlCount || 0
      }
    };
    
    console.log('🔍 compareSecurity result:', JSON.stringify(result, null, 2));
    return result;
  },

  /**
   * Compare traffic metrics (NEW)
   */
  compareTraffic(yourData, competitorData) {
    const yourTraffic = yourData.traffic || {};
    const compTraffic = competitorData.traffic || {};

    const comparison = {
      available: yourTraffic.success && compTraffic.success,
      your: {
        source: yourTraffic.source || 'unknown',
        monthlyVisits: yourTraffic.metrics?.monthlyVisits || 'N/A',
        avgVisitDuration: yourTraffic.metrics?.avgVisitDuration || 'N/A',
        pagesPerVisit: yourTraffic.metrics?.pagesPerVisit || 'N/A',
        bounceRate: yourTraffic.metrics?.bounceRate || 'N/A',
        trafficSources: yourTraffic.metrics?.trafficSources || {},
        globalRank: yourTraffic.metrics?.globalRank || 'N/A'
      },
      competitor: {
        source: compTraffic.source || 'unknown',
        monthlyVisits: compTraffic.metrics?.monthlyVisits || 'N/A',
        avgVisitDuration: compTraffic.metrics?.avgVisitDuration || 'N/A',
        pagesPerVisit: compTraffic.metrics?.pagesPerVisit || 'N/A',
        bounceRate: compTraffic.metrics?.bounceRate || 'N/A',
        trafficSources: compTraffic.metrics?.trafficSources || {},
        globalRank: compTraffic.metrics?.globalRank || 'N/A'
      },
      insights: {
        trafficWinner: null,
        engagementWinner: null,
        trafficGap: 0,
        recommendations: []
      }
    };

    if (comparison.available) {
      // Determine traffic winner
      const yourVisits = typeof yourTraffic.metrics?.monthlyVisits === 'number' 
        ? yourTraffic.metrics.monthlyVisits : 0;
      const compVisits = typeof compTraffic.metrics?.monthlyVisits === 'number' 
        ? compTraffic.metrics.monthlyVisits : 0;

      if (yourVisits > compVisits) {
        comparison.insights.trafficWinner = 'yours';
        comparison.insights.trafficGap = yourVisits - compVisits;
      } else {
        comparison.insights.trafficWinner = 'competitor';
        comparison.insights.trafficGap = compVisits - yourVisits;
      }

      // Determine engagement winner
      const yourBounce = typeof yourTraffic.metrics?.bounceRate === 'number' 
        ? yourTraffic.metrics.bounceRate : 100;
      const compBounce = typeof compTraffic.metrics?.bounceRate === 'number' 
        ? compTraffic.metrics.bounceRate : 100;
      const yourPages = typeof yourTraffic.metrics?.pagesPerVisit === 'number' 
        ? yourTraffic.metrics.pagesPerVisit : 0;
      const compPages = typeof compTraffic.metrics?.pagesPerVisit === 'number' 
        ? compTraffic.metrics.pagesPerVisit : 0;

      let yourEngagementScore = 0;
      let compEngagementScore = 0;

      // Lower bounce rate is better
      if (yourBounce < compBounce) yourEngagementScore++;
      else compEngagementScore++;

      // Higher pages per visit is better
      if (yourPages > compPages) yourEngagementScore++;
      else compEngagementScore++;

      comparison.insights.engagementWinner = yourEngagementScore > compEngagementScore 
        ? 'yours' : 'competitor';

      // Generate recommendations
      if (comparison.insights.trafficWinner === 'competitor') {
        comparison.insights.recommendations.push(
          `Competitor has ${((compVisits / yourVisits - 1) * 100).toFixed(0)}% more traffic. Focus on SEO and content marketing.`
        );
      }

      if (comparison.insights.engagementWinner === 'competitor') {
        comparison.insights.recommendations.push(
          'Improve user engagement by enhancing content quality and site navigation.'
        );
      }

      if (compBounce < yourBounce) {
        comparison.insights.recommendations.push(
          `Reduce bounce rate from ${yourBounce.toFixed(1)}% to match competitor's ${compBounce.toFixed(1)}%.`
        );
      }
    }

    return comparison;
  },

  /**
   * Compare backlinks data (SE Ranking)
   */
  compareBacklinks(yourData, competitorData) {
    const yourBacklinks = yourData.backlinks || {};
    const compBacklinks = competitorData.backlinks || {};

    const comparison = {
      available: yourBacklinks.available && compBacklinks.available,
      your: {
        totalBacklinks: yourBacklinks.totalBacklinks || 0,
        totalRefDomains: yourBacklinks.totalRefDomains || 0,
        source: yourBacklinks.source || 'SE Ranking'
      },
      competitor: {
        totalBacklinks: compBacklinks.totalBacklinks || 0,
        totalRefDomains: compBacklinks.totalRefDomains || 0,
        source: compBacklinks.source || 'SE Ranking'
      },
      winner: null,
      difference: 0
    };

    if (comparison.available) {
      const yourTotal = comparison.your.totalBacklinks;
      const compTotal = comparison.competitor.totalBacklinks;
      
      if (yourTotal > compTotal) {
        comparison.winner = 'yours';
        comparison.difference = yourTotal - compTotal;
      } else if (compTotal > yourTotal) {
        comparison.winner = 'competitor';
        comparison.difference = compTotal - yourTotal;
      } else {
        comparison.winner = 'tie';
        comparison.difference = 0;
      }
    }

    return comparison;
  },

  /**
   * Compare content update activity (NEW)
   */
  compareContentUpdates(yourData, competitorData) {
    const yourContent = yourData.contentUpdates || {};
    const compContent = competitorData.contentUpdates || {};

    const comparison = {
      your: {
        hasRSS: yourContent.rss?.found || false,
        hasSitemap: yourContent.sitemap?.found || false,
        recentPosts: yourContent.rss?.recentPosts?.length || 0,
        totalPosts: yourContent.rss?.totalPosts || 0,
        lastUpdated: yourContent.contentActivity?.lastContentDate || 'Unknown',
        updateFrequency: yourContent.contentActivity?.updateFrequency || 'unknown',
        averagePostsPerMonth: yourContent.contentActivity?.averagePostsPerMonth || 0,
        isActive: yourContent.contentActivity?.isActive || false,
        contentVelocity: yourContent.contentActivity?.contentVelocity || 'unknown',
        recentActivityCount: yourContent.contentActivity?.recentActivityCount || 0
      },
      competitor: {
        hasRSS: compContent.rss?.found || false,
        hasSitemap: compContent.sitemap?.found || false,
        recentPosts: compContent.rss?.recentPosts?.length || 0,
        totalPosts: compContent.rss?.totalPosts || 0,
        lastUpdated: compContent.contentActivity?.lastContentDate || 'Unknown',
        updateFrequency: compContent.contentActivity?.updateFrequency || 'unknown',
        averagePostsPerMonth: compContent.contentActivity?.averagePostsPerMonth || 0,
        isActive: compContent.contentActivity?.isActive || false,
        contentVelocity: compContent.contentActivity?.contentVelocity || 'unknown',
        recentActivityCount: compContent.contentActivity?.recentActivityCount || 0
      },
      insights: {
        moreActive: null,
        contentGap: 0,
        velocityComparison: null,
        recommendations: []
      }
    };

    // Determine who is more active
    if (comparison.your.recentActivityCount > comparison.competitor.recentActivityCount) {
      comparison.insights.moreActive = 'yours';
    } else if (comparison.competitor.recentActivityCount > comparison.your.recentActivityCount) {
      comparison.insights.moreActive = 'competitor';
    } else {
      comparison.insights.moreActive = 'equal';
    }

    // Calculate content gap
    comparison.insights.contentGap = 
      comparison.competitor.averagePostsPerMonth - comparison.your.averagePostsPerMonth;

    // Velocity comparison
    const velocityScore = { 'high': 4, 'medium': 3, 'low': 2, 'minimal': 1, 'unknown': 0 };
    const yourScore = velocityScore[comparison.your.contentVelocity] || 0;
    const compScore = velocityScore[comparison.competitor.contentVelocity] || 0;
    
    if (compScore > yourScore) {
      comparison.insights.velocityComparison = 'competitor_faster';
    } else if (yourScore > compScore) {
      comparison.insights.velocityComparison = 'yours_faster';
    } else {
      comparison.insights.velocityComparison = 'equal';
    }

    // Generate recommendations
    if (comparison.insights.moreActive === 'competitor') {
      comparison.insights.recommendations.push(
        `Competitor publishes ${comparison.competitor.averagePostsPerMonth} posts/month vs your ${comparison.your.averagePostsPerMonth}. Increase content production.`
      );
    }

    if (!comparison.your.hasRSS && comparison.competitor.hasRSS) {
      comparison.insights.recommendations.push(
        'Add an RSS feed to help users and search engines discover new content.'
      );
    }

    if (!comparison.your.isActive && comparison.competitor.isActive) {
      comparison.insights.recommendations.push(
        'Your content is stale. Publish fresh content regularly to stay competitive.'
      );
    }

    if (comparison.insights.contentGap > 5) {
      comparison.insights.recommendations.push(
        `Significant content gap: Aim to publish at least ${Math.ceil(comparison.competitor.averagePostsPerMonth)} posts per month.`
      );
    }

    return comparison;
  },

  /**
   * Generate summary and recommendations
   */
  generateSummary(comparison) {
    const summary = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      recommendations: []
    };

    // Performance analysis
    if (comparison.performance.winner === 'yours') {
      summary.strengths.push('Better overall performance scores');
    } else {
      summary.weaknesses.push('Lower performance scores than competitor');
      summary.recommendations.push('Optimize images, reduce JavaScript, and improve server response times');
    }

    // SEO analysis
    if (comparison.seo.winner === 'yours') {
      summary.strengths.push('Better SEO optimization');
    } else {
      summary.weaknesses.push('SEO implementation needs improvement');
      summary.recommendations.push('Improve meta tags, add structured data, and optimize heading structure');
    }

    // Content analysis
    if (comparison.content.winner === 'yours') {
      summary.strengths.push('More comprehensive content');
    } else {
      summary.opportunities.push('Create more in-depth content to match competitor');
    }

    // Traffic analysis (NEW)
    if (comparison.traffic?.available) {
      if (comparison.traffic.insights.trafficWinner === 'yours') {
        summary.strengths.push('Higher website traffic than competitor');
      } else {
        summary.weaknesses.push('Lower website traffic than competitor');
        summary.recommendations.push(...comparison.traffic.insights.recommendations);
      }
    }

    // Content updates analysis (NEW)
    if (comparison.contentUpdates?.insights.moreActive === 'competitor') {
      summary.weaknesses.push('Less frequent content updates than competitor');
      summary.recommendations.push(...comparison.contentUpdates.insights.recommendations);
    } else if (comparison.contentUpdates?.insights.moreActive === 'yours') {
      summary.strengths.push('More active content publishing than competitor');
    }

    // Security
    if (!comparison.security.your.isHTTPS) {
      summary.weaknesses.push('Not using HTTPS');
      summary.recommendations.push('Implement SSL certificate for security');
    }

    if (!comparison.security.your.hasCDN && comparison.security.competitor.hasCDN) {
      summary.opportunities.push('Implement CDN for better performance');
    }

    return summary;
  }
};

export default competitorService;
