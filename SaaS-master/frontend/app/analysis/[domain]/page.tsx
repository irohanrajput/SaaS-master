'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CategoryDonutChart from '@/components/charts/CategoryDonutChart';
import CoreWebVitalsDisplay from '@/components/charts/CoreWebVitalsDisplay';
import PerformanceTimeline from '@/components/charts/PerformanceTimeline';
import ResourceBreakdown from '@/components/charts/ResourceBreakdown';

export default function AnalysisPage() {
  const params = useParams();
  const domain = params.domain as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seoData, setSeoData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3010/api/lighthouse/${domain}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analysis data');
        }
        
        const data = await response.json();
        setSeoData(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load SEO analysis data');
        setLoading(false);
      }
    };

    if (domain) {
      fetchData();
    }
  }, [domain]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!seoData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          SEO Analysis for {domain}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CategoryDonutChart data={seoData} />
          <CoreWebVitalsDisplay data={seoData} />
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <PerformanceTimeline data={seoData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceBreakdown data={seoData} />
        </div>
      </div>
    </div>
  );
}