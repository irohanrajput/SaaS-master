import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceTimelineProps {
  data: {
    chartData?: {
      performanceTimeline?: any;
    };
  };
}

const PerformanceTimeline: React.FC<PerformanceTimelineProps> = ({ data }) => {
  if (!data || !data.chartData || !data.chartData.performanceTimeline) {
    return <div>No performance timeline data available</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time (ms)'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Performance Metrics Timeline'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(0)} ms`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Performance Timeline</h3>
      <div className="h-64">
        <Line data={data.chartData.performanceTimeline} options={options} />
      </div>
    </div>
  );
};

export default PerformanceTimeline;
