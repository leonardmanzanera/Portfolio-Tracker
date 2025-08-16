import { Transaction, Position, PortfolioMetrics } from '../types';

// Prix simulés pour la démo (dans une vraie app, on utiliserait une API)
const mockPrices: Record<string, number> = {
  'AAPL': 175.50,
  'MSFT': 385.20,
  'GOOGL': 142.80,
  'TSLA': 248.90,
  'AMZN': 151.20,
  'NVDA': 875.30,
  'META': 485.60,
  'NFLX': 445.20
};

export const getCurrentPrice = (symbol: string): number => {
  return mockPrices[symbol.toUpperCase()] || 100;
};

export const calculatePositions = (transactions: Transaction[]): Position[] => {
  const positionMap = new Map<string, { quantity: number; totalInvested: number; transactions: Transaction[] }>();

  // Regrouper les transactions par symbole
  transactions.forEach(transaction => {
    const key = transaction.symbol.toUpperCase();
    if (!positionMap.has(key)) {
      positionMap.set(key, { quantity: 0, totalInvested: 0, transactions: [] });
    }
    
    const position = positionMap.get(key)!;
    position.transactions.push(transaction);
    
    if (transaction.type === 'buy') {
      position.quantity += transaction.quantity;
      position.totalInvested += transaction.quantity * transaction.price + (transaction.fees || 0);
    } else {
      position.quantity -= transaction.quantity;
      position.totalInvested -= transaction.quantity * transaction.price - (transaction.fees || 0);
    }
  });

  // Calculer les métriques pour chaque position
  return Array.from(positionMap.entries())
    .filter(([, data]) => data.quantity > 0)
    .map(([symbol, data]) => {
      const currentPrice = getCurrentPrice(symbol);
      const averagePrice = data.totalInvested / data.quantity;
      const currentValue = data.quantity * currentPrice;
      const unrealizedPnL = currentValue - data.totalInvested;
      const unrealizedPnLPercent = (unrealizedPnL / data.totalInvested) * 100;

      return {
        symbol,
        quantity: data.quantity,
        averagePrice,
        currentPrice,
        totalInvested: data.totalInvested,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent
      };
    });
};

export const calculatePortfolioMetrics = (positions: Position[], transactions: Transaction[]): PortfolioMetrics => {
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const totalInvested = positions.reduce((sum, pos) => sum + pos.totalInvested, 0);
  const unrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  
  // Calculer les P&L réalisés
  const soldPositions = new Map<string, { totalSold: number; totalCost: number }>();
  transactions.forEach(transaction => {
    const key = transaction.symbol.toUpperCase();
    if (transaction.type === 'sell') {
      if (!soldPositions.has(key)) {
        soldPositions.set(key, { totalSold: 0, totalCost: 0 });
      }
      const sold = soldPositions.get(key)!;
      sold.totalSold += transaction.quantity * transaction.price - (transaction.fees || 0);
      sold.totalCost += transaction.quantity * transaction.price; // Prix de vente approximatif pour le coût
    }
  });

  const realizedPnL = Array.from(soldPositions.values())
    .reduce((sum, { totalSold, totalCost }) => sum + (totalSold - totalCost), 0);

  const totalPnL = realizedPnL + unrealizedPnL;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    totalPnL,
    totalPnLPercent,
    realizedPnL,
    unrealizedPnL,
    numberOfPositions: positions.length
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};