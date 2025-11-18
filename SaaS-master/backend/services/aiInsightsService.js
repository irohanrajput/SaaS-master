import geminiService from './geminiService.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * AI Insights Service
 * Generates actionable business recommendations using Gemini AI
 * Analyzes metrics from: SEO, Competitor Intelligence, Social Media, Traffic
 */
class AIInsightsService {
  /**
   * Generate AI insights for a user
   * @param {string} userEmail - User's email
   * @returns {Promise<Object>} AI-generated insights
   */
  async generateInsights(userEmail) {
    try {
      console.log(`🤖 Generating AI insights for: ${userEmail}`);

      // Gather metrics from all features
      const metricsData = await this.gatherAllMetrics(userEmail);

      // Create comprehensive prompt for Gemini
      const prompt = this.buildInsightsPrompt(metricsData);

      // Get AI recommendations from Gemini
      const aiResponse = await geminiService.generateContent(prompt);

      // Parse and structure the response
      const insights = this.parseAIResponse(aiResponse);

      // Save insights to database
      await this.saveInsights(userEmail, insights, metricsData);

      console.log(`✅ Generated ${insights.recommendations.length} AI insights`);

      return {
        success: true,
        insights,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error generating AI insights:', error);
      throw error;
    }
  }

  /**
   * Gather metrics from all features
   */
  async gatherAllMetrics(userEmail) {
    try {
      const metrics = {
        seo: await this.getSEOMetrics(userEmail),
        social: await this.getSocialMetrics(userEmail),
        competitor: await this.getCompetitorMetrics(userEmail),
        traffic: await this.getTrafficMetrics(userEmail)
      };

      return metrics;
    } catch (error) {
      console.error('Error gathering metrics:', error);
      return {
        seo: null,
        social: null,
        competitor: null,
        traffic: null
      };
    }
  }

  /**
   * Get SEO metrics
   */
  async getSEOMetrics(userEmail) {
    try {
      // Fetch from Search Console data or lighthouse cache
      const { data } = await supabase
        .from('lighthouse_cache')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!data) return null;

      return {
        performanceScore: data.lighthouse_data?.performance || 0,
        seoScore: data.lighthouse_data?.seo || 0,
        accessibilityScore: data.lighthouse_data?.accessibility || 0,
        bestPracticesScore: data.lighthouse_data?.bestPractices || 0,
        issues: data.lighthouse_data?.issues || []
      };
    } catch (error) {
      console.warn('No SEO data available');
      return null;
    }
  }

