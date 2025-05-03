import React, { useState, useEffect } from 'react';
import { inventoryForecastService } from '../services/langchainService';
import { Bar } from 'react-chartjs-2';
import Nav from '../components/Nav';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InventoryForecast = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(14);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await inventoryForecastService.getForecast(days);
        setForecast(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch inventory forecast');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [days]);

  const prepareChartData = () => {
    if (!forecast?.quantitativeForecast) return null;

    const bloodTypes = Object.keys(forecast.quantitativeForecast.currentInventory || {});
    
    return {
      labels: bloodTypes,
      datasets: [
        {
          label: 'Current Inventory',
          data: bloodTypes.map(type => forecast.quantitativeForecast.currentInventory[type]),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Predicted Usage',
          data: bloodTypes.map(type => forecast.quantitativeForecast.predictedUsage[type]),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Predicted Shortage',
          data: bloodTypes.map(type => forecast.quantitativeForecast.predictedShortage[type]),
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Segoe UI', sans-serif"
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Blood Inventory Forecast',
        font: {
          size: 20,
          weight: 'bold',
          family: "'Segoe UI', sans-serif"
        },
        padding: 20
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 10
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Blood Types',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 10
        },
        grid: {
          display: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px] bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-8 py-6 rounded-lg shadow-lg m-4">
        <p className="font-semibold text-lg mb-2">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <>
    <Nav />
    <div className="space-y-8 p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800">Blood Inventory Forecast</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-medium transition-all duration-200 hover:border-red-400"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      {chartData && (
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="h-[800px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {forecast?.explainableForecast && (
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Analysis</h3>
          <div className="prose max-w-none space-y-4">
            {forecast.explainableForecast.split('\n').map((line, i) => (
              line.trim() && (
                <p key={i} className={`text-gray-700 text-lg leading-relaxed ${
                  line.includes('**') ? 'font-semibold' : ''
                }`}>
                  {line.replace(/\*\*/g, '')}
                </p>
              )
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
  
};

export default InventoryForecast; 