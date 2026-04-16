import React, { useState, useEffect, FormEvent } from 'react';
import { Truck, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Receiving() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [receivings, setReceivings] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    poId: '',
    licensePlate: '',
    vehicleType: 'Caminhão'
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchData = () => {
    fetch('/api/receiving').then(res => res.json()).then(setReceivings);
    fetch('/api/purchases').then(res => res.json()).then(setPos);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingPOs = pos.filter(po => po.status === 'PENDING');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Registrando chegada do veículo...');
    try {
      const res = await fetch('/api/receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao registrar chegada.');
      }

      toast.success('Veículo registrado com sucesso! Descarga iniciada.', { id: toastId });
      setShowForm(false);
      setFormData({ poId: '', licensePlate: '', vehicleType: 'Caminhão' });
      fetchData();
    } catch (error: any) {
      console.error('Failed to start receiving', error);
      toast.error(error.message || 'Falha na comunicação com o servidor.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">1. Recepção de Cargas Agendadas</h2>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
            <button
              onClick={async () => {
                if (confirm('Limpar todos os recebimentos?')) {
                  const tid = toast.loading('Limpando...');
                  await fetch('/api/admin/clear-data', { method: 'POST' });
                  toast.success('Limpo!', { id: tid });
                  fetchData();
                }
              }}
              className="px-4 py-2 border border-red-600 text-red-600 font-semibold rounded-md hover:bg-red-600/10 transition"
            >
              Limpar Tabela
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-kingstar-cyan text-black font-semibold rounded-md hover:bg-[#0ea5e9]"
          >
            <Plus size={18} />
            <span>Novo Recebimento</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-kingstar-panel p-6 rounded-xl shadow-sm border border-zinc-800">
          <h3 className="text-lg font-medium text-white mb-4">Registrar Chegada</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pedido (PO)</label>
                <select
                  required
                  value={formData.poId}
                  onChange={(e) => setFormData({...formData, poId: e.target.value})}
                  className="w-full bg-black border border-zinc-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kingstar-green focus:border-kingstar-green"
                >
                  <option value="">Selecione um pedido pendente...</option>
                  {pendingPOs.map(po => (
                    <option key={po.id} value={po.id}>{po.id} - {po.supplier}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Placa do Veículo</label>
                <input
                  type="text"
                  required
                  placeholder="ABC-1234"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  className="w-full bg-black border border-zinc-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kingstar-green focus:border-kingstar-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Veículo</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  className="w-full bg-black border border-zinc-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-kingstar-green focus:border-kingstar-green"
                >
                  <option>Caminhão</option>
                  <option>Carreta</option>
                  <option>Van</option>
                  <option>Fiorino</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-kingstar-cyan text-kingstar-cyan rounded-md hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-kingstar-cyan text-black font-semibold rounded-md hover:bg-[#0ea5e9]"
              >
                Iniciar Recebimento
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#18181b] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">NF</th>
                <th className="px-6 py-4">Placa</th>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {receivings.map((rec) => {
                const po = pos.find(p => p.id === rec.purchaseOrderId);
                const canStartConference = po?.status === 'RECEIVING';
                const isExpanded = expandedRows[rec.id];
                
                return (
                  <React.Fragment key={rec.id}>
                    <tr className="border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer" onClick={() => toggleRow(rec.id)}>
                      <td className="px-6 py-4">
                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </td>
                      <td className="px-6 py-4">{new Date(rec.startTime).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 font-bold">{po?.supplier || 'N/A'}</td>
                      <td className="px-6 py-4 font-semibold text-kingstar-yellow">{rec.purchaseOrderId}</td>
                      <td className="px-6 py-4">{rec.licensePlate}</td>
                      <td className="px-6 py-4">{rec.vehicleType}</td>
                      <td className="px-6 py-4">
                        {canStartConference ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold border border-kingstar-cyan text-kingstar-cyan bg-transparent">
                            PROCESSANDO
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold border border-kingstar-green text-kingstar-green bg-transparent">
                            CONCLUÍDO
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canStartConference ? (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const toastId = toast.loading('Iniciando conferência...');
                              try {
                                const res = await fetch('/api/conference/start', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ receivingId: rec.id })
                                });
                                if (!res.ok) throw new Error('Erro ao iniciar conferência');
                                toast.success('Conferência iniciada!', { id: toastId });
                                fetchData();
                              } catch (error) {
                                toast.error('Falha ao iniciar conferência', { id: toastId });
                              }
                            }}
                            className="px-4 py-2 bg-kingstar-cyan text-black font-bold rounded-md hover:bg-[#0ea5e9]"
                          >
                            Conferir
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs">Concluído</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && po && (
                      <tr className="bg-[#121214] border-b border-zinc-800">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-gray-300 font-medium uppercase">Detalhes da Carga & Produtos</div>
                            <div className="flex space-x-4 text-xs">
                              <div className="bg-zinc-800 px-3 py-1 rounded text-gray-300">
                                <span className="text-gray-500 mr-1">Placa:</span> {rec.licensePlate}
                              </div>
                              <div className="bg-zinc-800 px-3 py-1 rounded text-gray-300">
                                <span className="text-gray-500 mr-1">Veículo:</span> {rec.vehicleType}
                              </div>
                            </div>
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
                );
              })}
              {receivings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Nenhum recebimento registrado.
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
