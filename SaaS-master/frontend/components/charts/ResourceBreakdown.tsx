import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ResourceBreakdownProps {
  data: {
    chartData?: {
      resourceBreakdown?: any;
    };
  };
}

const ResourceBreakdown: React.FC<ResourceBreakdownProps> = ({ data }) => {
  if (!data || !data.chartData || !data.chartData.resourceBreakdown) {
    return <div>No resource breakdown data available</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Resource Size Breakdown'
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Resource Breakdown</h3>
      <div className="h-64">
        <Bar data={data.chartData.resourceBreakdown} options={options} />
      </div>
    </div>
  );
};

export default ResourceBreakdown;
