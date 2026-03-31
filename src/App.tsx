import { useState, useEffect } from 'react';
import { FileText, TrendingUp, Users, Lock, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import Login from './Login';

// --- 1. THE FOUNDER DASHBOARD COMPONENT ---
function FounderDashboard() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestReport() {
      const { data, error } = await supabase
        .from('founder_reports')
        .select(`*, companies(company_name)`)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (error) console.error("Error fetching data:", error);
      if (data) setReportData(data);
      setIsLoading(false);
    }

    fetchLatestReport();
  }, []);

  if (isLoading) return <div className="p-10 text-slate-500 font-semibold animate-pulse">Fetching live secure data...</div>;
  if (!reportData) return <div className="p-10 text-red-500">No reports found in the database.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Monthly KPI Submission</h1>
        <p className="text-slate-500">Reporting Period: March 2026 • {reportData.companies?.company_name}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-blue-500"/> Financial Health</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cash in Bank (INR)</label>
              <input type="text" readOnly value={`₹${reportData.cash_in_bank_inr.toLocaleString('en-IN')}`} className="w-full border border-slate-300 rounded p-2 bg-slate-50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Net Burn (INR)</label>
              <input type="text" readOnly value={`₹${reportData.monthly_net_burn_inr.toLocaleString('en-IN')}`} className="w-full border border-slate-300 rounded p-2 bg-slate-50 outline-none" />
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Calculated Runway:</span>
              <span className="font-bold text-emerald-600">{reportData.calculated_runway_months} Months</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 2. THE MAIN APP COMPONENT (WITH SECURITY) ---
export default function App() {
  const [activeTab, setActiveTab] = useState('memo');
  const [session, setSession] = useState<any>(null);

 useEffect(() => {
    // Added ': any' to the response to satisfy TypeScript
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
    });

    const {
      data: { subscription },
    // Added ': any' to _event and session
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // THE LOCK: If no session, show Login screen
  if (!session) {
    return <Login />;
  }

  // IF LOGGED IN: Show the Dashboard
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
            <Lock className="w-5 h-5 mr-2 text-blue-400" />
            Enlighten OS
          </h1>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          <button onClick={() => setActiveTab('memo')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'memo' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <FileText className="w-5 h-5 mr-3" /> IC Memo
          </button>
          <button onClick={() => setActiveTab('founder')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'founder' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <TrendingUp className="w-5 h-5 mr-3" /> Founder KPIs
          </button>
          <button onClick={() => setActiveTab('lp')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'lp' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5 mr-3" /> LP Portal
          </button>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'memo' && <div className="p-10 text-slate-500">IC Memo Content (Static)</div>}
          {activeTab === 'founder' && <FounderDashboard />}
          {activeTab === 'lp' && <div className="p-10 text-slate-500">LP Portal Content (Static)</div>}
        </div>
      </main>
    </div>
  );
}