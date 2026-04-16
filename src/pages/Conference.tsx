import React, { useState, useEffect, FormEvent } from 'react';
import { ClipboardCheck, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Conference() {
   const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [conferences, setConferences] = useState<any[]>([]);
  const [receivings, setReceivings] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [activeConf, setActiveConf] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    checkedPieces: 0,
    damages: 0,
    hasDamages: 'nao'
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchData = () => {
    fetch('/api/conference')
      .then(res => res.json())
      .then(setConferences);
    fetch('/api/receiving')
      .then(res => res.json())
      .then(setReceivings);
    fetch('/api/purchases')
      .then(res => res.json())
      .then(setPos);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeConf) return;
    
    const toastId = toast.loading('Enviando contagem...');
    try {
      const res = await fetch(`/api/conference/${activeConf.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkedPieces: Number(formData.checkedPieces),
          damages: formData.hasDamages === 'sim' ? Number(formData.damages) : 0
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao enviar conferência.');
      }

      const updatedConf = await res.json();
      
      if (updatedConf.status === 'APPROVED') {
        toast.success('Conferência aprovada! Mercadoria movida para o estoque.', { id: toastId });
      } else if (updatedConf.status === 'PCL_ANALYSIS') {
        toast.error('Divergência detectada! Enviado para análise do Gestor.', { id: toastId, icon: '⚠️' });
      } else {
        toast.error(`Divergência. Tentativa ${updatedConf.attempts} de 3 falhou.`, { id: toastId });
      }

      setActiveConf(null);
      setFormData({ checkedPieces: 0, damages: 0, hasDamages: 'nao' });
      fetchData();
    } catch (error: any) {
      console.error('Failed to submit conference', error);
      toast.error(error.message || 'Falha na comunicação com o servidor.', { id: toastId });
    }
  };

  const pendingConfs = conferences.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS');

  const getPoId = (receivingId: string) => {
    const rec = receivings.find(r => r.id === receivingId);
    return rec ? rec.purchaseOrderId : 'Desconhecido';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Conferência</h2>
          <p className="text-gray-400 mt-1">Validação física da mercadoria recebida.</p>
        </div>
        {isAdmin && (
          <button
            onClick={async () => {
              if (confirm('Limpar todas as conferências?')) {
                const tid = toast.loading('Limpando...');
                await fetch('/api/admin/clear-data', { method: 'POST' });
                toast.success('Limpo!', { id: tid });
                fetchData();
              }
            }}
            className="px-4 py-2 border border-red-600 text-red-600 font-semibold rounded-md hover:bg-red-600/10 transition"
          >
            Limpar Fila
          </button>
        )}
      </div>

      {activeConf && (
        <div className="bg-kingstar-panel p-6 rounded-xl shadow-sm border border-kingstar-cyan ring-1 ring-kingstar-cyan/30">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Realizar Conferência</h3>
              <p className="text-sm text-gray-400">Pedido: <span className="font-semibold text-kingstar-cyan">{getPoId(activeConf.receivingId)}</span></p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-kingstar-cyan text-kingstar-cyan bg-transparent">
                Tentativa {activeConf.attempts + 1} de 3
              </span>
              <p className="text-sm text-gray-400 mt-1">Total Esperado: <span className="font-bold text-white">{activeConf.totalPieces}</span> peças</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Peças Conferidas</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.checkedPieces}
                  onChange={(e) => setFormData({...formData, checkedPieces: parseInt(e.target.value) || 0})}
                  className="w-full bg-black border border-zinc-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kingstar-green focus:border-kingstar-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">A NF possui produtos avariados?</label>
                <div className="flex items-center space-x-4 mb-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasDamages"
                      value="sim"
                      checked={formData.hasDamages === 'sim'}
                      onChange={() => setFormData({...formData, hasDamages: 'sim', damages: formData.damages === 0 ? 1 : formData.damages})}
                      className="text-kingstar-cyan focus:ring-kingstar-cyan bg-black border-zinc-800"
                    />
                    <span className="text-gray-300">Sim</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasDamages"
                      value="nao"
                      checked={formData.hasDamages === 'nao'}
                      onChange={() => setFormData({...formData, hasDamages: 'nao', damages: 0})}
                      className="text-kingstar-cyan focus:ring-kingstar-cyan bg-black border-zinc-800"
                    />
                    <span className="text-gray-300">Não</span>
                  </label>
                </div>
                
                {formData.hasDamages === 'sim' && (
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Quantidade de Avarias</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.damages}
                      onChange={(e) => setFormData({...formData, damages: parseInt(e.target.value) || 0})}
                      className="w-full bg-black border border-zinc-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kingstar-green focus:border-kingstar-green"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {activeConf.attempts > 0 && (
              <div className="bg-kingstar-yellow/10 border-l-4 border-kingstar-yellow p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-kingstar-yellow" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-kingstar-yellow">
                      Atenção: A tentativa anterior falhou. Faltam {3 - activeConf.attempts} tentativas antes de enviar para o Gestor.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveConf(null)}
                className="px-4 py-2 border border-kingstar-cyan text-kingstar-cyan rounded-md hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-kingstar-cyan text-black font-semibold rounded-md hover:bg-[#0ea5e9]"
              >
                Confirmar Contagem
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-medium text-white">Fila de Conferência</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#18181b] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">ID Conferência</th>
                <th className="px-6 py-4">Pedido (PO)</th>
                <th className="px-6 py-4">Total Esperado</th>
                <th className="px-6 py-4">Tentativas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {conferences.map((conf) => {
                const poId = getPoId(conf.receivingId);
                const po = pos.find(p => p.id === poId);
                const isExpanded = expandedRows[conf.id];
                return (
                  <React.Fragment key={conf.id}>
                    <tr className="border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer" onClick={() => toggleRow(conf.id)}>
                      <td className="px-6 py-4">
                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </td>
                      <td className="px-6 py-4 font-medium text-white flex items-center space-x-2">
                        <ClipboardCheck size={16} className="text-gray-500" />
                        <span className="font-semibold text-kingstar-cyan">CONF-{poId}</span>
                      </td>
                      <td className="px-6 py-4">{poId}</td>
                      <td className="px-6 py-4">{conf.totalPieces}</td>
                      <td className="px-6 py-4">{conf.attempts}/3</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border bg-transparent ${
                          conf.status === 'APPROVED' ? 'border-kingstar-green text-kingstar-green' :
                          conf.status === 'PCL_ANALYSIS' ? 'border-kingstar-red text-kingstar-red' :
                          conf.status === 'IN_PROGRESS' ? 'border-kingstar-yellow text-kingstar-yellow' :
                          'border-gray-400 text-gray-300 bg-zinc-800'
                        }`}>
                          {conf.status === 'PCL_ANALYSIS' ? 'EM ANÁLISE GESTOR' : conf.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(conf.status === 'PENDING' || conf.status === 'IN_PROGRESS') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveConf(conf);
                            }}
                            className="text-kingstar-cyan hover:text-[#0ea5e9] font-medium"
                          >
                            Conferir
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && po && (
                      <tr className="bg-[#121214] border-b border-zinc-800">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-gray-300 font-medium uppercase">Detalhes da Carga & Produtos</div>
                            {receivings.find(r => r.id === conf.receivingId) && (
                              <div className="flex space-x-4 text-xs">
                                <div className="bg-zinc-800 px-3 py-1 rounded text-gray-300">
                                  <span className="text-gray-500 mr-1">Placa:</span> {receivings.find(r => r.id === conf.receivingId)?.licensePlate}
                                </div>
                                <div className="bg-zinc-800 px-3 py-1 rounded text-gray-300">
                                  <span className="text-gray-500 mr-1">Veículo:</span> {receivings.find(r => r.id === conf.receivingId)?.vehicleType}
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
              {conferences.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma conferência na fila.
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
