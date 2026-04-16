import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PCL() {
  const [divergences, setDivergences] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [activeDiv, setActiveDiv] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchData = () => {
    fetch('/api/pcl/divergences')
      .then(res => res.json())
      .then(setDivergences);
    fetch('/api/purchases')
      .then(res => res.json())
      .then(setPos);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnalyze = async (approved: boolean) => {
    if (!activeDiv) return;
    
    const toastId = toast.loading('Processando análise...');
    try {
      const res = await fetch(`/api/pcl/divergences/${activeDiv.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, notes })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao processar análise.');
      }

      if (approved) {
        toast.success('Divergência aprovada com ressalva. Movido para o estoque.', { id: toastId });
      } else {
        toast.error('Carga rejeitada.', { id: toastId, icon: '❌' });
      }

      setActiveDiv(null);
      setNotes('');
      fetchData();
    } catch (error: any) {
      console.error('Failed to analyze divergence', error);
      toast.error(error.message || 'Falha na comunicação com o servidor.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Gestor</h2>
        <p className="text-gray-400 mt-1">Análise e tratativa de divergências de conferência.</p>
      </div>

      {activeDiv && (
        <div className="bg-kingstar-panel p-6 rounded-xl shadow-sm border border-kingstar-red ring-1 ring-kingstar-red/30">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-kingstar-red" />
                Analisar Divergência
              </h3>
              <p className="text-sm text-gray-400 mt-1">Pedido: <span className="font-semibold text-kingstar-cyan">{activeDiv.purchaseOrderId || 'Desconhecido'}</span></p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-kingstar-red text-kingstar-red bg-transparent">
              {activeDiv.errorType}
            </span>
          </div>

          <div className="bg-zinc-800/50 p-4 rounded-md mb-6 border border-zinc-800">
            <p className="text-sm text-gray-300 font-medium">Detalhes do Erro:</p>
            <p className="text-sm text-gray-400 mt-1">{activeDiv.description}</p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Notas da Análise (Obrigatório)</label>
              <textarea
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva a tratativa realizada..."
                className="w-full bg-black border border-zinc-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kingstar-red focus:border-kingstar-red"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveDiv(null)}
                className="px-4 py-2 border border-kingstar-cyan text-kingstar-cyan rounded-md hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleAnalyze(false)}
                disabled={!notes.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-kingstar-red text-white font-semibold rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                <X size={18} />
                <span>Rejeitar Carga</span>
              </button>
              <button
                type="button"
                onClick={() => handleAnalyze(true)}
                disabled={!notes.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-kingstar-green text-black font-semibold rounded-md hover:bg-[#16a34a] disabled:opacity-50"
              >
                <Check size={18} />
                <span>Aprovar com Ressalva</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-medium text-white">Fila de Análise do Gestor</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#18181b] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">ID Divergência</th>
                <th className="px-6 py-4">Pedido (PO)</th>
                <th className="px-6 py-4">Tipo de Erro</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {divergences.map((div) => {
                const poId = div.purchaseOrderId || 'Desconhecido';
                const po = pos.find(p => p.id === poId);
                const isExpanded = expandedRows[div.id];
                return (
                  <React.Fragment key={div.id}>
                    <tr className="border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer" onClick={() => toggleRow(div.id)}>
                      <td className="px-6 py-4">
                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </td>
                      <td className="px-6 py-4 font-medium text-white flex items-center space-x-2">
                        <AlertTriangle size={16} className="text-gray-500" />
                        <span className="font-semibold text-kingstar-cyan">DIV-{poId}</span>
                      </td>
                      <td className="px-6 py-4">{poId}</td>
                      <td className="px-6 py-4">{div.errorType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border bg-transparent ${
                          div.status === 'IN_ANALYSIS' ? 'border-kingstar-yellow text-kingstar-yellow' :
                          div.status === 'APPROVED' ? 'border-kingstar-green text-kingstar-green' :
                          'border-kingstar-red text-kingstar-red'
                        }`}>
                          {div.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {div.status === 'IN_ANALYSIS' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDiv(div);
                            }}
                            className="text-kingstar-cyan hover:text-[#0ea5e9] font-medium"
                          >
                            Analisar
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && po && (
                      <tr className="bg-[#121214] border-b border-zinc-800">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-gray-300 font-medium uppercase">Detalhes da Carga & Produtos</div>
                            {div.receivingId && (
                              <div className="flex space-x-4 text-xs">
                                <div className="bg-zinc-800 px-3 py-1 rounded text-gray-300">
                                  <span className="text-gray-500 mr-1">Recebimento ID:</span> {div.receivingId}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {po.items.map((item: any, idx: number) => (
                              <div key={idx} className="grid grid-cols-3 gap-4 bg-black p-3 rounded-md border border-zinc-800">
                                <div>
                                  <span className="text-gray-500 text-xs block">SKU</span>
                                  <span className="font-mono text-white">{item.sku}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-xs block">Produto</span>
                                  <span className="text-white">{item.description}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-xs block">Quantidade Esperada</span>
                                  <span className="text-kingstar-green font-bold">{item.expectedQuantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
              )})}
              {divergences.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma divergência pendente de análise.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
