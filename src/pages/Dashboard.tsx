import { useState, useEffect } from 'react';
import { Package, Truck, AlertTriangle, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendingPOs: 0,
    activeReceivings: 0,
    pendingConferences: 0,
    divergences: 0
  });
  const [score, setScore] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/purchases').then(res => res.json()),
      fetch('/api/receiving').then(res => res.json()),
      fetch('/api/conference').then(res => res.json()),
      fetch('/api/pcl/divergences').then(res => res.json()),
      fetch('/api/analytics').then(res => res.json())
    ]).then(([pos, receivings, conferences, divergences, analytics]) => {
      setStats({
        pendingPOs: pos.filter((p: any) => p.status === 'PENDING').length,
        activeReceivings: receivings.filter((r: any) => !r.endTime).length,
        pendingConferences: conferences.filter((c: any) => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length,
        divergences: divergences.filter((d: any) => d.status === 'IN_ANALYSIS').length
      });
      setScore(analytics.score);
      setAnalyticsData(analytics);
    });
  }, []);

  const cards = [
    { title: 'Pedidos Pendentes', value: stats.pendingPOs, icon: Package, color: 'bg-kingstar-cyan text-black' },
    { title: 'Recebimentos Ativos', value: stats.activeReceivings, icon: Truck, color: 'bg-kingstar-cyan text-black' },
    { title: 'Conferências Pendentes', value: stats.pendingConferences, icon: CheckCircle, color: 'bg-kingstar-green text-black' },
    { title: 'Divergências em Análise', value: stats.divergences, icon: AlertTriangle, color: 'bg-kingstar-red text-white' },
  ];

  const getScoreColor = (classification: string) => {
    switch (classification) {
      case 'Excelente': return 'text-kingstar-green border-kingstar-green/20 bg-kingstar-green/10';
      case 'Bom': return 'text-kingstar-cyan border-kingstar-cyan/20 bg-kingstar-cyan/10';
      case 'Regular': return 'text-kingstar-yellow border-kingstar-yellow/20 bg-kingstar-yellow/10';
      case 'Crítico': return 'text-kingstar-red border-kingstar-red/20 bg-kingstar-red/10';
      default: return 'text-gray-400 border-zinc-800 bg-zinc-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1">Visão geral da operação em tempo real.</p>
        </div>
        {score && (
          <Link to="/analytics" className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors hover:bg-opacity-80 ${getScoreColor(score.classification)}`}>
            <Activity size={24} />
            <div className="text-right">
              <div className="text-xs font-medium uppercase tracking-wider opacity-80">Score Operacional</div>
              <div className="text-xl font-bold leading-none">{score.total} <span className="text-sm font-normal">({score.classification})</span></div>
            </div>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-4 flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 truncate" title={card.title}>{card.title}</p>
                <p className="text-xl font-bold text-white">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-kingstar-panel border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-kingstar-cyan" size={20} />
              Comparativo de Divergências (7 dias)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.history.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                  <YAxis stroke="#a1a1aa" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString('pt-BR')}
                  />
                  <Legend />
                  <Line type="monotone" name="Avarias" dataKey="avarias" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Erros de Conferência" dataKey="errosConferencia" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-kingstar-panel border border-zinc-800 rounded-xl p-6 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-white mb-6 text-center">KPI de Divergências</h3>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">
                  {analyticsData.metrics.errorRate}%
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Taxa de Erro Geral</div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{analyticsData.metrics.avarias}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">Avarias</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{analyticsData.metrics.errosConferencia}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">Erros de Conf.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
