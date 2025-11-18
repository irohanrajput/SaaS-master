'use client';

import React, { useState, useRef } from 'react';
import CategoryDonutChart from '@/components/charts/CategoryDonutChart';
import CoreWebVitalsDisplay from '@/components/charts/CoreWebVitalsDisplay';
import PerformanceTimeline from '@/components/charts/PerformanceTimeline';
import ResourceBreakdown from '@/components/charts/ResourceBreakdown';

export default function AnalyzePage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || loading) return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setSeoData(null);

    try {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      console.log('🔍 Fetching analysis for:', cleanDomain);
      
      const response = await fetch(
        `http://localhost:3010/api/lighthouse/${cleanDomain}`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch analysis data');
      }
      
      const data = await response.json();
      console.log('✅ Analysis received');
      
      setSeoData(data);
      setLoading(false);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      }
      
      console.error('❌ Analysis error:', err);
      setError(err.message || 'Failed to load SEO analysis data');
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setDomain('');
    setSeoData(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-2">
            Website SEO Analyzer
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 px-4">
            Get comprehensive SEO insights and performance metrics
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-4 sm:p-5 md:p-6">
            <div className="mb-4">
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Website URL
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={loading || !domain}
                className={`flex-1 bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-blue-700 transition text-sm sm:text-base ${
                  loading || !domain ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Website'
                )}
              </button>
              
              {(seoData || loading) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="sm:w-auto w-full px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                >
                  {loading ? 'Cancel' : 'New Analysis'}
                </button>
              )}
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm sm:text-base break-words">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {seoData && (
          <div className="space-y-4 sm:space-y-6">
            {/* Overall Score Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  Overall Performance
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600">
                    {Math.round((
                      seoData.categoryScores.performance +
                      seoData.categoryScores.accessibility +
                      seoData.categoryScores.bestPractices +
                      seoData.categoryScores.seo
                    ) / 4)}
                  </span>
                  <span className="text-gray-500 text-sm sm:text-base">/100</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 sm:h-4 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.round((
                      seoData.categoryScores.performance +
                      seoData.categoryScores.accessibility +
                      seoData.categoryScores.bestPractices +
                      seoData.categoryScores.seo
                    ) / 4)}%` 
                  }}
                ></div>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Analyzed: {new Date(seoData.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Performance Insights Header */}
            <div className="flex items-center gap-2 px-2">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Performance Insights
              </h2>
            </div>

            {/* Charts Grid - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <CategoryDonutChart data={seoData} />
              <CoreWebVitalsDisplay data={seoData} />
            </div>
            
            {/* Performance Timeline - Full Width */}
            <PerformanceTimeline data={seoData} />
            
            {/* Resource Breakdown & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ResourceBreakdown data={seoData} />
              
              {/* Analysis Summary Card */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 md:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Analysis Summary
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm sm:text-base text-gray-600">Overall Score</span>
                    <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {Math.round((
                        seoData.categoryScores.performance +
                        seoData.categoryScores.accessibility +
                        seoData.categoryScores.bestPractices +
                        seoData.categoryScores.seo
                      ) / 4)}
                    </span>
                  </div>
                  
                  {/* Individual Scores */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Performance</span>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {seoData.categoryScores.performance}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Accessibility</span>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {seoData.categoryScores.accessibility}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Best Practices</span>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {seoData.categoryScores.bestPractices}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">SEO</span>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {seoData.categoryScores.seo}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t text-xs sm:text-sm text-gray-500">
                    Lighthouse v{seoData.lighthouseVersion}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics - Mobile Friendly */}
            {seoData.coreWebVitals && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 md:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Core Web Vitals
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">LCP</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                      {seoData.coreWebVitals.lcp}s
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Largest Contentful Paint</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">FID</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                      {seoData.coreWebVitals.fid}ms
                    </div>
                    <div className="text-xs text-gray-500 mt-1">First Input Delay</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">CLS</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
                      {seoData.coreWebVitals.cls}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Cumulative Layout Shift</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">Analyzing website...</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">This may take a few moments</p>
          </div>
        )}
      </div>
    </div>
  );
}