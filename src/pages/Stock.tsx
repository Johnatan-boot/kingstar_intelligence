import React, { useState, useEffect } from 'react';
import { Archive, PackageCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function Stock() {
  const [pos, setPos] = useState<any[]>([]);
  const [receivings, setReceivings] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/purchases')
      .then(res => res.json())
      .then(setPos);
    fetch('/api/receiving')
      .then(res => res.json())
      .then(setReceivings);
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Items in stock are those from COMPLETED purchase orders
  const completedPOs = pos.filter(po => po.status === 'COMPLETED');
  
  // Flatten items for display
  const stockItems = completedPOs.flatMap(po => {
    const receiving = receivings.find(r => r.purchaseOrderId === po.id);
    return po.items.map((item: any) => ({
      ...item,
      poId: po.id,
      supplier: po.supplier,
      dateAdded: po.date,
      licensePlate: receiving?.licensePlate || 'N/A',
      vehicleType: receiving?.vehicleType || 'N/A'
    }));
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Estoque</h2>
        <p className="text-gray-400 mt-1">Mercadorias aprovadas e disponíveis no inventário.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-6 flex items-center space-x-4">
          <div className="p-4 rounded-lg bg-kingstar-green text-black">
            <Archive size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total de SKUs</p>
            <p className="text-2xl font-bold text-white">{stockItems.length}</p>
          </div>
        </div>
        <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 p-6 flex items-center space-x-4">
          <div className="p-4 rounded-lg bg-kingstar-cyan text-black">
            <PackageCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total de Peças</p>
            <p className="text-2xl font-bold text-white">
              {stockItems.reduce((acc, item) => acc + item.expectedQuantity, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-kingstar-panel rounded-xl shadow-sm border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-medium text-white">Inventário Atual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#18181b] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Quantidade</th>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">Origem (PO)</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item, idx) => {
                const rowId = `${item.poId}-${item.sku}-${idx}`;
                const isExpanded = expandedRows[rowId];
                return (
                  <React.Fragment key={rowId}>
                    <tr className="border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer" onClick={() => toggleRow(rowId)}>
                      <td className="px-6 py-4">
                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </td>
                      <td className="px-6 py-4 font-medium text-white font-mono">{item.sku}</td>
                      <td className="px-6 py-4">{item.description}</td>
                      <td className="px-6 py-4 font-bold text-kingstar-green">{item.expectedQuantity}</td>
                      <td className="px-6 py-4">{item.supplier}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{item.poId}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#121214] border-b border-zinc-800">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs uppercase mb-1">Ordem de Compra (NF)</p>
                              <p className="text-white font-medium">{item.poId}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase mb-1">Fornecedor</p>
                              <p className="text-white font-medium">{item.supplier}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase mb-1">Produto</p>
                              <p className="text-white font-medium">{item.description}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase mb-1">Qtd Peças</p>
                              <p className="text-white font-medium">{item.expectedQuantity}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase mb-1">Placa do Veículo</p>
                              <p className="text-white font-medium">{item.licensePlate}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase mb-1">Tipo de Veículo</p>
                              <p className="text-white font-medium">{item.vehicleType}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {stockItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum item no estoque.
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
