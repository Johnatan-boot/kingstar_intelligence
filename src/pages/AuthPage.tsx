import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Recebimento');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isRegister, setIsRegister] = useState(false);

  async function handleSubmit() {
    try {
      if (isRegister) {
        await register(email, department, role, password);
        navigate('/');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || 'Erro na autenticação');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 w-full">
      <div
        className="
          w-full max-w-md p-6 rounded-xl
          bg-zinc-950
          border border-zinc-800
          shadow-2xl
          shadow-black/40
          backdrop-blur-sm
          flex flex-col items-center text-center gap-4
        "
      >
        {/* LOGO */}
        <img
          className="h-20 w-20"
          src="data:image/png;base64,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"
          alt="KingStar Logo"
        />

        {/* TEXTOS */}
        <div className="w-full">
          <h1 className="text-xl font-semibold text-white">Inteligência Operacional</h1>
          <p className="text-zinc-400 text-sm">Sistema de Inteligência Operacional</p>
        </div>

        {/* INPUT EMAIL */}
        <div className="w-full text-left">
          <label className="text-zinc-400 text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full mt-1 p-2 rounded-md bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-kingstar-cyan"
            placeholder="name@example.com"
          />
        </div>

        {/* INPUT SENHA */}
        <div className="w-full text-left">
          <label className="text-zinc-400 text-sm">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full mt-1 p-2 rounded-md bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-kingstar-cyan"
            placeholder="••••••••"
          />
        </div>

        {isRegister && (
          <>
            {/* DEPARTAMENTO */}
            <div className="w-full text-left">
              <label className="text-zinc-400 text-sm">Departamento</label>
              <select
                value={department}
                onChange={(e) => {
                  const newDept = e.target.value;
                  setDepartment(newDept);
                  if (newDept === 'Diretoria') setRole('admin');
                }}
                className="w-full mt-1 p-2 rounded-md bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-kingstar-cyan"
              >
                <option value="Compras">Compras</option>
                <option value="Recebimento">Recebimento</option>
                <option value="Conferência">Conferência</option>
                <option value="Estoque">Estoque</option>
                <option value="Diretoria">Diretoria</option>
              </select>
            </div>

            {/* PERFIL */}
            <div className="w-full text-left">
              <label className="text-zinc-400 text-sm">Perfil</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                disabled={department === 'Diretoria'}
                className="w-full mt-1 p-2 rounded-md bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-kingstar-cyan disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="user">Funcionário</option>
                <option value="admin">Gestor / Diretoria</option>
              </select>
            </div>
          </>
        )}

        {/* BOTÕES */}
        <button
          onClick={handleSubmit}
          className="w-full bg-kingstar-cyan hover:bg-[#0ea5e9] text-black font-semibold py-2 rounded-md transition mt-4"
        >
          {isRegister ? 'Cadastrar' : 'Entrar'}
        </button>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm text-zinc-400 hover:text-white transition"
        >
          {isRegister ? 'Já tenho conta' : 'Criar conta'}
        </button>
      </div>
    </div>
  );
}
