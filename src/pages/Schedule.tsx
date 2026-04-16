import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScheduleItem {
  id: string;
  supplier: string;
  nf: string;
  expectedDate: string;
  status: 'SCHEDULED' | 'ARRIVED' | 'CANCELLED';
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ supplier: '', nf: '', expectedDate: '' });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Erro ao agendar');
      toast.success('Agendamento criado com sucesso!');
      setShowForm(false);
      setFormData({ supplier: '', nf: '', expectedDate: '' });
      fetchSchedules();
    } catch (error) {
      toast.error('Erro ao criar agendamento');
    }
  };

  const handleArrive = async (id: string) => {
    try {
      const res = await fetch(`/api/schedule/${id}/arrive`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao atualizar status');
      toast.success('Status atualizado para Chegou!');
      fetchSchedules();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-kingstar-cyan" />
            Agenda de Recebimento
          </h1>
          <p className="text-gray-400 mt-1">Gerencie os agendamentos de entregas dos fornecedores.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-kingstar-cyan text-black px-4 py-2 rounded-lg font-bold hover:bg-cyan-400 transition-colors flex items-center gap-2"
        >
          {showForm ? <XCircle size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancelar' : 'Novo Agendamento'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Fornecedor</label>
              <input
                required
                type="text"
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-kingstar-cyan"
                placeholder="Nome do fornecedor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nota Fiscal (NF)</label>
              <input
                required
                type="text"
                value={formData.nf}
                onChange={e => setFormData({ ...formData, nf: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-kingstar-cyan"
                placeholder="Número da NF"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Data Esperada</label>
              <input
                required
                type="date"
                value={formData.expectedDate}
                onChange={e => setFormData({ ...formData, expectedDate: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-kingstar-cyan"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-kingstar-cyan text-black px-6 py-2 rounded-lg font-bold hover:bg-cyan-400 transition-colors">
              Salvar Agendamento
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Carregando agenda...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map(schedule => (
              <div key={schedule.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${schedule.status === 'ARRIVED' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {schedule.status === 'ARRIVED' ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{schedule.supplier}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span>NF: {schedule.nf}</span>
                      <span>Data: {new Date(schedule.expectedDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {schedule.status === 'SCHEDULED' ? (
                    <button
                      onClick={() => handleArrive(schedule.id)}
                      className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
                    >
                      Marcar como Chegou
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold">
                      VEÍCULO NO PÁTIO
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
