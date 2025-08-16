import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Transaction } from './types';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Dashboard } from './components/Dashboard';
import { PortfolioChart } from './components/PortfolioChart';
import { calculatePositions, calculatePortfolioMetrics } from './utils/calculations';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Charger les données depuis localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('portfolio-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Données de démo
      const demoTransactions: Transaction[] = [
        {
          id: '1',
          symbol: 'AAPL',
          type: 'buy',
          quantity: 10,
          price: 150.00,
          date: '2024-01-15',
          fees: 1.50
        },
        {
          id: '2',
          symbol: 'MSFT',
          type: 'buy',
          quantity: 5,
          price: 350.00,
          date: '2024-01-20',
          fees: 1.00
        },
        {
          id: '3',
          symbol: 'GOOGL',
          type: 'buy',
          quantity: 3,
          price: 140.00,
          date: '2024-02-01',
          fees: 0.75
        },
        {
          id: '4',
          symbol: 'AAPL',
          type: 'buy',
          quantity: 5,
          price: 160.00,
          date: '2024-02-15',
          fees: 0.80
        }
      ];
      setTransactions(demoTransactions);
    }
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('portfolio-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString()
    };
    setTransactions([...transactions, transaction]);
  };

  const positions = calculatePositions(transactions);
  const metrics = calculatePortfolioMetrics(positions, transactions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4">
              <TrendingUp className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Portfolio Tracker
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Suivez vos investissements boursiers avec des analyses détaillées
          </p>
        </header>

        {/* Form */}
        <TransactionForm onAddTransaction={handleAddTransaction} />

        {/* Dashboard */}
        <Dashboard metrics={metrics} />

        {/* Portfolio Chart */}
        {positions.length > 0 && (
          <PortfolioChart positions={positions} />
        )}

        {/* Transaction List */}
        <TransactionList transactions={transactions} />

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 size={16} className="mr-1" />
            <span>Les prix actuels sont simulés pour la démonstration</span>
          </div>
          <p>Développé avec React et TypeScript • Design moderne et responsive</p>
        </footer>
      </div>
    </div>
  );
}

export default App;