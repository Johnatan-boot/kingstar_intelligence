import React, { useState, useEffect } from 'react';
import { Upload, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Purchases() {
  const [pos, setPos] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchPOs = () => {
    fetch('/api/purchases')
      .then(res => res.json())
      .then(data => {
        // Sort from current to future (ascending order)
        const sortedData = data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setPos(sortedData);
      });
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo primeiro.');
      return;
    }
    
    setUploading(true);
    const toastId = toast.loading('Importando planilha...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erro desconhecido ao importar planilha.', { id: toastId });
      } else {
        const data = await res.json();
        toast.success(`Planilha importada com sucesso! ${data.count} pedidos carregados.`, { id: toastId });
        setFile(null);
        fetchPOs();
      }
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Falha na comunicação com o servidor.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Compras</h2>
        <p className="text-gray-400 mt-1">Importação de pedidos via CSV ou Excel (.xlsx).</p>
      </div>

      <div className="bg-kingstar-panel p-6 rounded-xl shadow-sm border border-zinc-800">
        <h3 className="text-lg font-medium text-white mb-4">Importar Planilha (CSV/Excel)</h3>

        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center space-x-2 px-4 py-2 bg-kingstar-cyan text-black font-semibold rounded-md hover:bg-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={18} />
            <span>{uploading ? 'Importando...' : 'Importar'}</span>
          </button>
        </div>
      </div>

      <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-medium text-white">Pedidos Registrados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#18181b] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Itens</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => {
                const isExpanded = expandedRows[po.id];
                return (
                  <React.Fragment key={po.id}>
                    <tr className="border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer" onClick={() => toggleRow(po.id)}>
                      <td className="px-6 py-4">
                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </td>
                      <td className="px-6 py-4 font-medium text-white flex items-center space-x-2">
                        <FileText size={16} className="text-gray-500" />
                        <span>{po.id}</span>
                      </td>
                      <td className="px-6 py-4">{po.supplier}</td>
                      <td className="px-6 py-4">{new Date(po.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4">{po.items.length} itens</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border bg-transparent ${
                          po.status === 'PENDING' ? 'border-gray-400 text-gray-300 bg-zinc-800' :
                          po.status === 'RECEIVING' ? 'border-kingstar-cyan text-kingstar-cyan' :
                          po.status === 'CONFERENCE' ? 'border-purple-400 text-purple-400' :
                          'border-kingstar-green text-kingstar-green'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#121214] border-b border-zinc-800">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="text-sm text-gray-300 mb-2 font-medium uppercase">Produtos da NF</div>
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
              {pos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum pedido encontrado. Importe um CSV para começar.
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
