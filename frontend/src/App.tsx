import { useMetro } from './api/useMetro';

export default function App() {
  const { state, connected } = useMetro();

  const estacaoNorte = state?.estacaoNorte;
  const estacaoCentral = state?.estacaoCentral;
  const proximoTrem = state?.proximoTrem;
  const ultimaAtualizacao = state?.ultimaAtualizacao;

  return (
    <div className='flex flex-col min-h-screen w-full p-6 md:p-8 bg-background-dark text-white font-display'>
      <header className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 md:mb-8'>
        <div className='flex items-center gap-4'>
          <div
            className='bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12'
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDPAYvLIVWNR5XDljjBN9DEttOCVmET_6XmMPianNKZuaIP5pcJJWFyeoEdJJ_VP-pXn5RCdvdNJVPRFusRZdCKR1BA-DH-P5xpteNEvVgwHHPo9CpTEU53kHrpPPfNUZ5NQMvVgXTEbupT0RjRq2oelk7YkLL0f6I53XZ2tXPOiolNXCLUd5X8NbJ7sByAn2CKERo9C5t3jBH5sXerfxN70llHkS6cKWzWRMZss8zctE67gYMhh1Oi3e6A-GYeLlXK9I01-3M76A")',
            }}
          ></div>
          <div className='flex flex-col'>
            <h1 className='text-white text-2xl sm:text-3xl font-bold leading-tight'>
              Painel do Metrô
            </h1>
            <p className='text-[#9dabb9] text-sm sm:text-base font-normal leading-normal'>
              Status em tempo real
            </p>
          </div>
        </div>
        <div className='text-md'>
          {connected ? (
            <span className='text-green-400'>
              <span className='text-3xl mr-2 mb-2 inline-block align-middle'>
                ●
              </span>
              Conectado
            </span>
          ) : (
            <span className='text-red-400'>
              <span className='text-3xl mr-2 mb-2 inline-block align-middle'>
                ●
              </span>
              Desconectado
            </span>
          )}
        </div>
        <div className='flex flex-col items-center sm:items-end'>
          <p className='text-[#9dabb9] text-sm sm:text-base font-normal leading-normal'>
            Última atualização: {ultimaAtualizacao || '---'}
          </p>
        </div>
      </header>

      <main className='flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
        {/* Estação Central */}
        <div className='flex flex-col gap-6 p-6 bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/10 rounded-xl transition-transform duration-300 hover:scale-105'>
          <h2 className='text-white text-2xl font-semibold leading-normal'>
            Estação Central
          </h2>
          <div className='text-center'>
            <p className='text-[#9dabb9] text-lg font-medium leading-normal'>
              Aguardando na plataforma
            </p>
            <p className='text-white tracking-tight text-7xl font-bold leading-none mt-2'>
              {estacaoCentral?.aguardando ?? '---'}
            </p>
          </div>
          <div className='text-center mt-auto pt-4 border-t border-white/10'>
            <p className='text-[#9dabb9] text-lg font-medium leading-normal'>
              Total de passageiros hoje
            </p>
            <p className='text-white tracking-tight text-5xl font-bold leading-none mt-2'>
              {estacaoCentral?.totalHoje ?? '---'}
            </p>
          </div>
        </div>

        {/* Próximo Trem */}
        <div className='flex flex-col gap-6 p-6 bg-primary/20 border border-primary/50 rounded-xl transition-transform duration-300 hover:scale-105'>
          <h2 className='text-white text-2xl font-semibold leading-normal text-center'>
            Próximo Trem
          </h2>
          <div className='flex-grow flex flex-col justify-center items-center text-center'>
            <span className='material-symbols-outlined text-8xl text-primary'>
              train
            </span>
            <p className='text-[#9dabb9] text-lg font-medium leading-normal mt-4'>
              Ocupação (ocupado/total)
            </p>
            <p className='text-white tracking-tight text-7xl font-bold leading-none mt-2'>
              {proximoTrem?.ocupados ?? '---'}/{proximoTrem?.total ?? '---'}
            </p>
          </div>
        </div>

        {/* Estação Norte */}
        <div className='flex flex-col gap-6 p-6 bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/10 rounded-xl transition-transform duration-300 hover:scale-105'>
          <h2 className='text-white text-2xl font-semibold leading-normal'>
            Estação Norte
          </h2>
          <div className='text-center'>
            <p className='text-[#9dabb9] text-lg font-medium leading-normal'>
              Aguardando na plataforma
            </p>
            <p className='text-white tracking-tight text-7xl font-bold leading-none mt-2'>
              {estacaoNorte?.aguardando ?? '---'}
            </p>
          </div>
          <div className='text-center mt-auto pt-4 border-t border-white/10'>
            <p className='text-[#9dabb9] text-lg font-medium leading-normal'>
              Total de passageiros hoje
            </p>
            <p className='text-white tracking-tight text-5xl font-bold leading-none mt-2'>
              {estacaoNorte?.totalHoje ?? '---'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
