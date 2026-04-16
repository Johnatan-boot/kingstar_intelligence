import { TrendingUp, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface BalanceScoreProps {
  completedNFs: number;
  cancelledNFs: number;
  rejectedLoads: number;
}

export default function BalanceScore({
  completedNFs,
  cancelledNFs,
  rejectedLoads
}: BalanceScoreProps) {

  const total = completedNFs + cancelledNFs + rejectedLoads;

  const getScore = () => {
    if (total === 0) return 0;

    // Peso negativo para cancelamentos e recusas
    const score =
      (completedNFs * 1 -
        cancelledNFs * 0.7 -
        rejectedLoads * 1) /
      total;

    return Math.max(0, Math.min(1, score)) * 100;
  };

  const score = getScore();

  const getClassification = () => {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Boa';
    if (score >= 50) return 'Regular';
    return 'Crítica';
  };

  const getColor = () => {
    if (score >= 85) return 'text-kingstar-green';
    if (score >= 70) return 'text-kingstar-cyan';
    if (score >= 50) return 'text-kingstar-yellow';
    return 'text-kingstar-red';
  };

  const getIcon = () => {
    if (score >= 85) return <CheckCircle className="text-kingstar-green" />;
    if (score >= 70) return <TrendingUp className="text-kingstar-cyan" />;
    if (score >= 50) return <AlertTriangle className="text-kingstar-yellow" />;
    return <ShieldAlert className="text-kingstar-red" />;
  };

  return (
    <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">
            Balanceamento Operacional
          </h3>
          <p className="text-sm text-gray-400">
            Eficiência baseada em NFs concluídas vs perdas operacionais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {getIcon()}
          <span className={`text-2xl font-bold ${getColor()}`}>
            {score.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Barra */}
      <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-kingstar-cyan to-kingstar-green transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Classificação */}
      <div className="flex justify-between items-center mt-3">
        <span className={`text-sm font-semibold ${getColor()}`}>
          {getClassification()}
        </span>
        <span className="text-xs text-gray-500">
          Meta recomendada: ≥ 70%
        </span>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-4 mt-6 text-center">
        <div>
          <p className="text-xs text-gray-400">Concluídas</p>
          <p className="text-lg font-bold text-kingstar-green">
            {completedNFs}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Canceladas</p>
          <p className="text-lg font-bold text-kingstar-yellow">
            {cancelledNFs}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Recusadas</p>
          <p className="text-lg font-bold text-kingstar-red">
            {rejectedLoads}
          </p>
        </div>
      </div>
    </div>
  );
}