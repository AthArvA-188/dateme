import DateProposalWizard from './components/DateProposalWizard';

export default function App() {
  return (
    <main className="min-h-screen bg-rose-50/80 text-slate-900 flex items-center justify-center font-sans antialiased overflow-x-hidden selection:bg-rose-200 selection:text-rose-900 relative">
      {/* Soft romantic ambient glow */}
      <div className="fixed inset-0 pointer-events-none flex justify-center overflow-hidden z-0">
        <div className="absolute top-[-10%] -left-10 w-[60vw] max-w-2xl aspect-square bg-pink-300/30 blur-[100px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] -right-10 w-[60vw] max-w-2xl aspect-square bg-rose-300/30 blur-[100px] rounded-full mix-blend-multiply" />
        <div className="absolute top-[40%] left-[20%] w-[40vw] max-w-xl aspect-square bg-orange-200/30 blur-[100px] rounded-full mix-blend-multiply" />
      </div>
      
      <div className="relative z-10 w-full">
        <DateProposalWizard />
      </div>
    </main>
  );
}
