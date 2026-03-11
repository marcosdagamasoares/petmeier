import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  ChevronRight,
  PawPrint,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Eye,
  EyeOff,
  Globe,
  Headphones,
  ExternalLink,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// --- Types ---
type Page = 'landing' | 'login' | 'booking';

const BookingPage = ({ onBack }: { onBack: () => void }) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const services = [
    { id: 'banho', name: 'Banho', desc: 'Limpeza completa com produtos premium', icon: <PawPrint /> },
    { id: 'tosa', name: 'Tosa', desc: 'Corte estético ou higiênico especializado', icon: <ShoppingCart /> },
    { id: 'vet', name: 'Veterinário', desc: 'Consulta de rotina ou emergência', icon: <User /> },
    { id: 'spa', name: 'Pet Spa', desc: 'Hidratação e massagem relaxante', icon: <Globe /> },
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar logado para agendar um serviço.');
      }

      const { error: dbError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: session.user.id,
            service: selectedService,
            date: date,
            time: time,
            status: 'pendente'
          }
        ]);

      if (dbError) throw dbError;

      setConfirmed(true);
    } catch (err: any) {
      console.error('Erro ao agendar:', err);
      setError(err.message || 'Ocorreu um erro ao salvar seu agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-900">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-500/10 rounded-full text-green-500 mb-2">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Agendamento Solicitado!</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Sua solicitação para <strong>{selectedService}</strong> foi enviada. Entraremos em contato em breve para confirmar.
          </p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-all font-sans"
          >
            Voltar para o Início
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans"
    >
      <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="space-y-4">
            <button onClick={onBack} className="text-cyan-500 font-bold flex items-center gap-2 hover:underline mb-8">
              <ChevronRight className="w-5 h-5 rotate-180" /> Voltar
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">Agende um <span className="text-cyan-500">Serviço</span></h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Escolha o melhor horário para o seu melhor amigo.</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-10">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 text-orange-600 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">1. Selecione o Serviço</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedService(s.name)}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedService === s.name 
                      ? 'border-cyan-500 bg-cyan-500/5' 
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                      selectedService === s.name ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {s.icon}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{s.name}</h4>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">2. Data</h3>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-cyan-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. Horário</h3>
                <input
                  required
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-cyan-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              disabled={loading || !selectedService}
              type="submit"
              className="w-full h-16 bg-cyan-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : "Confirmar Agendamento"}
            </button>
          </form>
        </div>
      </div>
      
      <div className="hidden lg:block w-1/3 bg-cyan-500/5 border-l border-slate-200 dark:border-slate-800 p-12">
        <div className="sticky top-32 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Por que agendar no Méier?</h3>
            <ul className="space-y-6">
              {[
                "Profissionais certificados",
                "Ambiente climatizado e monitorado",
                "Produtos biodegradáveis premium",
                "Relatório digital pós-serviço"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-cyan-500 p-8 rounded-3xl text-white">
            <h4 className="font-bold mb-2">Dúvidas?</h4>
            <p className="text-sm opacity-90 mb-4">Fale com nossa equipe pelo WhatsApp para agendamentos especiais.</p>
            <button className="w-full py-3 bg-white text-cyan-500 font-bold rounded-xl hover:bg-opacity-90 transition-all">
              Chamar no Zap
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Components ---

const Header = ({
  onNavigate,
  currentPage,
  user,
  onSignOut
}: {
  onNavigate: (p: Page) => void,
  currentPage: Page,
  user: SupabaseUser | null,
  onSignOut: () => void
}) => (
  <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-20 py-4 sticky top-0 z-50">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-3 text-cyan-500 cursor-pointer" onClick={() => onNavigate('landing')}>
        <PawPrint className="w-8 h-8" />
        <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">PetShop Méier</h2>
      </div>
      <nav className="hidden lg:flex items-center gap-8">
        <a className="text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors text-sm font-semibold cursor-pointer" onClick={() => onNavigate('landing')}>Produtos</a>
        <a className="text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors text-sm font-semibold cursor-pointer" onClick={() => onNavigate('booking')}>Banho e Tosa</a>
        <a className="text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors text-sm font-semibold cursor-pointer" onClick={() => onNavigate('booking')}>Veterinário</a>
      </nav>
    </div>
    <div className="flex flex-1 justify-end gap-4 items-center">
      <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64">
        <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800">
          <div className="text-slate-500 flex items-center justify-center pl-3">
            <Search className="w-5 h-5" />
          </div>
          <input
            className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-500 px-3 outline-none"
            placeholder="Buscar produtos..."
          />
        </div>
      </label>
      <div className="flex gap-2">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-500">Olá,</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{user.email}</span>
            </div>
            <button
              onClick={onSignOut}
              className="p-2 text-slate-500 hover:text-orange-500 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('login')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentPage === 'login' ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-white hover:opacity-90'
              }`}
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Entrar</span>
          </button>
        )}
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ShoppingCart className="w-5 h-5" />
          <span className="hidden sm:inline">Carrinho</span>
        </button>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 md:px-20 py-16">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-cyan-500">
          <PawPrint className="w-8 h-8" />
          <h2 className="text-slate-900 dark:text-white text-xl font-bold">PetShop Méier</h2>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">
          Cuidando dos pets do Méier com amor e dedicação desde 2010. Sua confiança é a nossa maior recompensa.
        </p>
        <div className="flex gap-4">
          <a className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-cyan-500 hover:text-white transition-all" href="#">
            <Instagram className="w-5 h-5" />
          </a>
          <a className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-cyan-500 hover:text-white transition-all" href="#">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
      <div>
        <h4 className="text-slate-900 dark:text-white font-bold mb-6">Links Rápidos</h4>
        <ul className="space-y-4">
          <li><a className="text-slate-500 hover:text-cyan-500 transition-colors text-sm" href="#">Sobre Nós</a></li>
          <li><a className="text-slate-500 hover:text-cyan-500 transition-colors text-sm" href="#">Nossos Serviços</a></li>
          <li><a className="text-slate-500 hover:text-cyan-500 transition-colors text-sm" href="#">Trabalhe Conosco</a></li>
          <li><a className="text-slate-500 hover:text-cyan-500 transition-colors text-sm" href="#">Política de Privacidade</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-slate-900 dark:text-white font-bold mb-6">Horário de Funcionamento</h4>
        <ul className="space-y-4">
          <li className="flex justify-between text-sm">
            <span className="text-slate-500">Segunda - Sexta:</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">08:00 - 19:00</span>
          </li>
          <li className="flex justify-between text-sm">
            <span className="text-slate-500">Sábado:</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">09:00 - 16:00</span>
          </li>
          <li className="flex justify-between text-sm">
            <span className="text-slate-500">Domingo:</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Fechado</span>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-slate-900 dark:text-white font-bold mb-6">Localização</h4>
        <div className="space-y-4">
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-cyan-500" />
            <p className="text-slate-500 text-sm">
              Rua Dias da Cruz, 123 - Méier<br />Rio de Janeiro - RJ
            </p>
          </div>
          <div className="flex gap-3">
            <Phone className="w-5 h-5 text-cyan-500" />
            <p className="text-slate-500 text-sm">(21) 3333-4444</p>
          </div>
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-cyan-500" />
            <p className="text-slate-500 text-sm">contato@petshopmeier.com.br</p>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-slate-400 text-xs">© 2024 PetShop Méier. Todos os direitos reservados.</p>
      <div className="flex gap-6">
        <ShoppingCart className="w-6 h-6 text-slate-300" />
        <Globe className="w-6 h-6 text-slate-300" />
      </div>
    </div>
  </footer>
);

const LandingPage = ({ onNavigate, user }: { onNavigate: (p: Page) => void, user: SupabaseUser | null }) => {
  const products = [
    {
      id: 1,
      name: "Ração Premium Cães Adultos",
      desc: "Nutrição completa 15kg",
      price: "189,90",
      discount: "-15%",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVPFND0nz90ckEffd5FTRm53Vz7einR8XxaGOTiFfT-uTe-28UTcknqE9Lp2xHksvM1_rGCgxAmelO2VWurayVwm3NEtbDCW94fbwfGAaMxZj2QxA1mxEBp7etda25Wej2ToNDR5CG44w3X32ltc5mDyLbwSdRwoMHORm-KyVqYppFkWMdirH-GoZqt73c9uM4lF2UnnJSxy2otp2my8JHLzGwpuVJvTvCl6NDAUDElYVc-un5FmzwXUJtosWMvA-1O_0YOpNzggc0"
    },
    {
      id: 2,
      name: "Brinquedo Mordedor Interativo",
      desc: "Resistente e atóxico",
      price: "45,00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBb464Z5FmMa-PUydG57MU86iqptPTDzo-maFzUPFJXESQtwvy9ggpyc9gd9sNL4_4I1O6Fi3QiPhGDlzgrkbmLBXjAAyOsudH0vfaK7fNzk7LILs1kt-oJZ3vwxlR_S4hGijMJidRv0cwLYefjLRfi5ApSgCenZ5jd8IsYZUMDM4nnVa6S14hBxJQjbAqKE6jnyUZNPDA9x4ZC-dLzS7x__MFGsfs_2Y5Ln39FOifbtKZFarsdFIsf9Ef9rfTkll2n8uJE9XeDTEtk"
    },
    {
      id: 3,
      name: "Cama Soft Conforto G",
      desc: "Lavável e ultra macia",
      price: "120,00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbD2-2b8MmkVyVQZIfUklib0ZG1w2ttavw_1Sr-fyGE4xPsvUnlQQYZESAVxHa0tl8FcArHCJGJjjG9-Yphz9WZHvn5YATjodTd1RFkWfEPK8vL36ZizQauYh7OlGhDxz9yEIHPcQtv2mnIe706emo1wrw51omBihvO4LYIhhIFOady6lyeNL-MEajp70Qnjv_A3V-D05S46WI2Q8KERFI9Lj4W4WP5FqVs8TckJP0in18kxJW-fTDq5WskX4ZX3W2dmbBhFmJTV6A"
    },
    {
      id: 4,
      name: "Coleira Couro Ecológico",
      desc: "Diversas cores disponíveis",
      price: "79,90",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHE5o06AJNEKvHSTIuuu8EAzcYGA_A_l2Dyj0sUU8fIPNRn6wiCUuB4g4ZDVBdJnQsilrKXVXn-45i00EXv88xjzFN7fVQ86hNIl3azWD752XRLDZuD7msyoxuJrICG2LfJx9Uzdl6jrFocZcTQqBj0wZrGrytrLEptKmN9AzFbrbHi_ucHzwVwIChookPZzVRX0wzpjndatLcZ9Qv1iQR1BtRV3XBq5J-65fubMkBojQbWptAdnGdW-b1wBuARJ_0SRBklL0-z0oc"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1"
    >
      <section className="px-6 md:px-20 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            <div className="flex-1 p-8 md:p-16 flex flex-col justify-center gap-8">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold tracking-widest uppercase">Unidade Méier</span>
                <h1 className="text-slate-900 dark:text-white text-4xl md:text-6xl font-black leading-tight tracking-tight">
                  O melhor cuidado para o seu pet no <span className="text-cyan-500">Méier</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md">
                  Serviços especializados de banho, tosa e veterinária, além dos melhores produtos para quem você mais ama.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => onNavigate(user ? 'booking' : 'login')} className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform">
                  Agendar Serviço
                </button>
                <button className="px-8 py-4 bg-white dark:bg-slate-800 border-2 border-cyan-500 text-cyan-500 font-bold rounded-xl text-lg hover:bg-cyan-500/5 transition-colors">
                  Ver Ofertas
                </button>
              </div>
            </div>
            <div
              className="flex-1 min-h-[400px] bg-center bg-cover relative group"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBrY5lbGMor2_Mh5JmtxJrRG2Ws2DCWL_w7HUuCKTzBzFRZvlhdOUhYA09W8r2fso9WqxjpXvltQdqOK-LMRxtkAj5ZchlF5b1tr6ZGNCUvcmufpaJpoeJy8vy3adPYRnc_o4_Rs3gitr4PozUkDvVRt656gDw19j0KTWoCpLiXbfZ7Ednv8VE6JjnoV44zoeVpojGxZ32bn_BbDXc_pmKtaAZeAw9oHKMMU5gR76Icx5WyYWXF9iEgCBoEFZW4pjmkinGxzivQlDDs")' }}
            >
              <a
                href="https://lh3.googleusercontent.com/aida-public/AB6AXuBrY5lbGMor2_Mh5JmtxJrRG2Ws2DCWL_w7HUuCKTzBzFRZvlhdOUhYA09W8r2fso9WqxjpXvltQdqOK-LMRxtkAj5ZchlF5b1tr6ZGNCUvcmufpaJpoeJy8vy3adPYRnc_o4_Rs3gitr4PozUkDvVRt656gDw19j0KTWoCpLiXbfZ7Ednv8VE6JjnoV44zoeVpojGxZ32bn_BbDXc_pmKtaAZeAw9oHKMMU5gR76Icx5WyYWXF9iEgCBoEFZW4pjmkinGxzivQlDDs"
                target="_blank"
                rel="noreferrer"
                className="absolute top-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Ver imagem original"
              >
                <ExternalLink className="w-5 h-5 text-slate-900" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-20 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-slate-900 dark:text-white text-3xl font-bold mb-2">Produtos em Destaque</h2>
            <p className="text-slate-500">As melhores marcas com entrega rápida no Méier</p>
          </div>
          <a className="text-cyan-500 font-bold flex items-center gap-1 hover:underline" href="#">
            Ver tudo <ChevronRight className="w-5 h-5" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:shadow-xl transition-shadow">
              <div className="relative w-full aspect-square rounded-xl bg-slate-100 overflow-hidden mb-4">
                <div
                  className="absolute inset-0 bg-center bg-cover group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url("${p.img}")` }}
                />
                {p.discount && (
                  <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded">{p.discount}</span>
                )}
                <a
                  href={p.img}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Ver imagem original"
                >
                  <ExternalLink className="w-4 h-4 text-slate-900" />
                </a>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold mb-1">{p.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{p.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-slate-900 dark:text-white">R$ {p.price}</span>
                <button className="p-2 bg-cyan-500/10 text-cyan-500 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

const LoginPage = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess();
        onBack();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    alert('Login com Google em desenvolvimento! Por favor, utilize e-mail e senha para acessar.');
  };

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-900">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-500/10 rounded-full text-green-500 mb-2">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Confirme seu e-mail</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Enviamos um link de confirmação para <strong>{email}</strong>. Por favor, verifique sua caixa de entrada para ativar sua conta.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setIsSignUp(false);
            }}
            className="w-full py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-all"
          >
            Ir para Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col md:flex-row"
    >
      <div className="hidden md:flex flex-1 bg-cyan-500/10 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-full aspect-square bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 overflow-hidden relative group">
            <img
              alt="Friendly Dog"
              className="object-cover w-full h-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ88e_bCqmw1zROkKQ-pLzoDlMbgen_DIfOOhqVSVhtpQDszLDZtqZKPuzvHVaX2JkvDPqz1RIA5UWIhByGGGCEaiw1SJ5AWvl64fa5uufA-RiNjNveLDD4MAmVCcrEivMO4XrgpfYsrwouCDxnVdaSsoeber9iVu4m8EfhRHxc_JNZShYs6ZHdngnjS2VRLIiL-1nYjDQZino51_JKRaTD2uhZGvUTNW6Wf5Wa6asXjH1ykSJOyW4noZylk0aahvoSTLq4Qia1OYU"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent"></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
            {isSignUp ? 'Crie sua conta!' : 'Bem-vindo de volta!'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {isSignUp ? 'Junte-se à nossa comunidade e dê o melhor para seu pet.' : 'Seu pet sentiu sua falta. Entre para conferir as novidades.'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-slate-900">
        <div className="w-full max-w-[440px] flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
              {isSignUp ? 'Criar conta' : 'Acesse sua conta'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              {isSignUp ? 'Preencha os dados abaixo para se cadastrar.' : 'Entre para cuidar do seu melhor amigo.'}
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleAuth}>
            {error && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 text-orange-600 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-slate-100 text-sm font-semibold">E-mail</label>
              <input
                required
                className="flex w-full rounded-lg text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-14 placeholder:text-slate-400 p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                placeholder="seuemail@exemplo.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Senha</label>
                {!isSignUp && (
                  <a className="text-orange-500 text-xs font-semibold hover:underline" href="#">Esqueci minha senha</a>
                )}
              </div>
              <div className="relative flex w-full items-stretch">
                <input
                  required
                  minLength={6}
                  className="flex w-full rounded-lg text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-14 placeholder:text-slate-400 p-4 pr-12 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                  placeholder="No mínimo 6 caracteres"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg h-14 bg-cyan-500 text-white text-base font-bold tracking-wide hover:bg-cyan-600 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                isSignUp ? 'Cadastrar' : 'Entrar'
              )}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
              <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">ou</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-lg h-14 border-2 border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-200 text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Entrar com o Google
            </button>
          </form>

          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'} {' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-cyan-500 font-bold hover:underline"
              >
                {isSignUp ? 'Faça login' : 'Crie agora'}
              </button>
            </p>
            <button
              onClick={onBack}
              className="mt-4 text-slate-400 text-xs hover:text-cyan-500 transition-colors"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setPage('landing');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <Header
        onNavigate={setPage}
        currentPage={page}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {page === 'landing' ? (
            <div key="landing" className="flex-1 flex flex-col">
              <LandingPage onNavigate={setPage} user={user} />
            </div>
          ) : page === 'booking' ? (
            <div key="booking" className="flex-1 flex flex-col">
              <BookingPage onBack={() => setPage('landing')} />
            </div>
          ) : (
            <div key="login" className="flex-1 flex flex-col">
              <LoginPage
                onBack={() => setPage('landing')}
                onSuccess={() => setPage('booking')}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <a
          href="#"
          className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg text-slate-500 hover:text-cyan-500 transition-all"
          title="Suporte"
        >
          <Headphones className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
