import { useState } from 'react';
import { 
  ChevronDown, Link2, BarChart3, Users, 
  Search, Globe, Calendar, ArrowRight, 
  Sparkles, Check, Copy, RefreshCw, 
  QrCode, Eye, Percent, Plus, X, Laptop,
  HelpCircle, Settings, Play, Shield, Terminal
} from 'lucide-react';

export default function AdminTest() {
  const [activeTab, setActiveTab] = useState('links'); // 'links', 'analytics', 'affiliate'
  const [copied, setCopied] = useState(false);
  const [destinationUrl, setDestinationUrl] = useState('https://acme.com/blog/introducing-our-new-product');
  const [shortKey, setShortKey] = useState('product-launch');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`dub.sh/${shortKey}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-[9999] font-sans antialiased text-[#1F2937]" style={{ backgroundColor: '#F3F4F6' }}>
      {/* Grid Background Effect */}
      <div className="absolute inset-0 top-0 h-[800px] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <svg viewBox="0 0 100 100" className="w-6 h-6 fill-black">
                <path d="M50 15C30.7 15 15 30.7 15 50s15 35 35 35 35-15 35-35-15-35-35-35zm0 60C36.2 75 25 63.8 25 50s11.2-25 25-25 25 11.2 25 25-11.2 25-25 25z" />
                <circle cx="50" cy="50" r="12" />
              </svg>
              <span className="font-extrabold text-xl tracking-tight text-black">dub</span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <div className="flex items-center gap-1 cursor-pointer hover:text-black transition-colors">
                Product <ChevronDown className="w-4 h-4 opacity-70" />
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-black transition-colors">
                Solutions <ChevronDown className="w-4 h-4 opacity-70" />
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-black transition-colors">
                Resources <ChevronDown className="w-4 h-4 opacity-70" />
              </div>
              <span className="cursor-pointer hover:text-black transition-colors">Enterprise</span>
              <span className="cursor-pointer hover:text-black transition-colors">Customers</span>
              <span className="cursor-pointer hover:text-black transition-colors">Pricing</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-1.5">
              Log in
            </button>
            <button className="text-sm font-bold bg-black text-white hover:bg-neutral-800 transition-colors px-4 py-2 rounded-full shadow-sm">
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero wrapper — full-width white so it contrasts with gray below */}
      <div style={{ backgroundColor: '#FFFFFF', width: '100%' }}>
      <main className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center flex flex-col items-center">
        {/* Banner Announcement */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm text-xs font-semibold text-gray-600 hover:border-gray-300 transition-all cursor-pointer mb-8 shadow-sm">
          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-800">Introducing Dub Partners</span>
          <span className="text-gray-400">|</span>
          <span className="flex items-center gap-1">Read more <ArrowRight className="w-3 h-3" /></span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-black max-w-3xl leading-[1.1] mb-6">
          Turn clicks into revenue
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl font-medium leading-relaxed mb-10">
          Dub is the modern link attribution platform for short links, conversion tracking, and affiliate programs.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-black hover:bg-neutral-800 transition-all text-white shadow-lg shadow-black/10">
            Start for free
          </button>
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm transition-all">
            Get a demo
          </button>
        </div>
      </main>
      </div> {/* end hero white wrapper */}

      {/* Gray section — full width gray, white "stalactite" pocket at top center */}
      <section style={{ backgroundColor: '#F3F4F6', width: '100%', position: 'relative', paddingTop: '0' }}>

        {/* White stalactite pocket — soft elliptical curve, hangs from hero above */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '760px',
          height: '80px',
          backgroundColor: '#FFFFFF',
          /* Elliptical curve: wide horizontal radius, shorter vertical → very soft */
          borderRadius: '0 0 50% 50% / 0 0 100% 100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}>
          {/* Short Links Tab */}
          <button
            onClick={() => setActiveTab('links')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 24px', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: activeTab === 'links' ? '#111827' : '#9CA3AF',
              transition: 'color 0.15s ease',
            }}
          >
            <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Link2 style={{ width: '10px', height: '10px', color: 'white', strokeWidth: 2.5 }} />
            </span>
            Short Links
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '18px', backgroundColor: '#E5E7EB', flexShrink: 0 }} />

          {/* Conversion Analytics Tab */}
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 24px', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: activeTab === 'analytics' ? '#111827' : '#9CA3AF',
              transition: 'color 0.15s ease',
            }}
          >
            <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BarChart3 style={{ width: '10px', height: '10px', color: 'white', strokeWidth: 2.5 }} />
            </span>
            Conversion Analytics
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '18px', backgroundColor: '#E5E7EB', flexShrink: 0 }} />

          {/* Affiliate Programs Tab */}
          <button
            onClick={() => setActiveTab('affiliate')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 24px', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: activeTab === 'affiliate' ? '#111827' : '#9CA3AF',
              transition: 'color 0.15s ease',
            }}
          >
            <span style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles style={{ width: '10px', height: '10px', color: 'white', strokeWidth: 2.5 }} />
            </span>
            Affiliate Programs
          </button>
        </div>

        {/* Spacer so dashboard starts below the white stalactite */}
        <div style={{ height: '96px' }} />

        {/* Dashboard Mockup — in the gray area below the white pocket */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <div className="w-full bg-white rounded-t-2xl border border-gray-200/80 shadow-2xl overflow-hidden text-left relative flex flex-col md:flex-row h-[560px]">
          
          {/* Mockup Sidebar */}
          <aside className="w-48 bg-gray-50 border-r border-gray-100 p-4 hidden md:flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              {/* Logo icon */}
              <div className="flex items-center gap-2 px-2">
                <svg viewBox="0 0 100 100" className="w-5 h-5 fill-black">
                  <path d="M50 15C30.7 15 15 30.7 15 50s15 35 35 35 35-15 35-35-15-35-35-35zm0 60C36.2 75 25 63.8 25 50s11.2-25 25-25 25 11.2 25 25-11.2 25-25 25z" />
                  <circle cx="50" cy="50" r="12" />
                </svg>
                <span className="font-extrabold text-sm text-black">dub</span>
              </div>

              {/* Sidebar Links */}
              <nav className="space-y-1">
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${activeTab === 'links' ? 'bg-gray-200/60 text-black' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}>
                  <Link2 className="w-3.5 h-3.5 text-gray-500" /> Links
                </div>
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${activeTab === 'analytics' ? 'bg-gray-200/60 text-black' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}>
                  <BarChart3 className="w-3.5 h-3.5 text-gray-500" /> Analytics
                </div>
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${activeTab === 'affiliate' ? 'bg-gray-200/60 text-black' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}>
                  <Users className="w-3.5 h-3.5 text-gray-500" /> Affiliates
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-black">
                  <Globe className="w-3.5 h-3.5 text-gray-500" /> Domains
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-black">
                  <Settings className="w-3.5 h-3.5 text-gray-500" /> Settings
                </div>
              </nav>
            </div>
            
            <div className="border-t border-gray-100 pt-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">AC</div>
              <div className="leading-tight">
                <p className="text-[10px] font-bold text-gray-800">Acme Corp</p>
                <span className="text-[8px] text-gray-400 font-semibold">Free Plan</span>
              </div>
            </div>
          </aside>

          {/* Mockup Main Panel */}
          <div className="flex-1 bg-[#FCFCFD] p-6 overflow-hidden flex flex-col relative">
            
            {/* Top row */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 shrink-0">
              <h2 className="text-sm font-black text-gray-900">
                {activeTab === 'links' && 'Short Links'}
                {activeTab === 'analytics' && 'Conversion Analytics'}
                {activeTab === 'affiliate' && 'Affiliate Program Dashboard'}
              </h2>
              <button className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-neutral-800 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Create Link
              </button>
            </div>

            {/* Conditional Tab Rendering */}
            {activeTab === 'links' && (
              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Form simulation inside mockup */}
                <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm max-w-xl">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Create a Short Link
                    </span>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </div>

                  <div className="space-y-4">
                    {/* Destination URL Input */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Destination URL</label>
                      <input
                        type="text"
                        value={destinationUrl}
                        onChange={(e) => setDestinationUrl(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black/20"
                      />
                    </div>

                    {/* Short Link Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Domain</label>
                        <div className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-semibold text-gray-500 flex items-center justify-between cursor-not-allowed">
                          dub.sh <ChevronDown className="w-3 h-3 opacity-60" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Short Key</label>
                        <input
                          type="text"
                          value={shortKey}
                          onChange={(e) => setShortKey(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    {/* Tags & Extras */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Tags</label>
                      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs text-gray-400 flex items-center gap-1">
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Marketing</span>
                        <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Launch</span>
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={copyToClipboard}
                          className="px-3.5 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-250 flex items-center gap-1.5 transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                        <span className="text-[11px] font-bold text-gray-400">dub.sh/{shortKey}</span>
                      </div>
                      <button className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors">
                        Generate Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Analytics graphs mockup */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-gray-400">Total Clicks</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1">12,482</p>
                    <span className="text-[10px] font-bold text-emerald-600 mt-1 block">▲ +24.8% this week</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-gray-400">Conversions</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1">842</p>
                    <span className="text-[10px] font-bold text-emerald-600 mt-1 block">▲ +12.3% this week</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-gray-400">Avg. Click-Through</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1">6.75%</p>
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">▼ -0.2% this week</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-800">Traffic Source / Referring Domains</h3>
                    <span className="text-[10px] font-bold text-gray-400">Past 30 days</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Twitter / X</span>
                        <span>4,812 clicks (38.5%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-150 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '38.5%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>LinkedIn</span>
                        <span>3,410 clicks (27.3%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-150 overflow-hidden">
                        <div className="h-full bg-[#0a66c2]" style={{ width: '27.3%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Direct / Email</span>
                        <span>2,118 clicks (16.9%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-150 overflow-hidden">
                        <div className="h-full bg-gray-600" style={{ width: '16.9%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'affiliate' && (
              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Affiliate program dashboard mockup */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-800 mb-4">Affiliate Revenue</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-gray-900">$4,850.00</span>
                      <span className="text-xs font-bold text-emerald-600">+$1,240.00 (Payout pending)</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-800 mb-4">Total Partners</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-gray-900">48 Partners</span>
                      <span className="text-xs font-bold text-emerald-600">+6 new this month</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-800">Top Performing Partners</h3>
                    <button className="text-[10px] font-bold text-gray-400 hover:text-black">View all</button>
                  </div>
                  <table className="w-full text-left text-xs font-semibold text-gray-600">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 uppercase">
                        <th className="px-5 py-3">Partner Name</th>
                        <th className="px-5 py-3">Referred Clicks</th>
                        <th className="px-5 py-3">Conversions</th>
                        <th className="px-5 py-3">Earned Commissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-black">Alex Rivera</td>
                        <td className="px-5 py-3">1,480</td>
                        <td className="px-5 py-3">142</td>
                        <td className="px-5 py-3 text-emerald-600">$1,420.00</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-black">Sofia Davis</td>
                        <td className="px-5 py-3">950</td>
                        <td className="px-5 py-3">88</td>
                        <td className="px-5 py-3 text-emerald-600">$880.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
