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

  // Calculer les P&L réalisés avec une approche FIFO.
  // Pour chaque symbole, on conserve une file de lots d'achat.
  // Lors d'une vente, on retire des lots jusqu'à épuisement de la quantité
  // vendue afin de déterminer le coût d'acquisition réel.
  const lots = new Map<string, { quantity: number; costPerShare: number }[]>();
  let realizedPnL = 0;

  // S'assurer que les transactions sont traitées dans l'ordre chronologique
  const ordered = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  ordered.forEach(tx => {
    const symbol = tx.symbol.toUpperCase();
    if (!lots.has(symbol)) {
      lots.set(symbol, []);
    }
    const symbolLots = lots.get(symbol)!;

    if (tx.type === 'buy') {
      // Stocker le coût par action incluant les frais
      const costPerShare =
        (tx.price * tx.quantity + (tx.fees || 0)) / tx.quantity;
      symbolLots.push({ quantity: tx.quantity, costPerShare });
    } else {
      let remaining = tx.quantity;
      let totalCost = 0;
      // Retirer les actions de la file FIFO pour calculer le coût d'acquisition
      while (remaining > 0 && symbolLots.length > 0) {
        const lot = symbolLots[0];
        const used = Math.min(remaining, lot.quantity);
        totalCost += used * lot.costPerShare;
        lot.quantity -= used;
        remaining -= used;
        if (lot.quantity === 0) {
          symbolLots.shift();
        }
      }
      const proceeds = tx.price * tx.quantity - (tx.fees || 0);
      realizedPnL += proceeds - totalCost;
    }
  });

  // Exemple:
  // Achat 10@100€, achat 10@120€, vente 15@130€ avec 1€ de frais => PnL réalisé 349€

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
