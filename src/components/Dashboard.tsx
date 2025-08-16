import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Target } from 'lucide-react';
import { PortfolioMetrics } from '../types';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface DashboardProps {
  metrics: PortfolioMetrics;
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Valeur Totale',
      value: formatCurrency(metrics.totalValue),
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Total Investi',
      value: formatCurrency(metrics.totalInvested),
      icon: Target,
      color: 'gray'
    },
    {
      title: 'P&L Total',
      value: formatCurrency(metrics.totalPnL),
      subvalue: formatPercentage(metrics.totalPnLPercent),
      icon: metrics.totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: metrics.totalPnL >= 0 ? 'green' : 'red'
    },
    {
      title: 'P&L Non Réalisé',
      value: formatCurrency(metrics.unrealizedPnL),
      icon: metrics.unrealizedPnL >= 0 ? TrendingUp : TrendingDown,
      color: metrics.unrealizedPnL >= 0 ? 'green' : 'red'
    },
    {
      title: 'Positions',
      value: metrics.numberOfPositions.toString(),
      icon: PieChart,
      color: 'purple'
    }
  ];

  const getCardStyles = (color: string) => {
    const styles = {
      blue: 'from-blue-500 to-blue-600 text-white',
      gray: 'from-gray-500 to-gray-600 text-white',
      green: 'from-green-500 to-green-600 text-white',
      red: 'from-red-500 to-red-600 text-white',
      purple: 'from-purple-500 to-purple-600 text-white'
    };
    return styles[color as keyof typeof styles] || styles.blue;
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${getCardStyles(card.color)} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon size={28} className="opacity-80" />
              <div className="text-right opacity-75 text-sm font-medium">
                {card.title}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {card.value}
              </div>
              {card.subvalue && (
                <div className="text-sm opacity-90 font-medium">
                  {card.subvalue}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
