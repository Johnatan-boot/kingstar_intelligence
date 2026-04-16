import { useState, useEffect } from "react";
import {
  History as HistoryIcon,
  Search,
  Package,
  Truck,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import BalanceScore from "../components/BalanceScore";

interface HistoryRecord {
  poId: string;
  nf?: string;
  supplier: string;
  date: string;
  items: { sku: string; description: string; expectedQuantity: number }[];
  receiving: {
    licensePlate: string;
    vehicleType: string;
    startTime: string;
    endTime: string;
  } | null;
  conference: {
    totalPieces: number;
    checkedPieces: number;
    damages: number;
    startTime: string;
    endTime: string;
  } | null;
}

export default function History() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
    fetchAnalytics();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleCancel = async (poId: string) => {
    if (
      !window.confirm(
        "Tem certeza que deseja cancelar esta NF/Pedido? Ele voltará para o status inicial e sairá do histórico.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/history/${poId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Erro ao cancelar");
      toast.success("NF cancelada com sucesso!");
      fetchHistory(); // Refresh list
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      toast.error("Erro ao cancelar NF");
    }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.nf &&
        record.nf.toLowerCase().includes(searchTerm.toLowerCase())) ||
      record.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.receiving?.licensePlate
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HistoryIcon className="text-kingstar-cyan" />
            Histórico de NFs Concluídas
          </h1>
          <p className="text-gray-400 mt-1">
            Registro permanente de todas as mercadorias recebidas e conferidas.
          </p>
        </div>
      </div>

      {analytics && (
        <BalanceScore
          completedNFs={Number(analytics?.metrics?.totalCompletedNFs) || 0}
          cancelledNFs={Number(analytics?.metrics?.totalCancelledNFs) || 0}
          rejectedLoads={Number(analytics?.metrics?.totalRejectedLoads) || 0}
        />
      )}

      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por NF, Pedido, Fornecedor ou Placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-kingstar-cyan"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">
            Carregando histórico...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <HistoryIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Nenhum registro encontrado.</p>
            <p className="text-sm mt-1">
              As NFs aparecerão aqui após serem finalizadas no Estoque.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const totalExpected = record.items.reduce(
                (sum, item) => sum + item.expectedQuantity,
                0,
              );

              return (
                <div
                  key={record.poId}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    {/* Info Principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> CONCLUÍDO
                        </span>
                        <h3 className="text-lg font-bold text-white">
                          {record.nf
                            ? `NF: ${record.nf}`
                            : `Pedido: ${record.poId}`}
                        </h3>
                        {record.nf && (
                          <span className="text-sm text-gray-500">
                            ({record.poId})
                          </span>
                        )}
                        <span className="text-kingstar-cyan font-medium">
                          {record.supplier}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>
                            Data NF:{" "}
                            {new Date(record.date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {record.receiving && (
                          <div className="flex items-center gap-2">
                            <Truck size={16} />
                            <span>
                              Veículo: {record.receiving.licensePlate} (
                              {record.receiving.vehicleType})
                            </span>
                          </div>
                        )}
                        {record.conference ? (
                          <div className="flex items-center gap-2 col-span-2 text-gray-300">
                            <Package
                              size={16}
                              className="text-kingstar-yellow"
                            />
                            <span>
                              Recebido:{" "}
                              <strong className="text-white">
                                {record.conference.checkedPieces}
                              </strong>{" "}
                              peças (Esperado: {record.conference.totalPieces})
                              {record.conference.damages > 0 && (
                                <span className="text-red-400 ml-2">
                                  • {record.conference.damages} avarias
                                </span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 col-span-2 text-gray-300">
                            <Package size={16} className="text-gray-500" />
                            <span>
                              Total de Peças na NF:{" "}
                              <strong className="text-white">
                                {totalExpected}
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lista de Itens e Ações */}
                    <div className="lg:w-1/3 flex flex-col gap-3">
                      <div className="bg-[#0a0a0a] rounded-lg p-3 border border-zinc-800 flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase">
                            Itens da NF
                          </h4>
                          <span className="text-xs text-kingstar-cyan font-bold">
                            {totalExpected} peças total
                          </span>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                          {record.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-sm"
                            >
                              <span
                                className="text-gray-300 truncate pr-2"
                                title={item.description}
                              >
                                <span className="text-gray-500 mr-2">
                                  {item.sku}
                                </span>
                                {item.description}
                              </span>
                              <span className="text-white font-medium bg-zinc-800 px-2 py-0.5 rounded">
                                {item.expectedQuantity} un
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancel(record.poId)}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors text-sm font-medium"
                      >
                        <XCircle size={16} />
                        Cancelar NF
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
                  {record.receiving?.endTime && record.conference?.endTime && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Chegada:{" "}
                        {new Date(record.receiving.startTime).toLocaleString(
                          "pt-BR",
                        )}
                      </span>
                      <span>→</span>
                      <span>
                        Fim Descarga:{" "}
                        {new Date(record.receiving.endTime).toLocaleString(
                          "pt-BR",
                        )}
                      </span>
                      <span>→</span>
                      <span>
                        Fim Conferência:{" "}
                        {new Date(record.conference.endTime).toLocaleString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
