import React from 'react';

interface CoreWebVitalsDisplayProps {
  data: {
    coreWebVitals?: {
      lcp: {
        displayValue: string;
        rating: string;
      };
      fid: {
        displayValue: string;
        rating: string;
      };
      cls: {
        displayValue: string;
        rating: string;
      };
      fcp: {
        displayValue: string;
        rating: string;
      };
    };
  };
}

const CoreWebVitalsDisplay: React.FC<CoreWebVitalsDisplayProps> = ({ data }) => {
  if (!data || !data.coreWebVitals) {
    return <div>No core web vitals data available</div>;
  }

  const { lcp, fid, cls, fcp } = data.coreWebVitals;
  
  const getRatingColor = (rating: string) => {
    switch(rating) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'needs-improvement': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMetric = (metric: { displayValue: string; rating: string }, title: string, description: string) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h4 className="font-medium text-gray-700">{title}</h4>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-2xl font-bold">{metric.displayValue}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(metric.rating)}`}>
          {metric.rating?.replace('-', ' ')}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {renderMetric(lcp, "LCP", "Largest Contentful Paint")}
        {renderMetric(cls, "CLS", "Cumulative Layout Shift")}
        {renderMetric(fid, "FID", "First Input Delay")}
        {renderMetric(fcp, "FCP", "First Contentful Paint")}
      </div>
    </div>
  );
};

export default CoreWebVitalsDisplay;
