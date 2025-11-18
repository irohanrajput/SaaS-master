import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

interface CategoryDonutChartProps {
  data: {
    chartData?: {
      categoryDonut?: any;
    };
  };
}

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data }) => {
  if (!data || !data.chartData || !data.chartData.categoryDonut) {
    return <div>No category data available</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Lighthouse Category Scores'
      }
    }
  };

  return (
    <div className="h-64 w-full bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Performance Overview</h3>
      <div className="h-52">
        <Doughnut data={data.chartData.categoryDonut} options={options} />
      </div>
    </div>
  );
};

export default CategoryDonutChart;