  /**
   * Get Social Media metrics
   */
  async getSocialMetrics(userEmail) {
    try {
      const { data } = await supabase
        .from('social_media_fetch_log')
        .select('*')
        .eq('user_email', userEmail)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) return null;

      const platforms = ['facebook', 'instagram', 'linkedin'];
      const metrics = {};

      for (const platform of platforms) {
        const platformData = data && Array.isArray(data) ? data.filter(d => d.platform === platform) : [];
        if (platformData.length > 0) {
          metrics[platform] = {
            totalPosts: platformData.reduce((sum, d) => sum + (d.records_fetched || 0), 0),
            avgEngagement: 0, // Calculate from actual data
            successRate: (platformData.filter(d => d.status === 'success').length / platformData.length * 100).toFixed(1)
          };
        }
      }

      return {
        platforms: Object.keys(metrics),
        platformMetrics: metrics,
        overallActivity: data.length
      };
    } catch (error) {
      console.warn('No social media data available');
      return null;
    }
  }

  /**
   * Get Competitor metrics
   */
  async getCompetitorMetrics(userEmail) {
    try {
      const { data } = await supabase
        .from('competitor_cache')
        .select('*')
        .eq('user_email', userEmail)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (!data || data.length === 0) return null;

      return {
        totalAnalyses: data && Array.isArray(data) ? data.length : 0,
        competitors: data && Array.isArray(data) ? data.map(d => d.competitor_domain).filter(Boolean) : [],
        latestAnalysis: data && Array.isArray(data) && data.length > 0 ? data[0].updated_at : null,
        avgCacheAge: this.calculateAvgAge(data)
      };
    } catch (error) {
      console.warn('No competitor data available');
      return null;
    }
  }

  /**
   * Get Traffic metrics
   */
  async getTrafficMetrics(userEmail) {
    try {
      // This would come from Google Analytics or Search Console
      // For now, return placeholder
      return {
        monthlyVisits: 0,
        bounceRate: 0,
        avgSessionDuration: 0
      };
    } catch (error) {
      console.warn('No traffic data available');
      return null;
    }
  }

  /**
   * Build comprehensive prompt for Gemini AI
   */
  buildInsightsPrompt(metricsData) {
    const { seo, social, competitor, traffic } = metricsData;

    let prompt = `You are a business growth consultant analyzing a company's digital presence. Based on the following metrics, provide 3-4 specific, actionable recommendations to improve their business performance.\n\n`;

    prompt += `**METRICS AVAILABLE:**\n\n`;

    if (seo) {
      prompt += `**SEO Performance:**\n`;
      prompt += `- Performance Score: ${seo.performanceScore}/100\n`;
      prompt += `- SEO Score: ${seo.seoScore}/100\n`;
      prompt += `- Accessibility Score: ${seo.accessibilityScore}/100\n`;
      prompt += `- Best Practices Score: ${seo.bestPracticesScore}/100\n\n`;
    }

    if (social && social.platforms.length > 0) {
      prompt += `**Social Media:**\n`;
      prompt += `- Active Platforms: ${social.platforms.join(', ')}\n`;
      prompt += `- Total Activity: ${social.overallActivity} interactions in last 30 days\n`;
      for (const [platform, metrics] of Object.entries(social.platformMetrics)) {
        prompt += `- ${platform}: ${metrics.totalPosts} posts, ${metrics.successRate}% success rate\n`;
      }
      prompt += `\n`;
    }

    if (competitor) {
      prompt += `**Competitor Analysis:**\n`;
      prompt += `- Total Analyses: ${competitor.totalAnalyses}\n`;
      prompt += `- Tracking Competitors: ${competitor.competitors.join(', ')}\n\n`;
    }

    if (traffic) {
      prompt += `**Traffic:**\n`;
      prompt += `- Monthly Visits: ${traffic.monthlyVisits}\n`;
      prompt += `- Bounce Rate: ${traffic.bounceRate}%\n\n`;
    }

    prompt += `\n**INSTRUCTIONS:**\n`;
    prompt += `Provide exactly 3-4 recommendations in the following JSON format (no markdown, just raw JSON):\n`;
    prompt += `{\n`;
    prompt += `  "recommendations": [\n`;
    prompt += `    {\n`;
    prompt += `      "title": "Brief title (max 60 chars)",\n`;
    prompt += `      "description": "Detailed explanation (2-3 sentences)",\n`;
    prompt += `      "priority": "high" | "medium" | "low",\n`;
    prompt += `      "category": "SEO" | "Social Media" | "Competitor" | "Traffic" | "Overall",\n`;
    prompt += `      "impact": "Brief expected impact (1 sentence)",\n`;
    prompt += `      "actionSteps": ["Step 1", "Step 2", "Step 3"]\n`;
    prompt += `    }\n`;
    prompt += `  ],\n`;
    prompt += `  "overallScore": 0-100,\n`;
    prompt += `  "summary": "One sentence overall assessment"\n`;
    prompt += `}\n\n`;
    prompt += `Focus on: 1) Quick wins, 2) High-impact improvements, 3) Specific actionable steps, 4) Data-driven suggestions.`;

    return prompt;
  }

  /**
   * Parse AI response into structured insights
   */
  parseAIResponse(aiResponse) {
    try {
      // Extract JSON from response (Gemini sometimes adds markdown)
      let jsonText = aiResponse;
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Parse JSON
      const parsed = JSON.parse(jsonText);

      // Validate structure
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid recommendations structure');
      }

      return {
        recommendations: parsed.recommendations.slice(0, 4), // Max 4 recommendations
        overallScore: parsed.overallScore || 0,
        summary: parsed.summary || 'Analysis complete'
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback to default recommendations
      return {
        recommendations: [
          {
            title: "Improve SEO Performance",
            description: "Your site's SEO score can be improved. Focus on meta tags, content optimization, and technical SEO.",
            priority: "high",
            category: "SEO",
            impact: "Better search rankings and organic traffic",
            actionSteps: [
              "Audit meta descriptions and title tags",
              "Improve page load speed",
              "Add schema markup"
            ]
          },
          {
            title: "Increase Social Media Engagement",
            description: "Post more consistently and engage with your audience to build stronger connections.",
            priority: "medium",
            category: "Social Media",
            impact: "Higher engagement rates and brand awareness",
            actionSteps: [
              "Create content calendar",
              "Respond to comments within 24 hours",
              "Use analytics to optimize posting times"
            ]
          },
          {
            title: "Monitor Competitor Strategies",
            description: "Regular competitor analysis helps identify market opportunities and stay competitive.",
            priority: "medium",
            category: "Competitor",
            impact: "Better strategic positioning",
            actionSteps: [
              "Set up weekly competitor checks",
              "Analyze their top-performing content",
              "Identify gaps in their strategy"
            ]
          }
        ],
        overallScore: 65,
        summary: "Good foundation with room for improvement in SEO and social media"
      };
    }
  }

  /**
   * Save insights to database
   */
  async saveInsights(userEmail, insights, metricsData) {
    try {
      const { data: userData } = await supabase
        .from('users_table')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (!userData) return;

      await supabase
        .from('ai_insights')
        .insert({
          user_id: userData.id,
          user_email: userEmail,
          insights: insights,
          metrics_snapshot: metricsData,
          created_at: new Date().toISOString()
        });

      console.log('✅ AI insights saved to database');
    } catch (error) {
      console.error('Error saving insights:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Get latest insights for user
   */
  async getLatestInsights(userEmail) {
    try {
      const { data } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      return null;
    }
  }

  // Helper methods
  calculateAvgAge(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    const totalAge = data.reduce((sum, item) => {
      const age = (new Date() - new Date(item.updated_at)) / (1000 * 60 * 60);
      return sum + (isNaN(age) ? 0 : age);
    }, 0);
    return (totalAge / data.length).toFixed(1);
  }
}

export default new AIInsightsService();
