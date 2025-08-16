import React from 'react';
import { Position } from '../types';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface PortfolioChartProps {
  positions: Position[];
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ positions }) => {
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Répartition du Portefeuille</h3>
      
      <div className="space-y-4">
        {positions.map((position) => {
          const percentage = (position.currentValue / totalValue) * 100;
          const isProfit = position.unrealizedPnL >= 0;
          
          return (
            <div key={position.symbol} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <span className="font-bold text-lg text-gray-800">{position.symbol}</span>
                  <span className="text-gray-500 text-sm">
                    {position.quantity} actions
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    {formatCurrency(position.currentValue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-600">
                  Prix moy: {formatCurrency(position.averagePrice)} | 
                  Actuel: {formatCurrency(position.currentPrice)}
                </div>
                
                <div className={`text-sm font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(position.unrealizedPnL)} ({formatPercentage(position.unrealizedPnLPercent)})
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
