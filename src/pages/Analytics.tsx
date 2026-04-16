import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, Clock, AlertTriangle, CheckCircle, Truck, Package, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import BalanceScore from '../components/BalanceScore';

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

const [historicalScore, setHistoricalScore] = useState(0);

const fetchData = () => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
    
    fetch('/api/analytics/historical-score')
      .then(res => res.json())
      .then(data => setHistoricalScore(data.score));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearData = async () => {
    if (!confirm('Tem certeza que deseja limpar TODAS as tabelas do sistema? Esta ação não pode ser desfeita.')) return;
    
    const toastId = toast.loading('Limpando sistema...');
    try {
      const res = await fetch('/api/admin/clear-data', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao limpar dados');
      toast.success('Sistema limpo com sucesso!', { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleResetScore = async () => {
    if (!confirm('Deseja zerar o contador de score histórico?')) return;
    
    const toastId = toast.loading('Reiniciando score...');
    try {
      const res = await fetch('/api/analytics/reset-score', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao resetar score');
      toast.success('Score reiniciado com sucesso!', { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  if (loading) {
    return <div className="text-white">Carregando analytics...</div>;
  }

  const { metrics, productivity, score, history } = data;
  const metricsSafe = metrics || {};

  const getScoreColor = (classification: string) => {
    switch (classification) {
      case 'Excelente': return 'text-kingstar-green';
      case 'Boa': return 'text-kingstar-cyan';
      case 'Regular': return 'text-kingstar-yellow';
      case 'Crítica': return 'text-kingstar-red';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white">Analytics & Performance</h2>
          <p className="text-gray-400 mt-1">Métricas operacionais e score de qualidade.</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleResetScore}
            className="px-4 py-2 border border-kingstar-yellow text-kingstar-yellow rounded-md hover:bg-kingstar-yellow/10 text-sm font-semibold transition"
          >
            Zerar Contador Score
          </button>
          <button
            onClick={handleClearData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold transition"
          >
            Limpar Sistema (Tabelas)
          </button>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-400">Score Operacional</h3>
            <div className="flex items-baseline space-x-4 mt-2">
              <span className={`text-5xl font-bold ${getScoreColor(score.classification)}`}>
                {score.total}
              </span>
              <span className={`text-xl font-medium ${getScoreColor(score.classification)}`}>
                {score.classification}
              </span>
            </div>
          </div>
          <div className="w-1/2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tempo de Processamento (30%)</span>
                <span className="text-white">{Math.round(score.breakdown.timeScore)}/30</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-kingstar-cyan h-2 rounded-full" style={{ width: `${(score.breakdown.timeScore / 30) * 100}%` }}></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Divergências (30%)</span>
                <span className="text-white">{Math.round(score.breakdown.divScore)}/30</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-kingstar-green h-2 rounded-full" style={{ width: `${(score.breakdown.divScore / 30) * 100}%` }}></div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Volume Processado (20%)</span>
                <span className="text-white">{Math.round(score.breakdown.volumeScore)}/20</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-kingstar-yellow h-2 rounded-full" style={{ width: `${(score.breakdown.volumeScore / 20) * 100}%` }}></div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Precisão da Conferência (20%)</span>
                <span className="text-white">{Math.round(score.breakdown.attemptScore)}/20</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(score.breakdown.attemptScore / 20) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Balancing Score */}
      <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">Score de Balanceamento Histórico (Mensal)</h3>
            <p className="text-sm text-gray-400">Progresso baseado em NFs concluídas no último mês.</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-kingstar-green">{historicalScore}%</span>
          </div>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-kingstar-cyan to-kingstar-green h-full rounded-full transition-all duration-1000" 
            style={{ width: `${historicalScore}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Início do Mês</span>
          <span>Meta: 50 NFs</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-4 flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-kingstar-cyan text-black">
            <Truck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 truncate">Veículos Recebidos</p>
            <p className="text-xl font-bold text-white">{metrics.totalVehiclesReceived}</p>
          </div>
        </div>
        <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-4 flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-kingstar-green text-black">
            <CheckCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 truncate">NFs Concluídas</p>
            <p className="text-xl font-bold text-white">{metrics.totalCompletedNFs}</p>
          </div>
        </div>
        <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-4 flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-kingstar-yellow text-black">
            <Package size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 truncate">Peças Conferidas</p>
            <p className="text-xl font-bold text-white">{metrics.totalPiecesChecked}</p>
          </div>
        </div>
        <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-4 flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-kingstar-red text-white">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 truncate">Taxa de Erro</p>
            <p className="text-xl font-bold text-white">{metrics.errorRate}%</p>
          </div>
        </div>
      </div>

     <BalanceScore 
      completedNFs={Number(metricsSafe.totalCompletedNFs) || 0} 
      cancelledNFs={Number(metricsSafe.totalCancelledNFs) || 0} 
      rejectedLoads={Number(metricsSafe.totalRejectedLoads) || 0} 
    />

      {/* Productivity & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-6 lg:col-span-1">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-kingstar-cyan" />
            Produtividade
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-400">Tempo Médio Recebimento (Doca)</p>
              <p className="text-2xl font-bold text-white">{productivity.avgReceivingTimeMin} <span className="text-sm font-normal text-gray-500">min</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Tempo Médio de Descarga</p>
              <p className="text-2xl font-bold text-white">{productivity.avgReceivingTimeMin} <span className="text-sm font-normal text-gray-500">min</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Tempo Médio Conferência</p>
              <p className="text-2xl font-bold text-white">{productivity.avgConfTimeMin} <span className="text-sm font-normal text-gray-500">min</span></p>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-sm text-gray-400 mb-2">Insights Automáticos</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {parseFloat(productivity.avgReceivingTimeMin) > 30 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-kingstar-yellow shrink-0 mt-0.5" />
                    <span>O tempo de recebimento está acima do ideal (30 min). Verifique gargalos na doca.</span>
                  </li>
                )}
                {parseFloat(metrics.errorRate) > 5 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-kingstar-red shrink-0 mt-0.5" />
                    <span>Taxa de erro alta. Considere reforçar o treinamento da equipe de conferência.</span>
                  </li>
                )}
                {parseFloat(metrics.errorRate) <= 5 && parseFloat(productivity.avgConfTimeMin) > 0 && (
                  <li className="flex items-start gap-2">
                    <TrendingUp size={16} className="text-kingstar-green shrink-0 mt-0.5" />
                    <span>Qualidade excelente na conferência! Mantenha o padrão.</span>
                  </li>
                )}
                {metrics.totalVehiclesReceived === 0 && (
                  <li className="flex items-start gap-2">
                    <Activity size={16} className="text-kingstar-cyan shrink-0 mt-0.5" />
                    <span>Aguardando dados operacionais para gerar insights.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-4">Ranking de Fornecedores</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#18181b] text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Entregas</th>
                  <th className="px-4 py-3">Divergências</th>
                  <th className="px-4 py-3">Tempo Médio</th>
                </tr>
              </thead>
              <tbody>
                {data.supplierScores?.map((supplier: any, idx: number) => (
                  <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-white">{supplier.supplier}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        supplier.score >= 90 ? 'bg-green-500/10 text-green-400' :
                        supplier.score >= 70 ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {supplier.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">{supplier.totalDeliveries}</td>
                    <td className="px-4 py-3 text-red-400">{supplier.divergences}</td>
                    <td className="px-4 py-3">{supplier.avgDeliveryTime.toFixed(1)} min</td>
                  </tr>
                ))}
                {(!data.supplierScores || data.supplierScores.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nenhum dado de fornecedor disponível ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Table: Histórico de NFs */}
      <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Histórico de NFs Concluídas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#18181b] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Veículos</th>
                <th className="px-6 py-4">NFs Concluídas</th>
                <th className="px-6 py-4">Peças Conferidas</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-6 py-4 font-medium text-white">{row.date.split('-').reverse().join('/')}</td>
                  <td className="px-6 py-4">{row.vehicles}</td>
                  <td className="px-6 py-4 font-bold text-kingstar-green">{row.nfs}</td>
                  <td className="px-6 py-4">{row.pieces}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
