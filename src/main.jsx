import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, BarChart3, BookOpen, Brain, Calculator, Camera, ChevronRight,
  CircleDollarSign, Eye, Feather, ImagePlus, LayoutDashboard, Menu, Plus,
  Save, ShieldCheck, Sparkles, Target, Trash2, TrendingDown, TrendingUp,
  Upload, WalletCards, X, Zap
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import './styles.css';

const STORAGE_KEY = 'new-age-trader-v1';

const seed = {
  trades: [
    { id: 1, date: '2026-08-14', symbol: 'RELIANCE', side: 'Long', entry: 1462, exit: 1498, sl: 1440, target: 1510, qty: 20, strategy: 'Breakout', notes: 'Waited for volume confirmation.', image: '' },
    { id: 2, date: '2026-08-12', symbol: 'HDFCBANK', side: 'Long', entry: 1992, exit: 1978, sl: 1975, target: 2035, qty: 15, strategy: 'Pullback', notes: 'Entered before candle close.', image: '' },
    { id: 3, date: '2026-08-08', symbol: 'TCS', side: 'Short', entry: 3120, exit: 3076, sl: 3145, target: 3060, qty: 8, strategy: 'Reversal', notes: 'Clean rejection at resistance.', image: '' }
  ],
  holdings: [
    { id: 1, symbol: 'ICICIBANK', qty: 45, avg: 1264, price: 1428 },
    { id: 2, symbol: 'BHFL', qty: 300, avg: 112, price: 96 },
    { id: 3, symbol: 'NIFTYBEES', qty: 150, avg: 238, price: 271 }
  ],
  mistakes: [
    { id: 1, date: '2026-08-12', category: 'Early Entry', title: 'Did not wait for confirmation', lesson: 'Enter only after candle closes above the trigger level.', severity: 'Medium' },
    { id: 2, date: '2026-08-05', category: 'FOMO', title: 'Chased a gap-up', lesson: 'If price is >1 ATR from the setup, skip the trade.', severity: 'High' }
  ],
  analyses: [],
  checklist: { setup: true, sl: true, sizing: false, rr: true, calm: true }
};

const nav = [
  ['dashboard', LayoutDashboard, 'Dashboard'], ['risk', Calculator, 'Risk Calculator'],
  ['journal', BookOpen, 'Trading Journal'], ['portfolio', WalletCards, 'My Portfolio'],
  ['mistakes', Target, 'Trading Mistakes'], ['analysis', BarChart3, 'Chart Analysis'],
  ['psychology', Brain, 'Psychology']
];

const psychology = [
  { icon: Target, topic: 'Entry', quote: 'The elements of good trading are: cutting losses, cutting losses, and cutting losses.', by: 'Ed Seykota', learn: 'Entry se pehle invalidation level decide karo. Setup unclear ho toh no trade bhi ek position hai.' },
  { icon: ShieldCheck, topic: 'Stop Loss', quote: 'Letting losses run is the most serious mistake made by most investors.', by: 'William O’Neil', learn: 'SL ko hope ke basis par widen mat karo. Trade invalid hote hi capital protect karo.' },
  { icon: CircleDollarSign, topic: 'Risk Management', quote: 'Never risk more than you can afford to lose.', by: 'Bruce Kovner', learn: 'Har trade par fixed capital risk rakho; quantity ko emotion nahi, calculator decide kare.' },
  { icon: Zap, topic: 'Discipline', quote: 'Plan your trade and trade your plan.', by: 'Common trading maxim', learn: 'Pre-trade checklist complete kiye bina order mat place karo. Process score P&L se zyada important hai.' },
  { icon: Activity, topic: 'FOMO', quote: 'There is always another trade.', by: 'Market wisdom', learn: 'Missed trade loss nahi hai. Chased trade aksar poor risk-reward deta hai—alert set karo, chase nahi.' },
  { icon: Feather, topic: 'Patience', quote: 'The big money is not in the buying and selling, but in the waiting.', by: 'Charlie Munger', learn: 'A-grade setup ka wait karo. Frequency kam ho sakti hai, quality compromise nahi honi chahiye.' }
];

const inr = (n, digits = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: digits }).format(Number(n) || 0);
const today = () => new Date().toISOString().slice(0, 10);
const fileToData = file => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });
const calcPnl = t => (Number(t.exit) - Number(t.entry)) * Number(t.qty) * (t.side === 'Short' ? -1 : 1);

function App() {
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seed; } catch { return seed; }
  });
  const [page, setPage] = useState('dashboard');
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2500); return () => clearTimeout(t); }, [toast]);
  const notify = text => setToast(text);

  const pnl = data.trades.reduce((s, t) => s + calcPnl(t), 0);
  const wins = data.trades.filter(t => calcPnl(t) > 0).length;
  const invested = data.holdings.reduce((s, h) => s + h.qty * h.avg, 0);
  const current = data.holdings.reduce((s, h) => s + h.qty * h.price, 0);

  const navigate = id => { setPage(id); setMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = (key, id) => setData(d => ({ ...d, [key]: d[key].filter(x => x.id !== id) }));

  return <div className="app-shell">
    <Sidebar page={page} navigate={navigate} open={menu} close={() => setMenu(false)} />
    <main>
      <header className="topbar">
        <button className="icon-btn mobile-only" onClick={() => setMenu(true)}><Menu /></button>
        <div><span className="eyebrow">THE NEW AGE TRADER</span><h1>{nav.find(n => n[0] === page)?.[2]}</h1></div>
        <div className="market-pill"><span className="live-dot" /> MARKET MINDSET: CALM</div>
      </header>
      {page === 'dashboard' && <Dashboard data={data} pnl={pnl} wins={wins} invested={invested} current={current} navigate={navigate} setData={setData} />}
      {page === 'risk' && <RiskCalculator notify={notify} />}
      {page === 'journal' && <Journal trades={data.trades} onAdd={() => setModal('trade')} remove={id => remove('trades', id)} />}
      {page === 'portfolio' && <Portfolio holdings={data.holdings} invested={invested} current={current} onAdd={() => setModal('holding')} remove={id => remove('holdings', id)} />}
      {page === 'mistakes' && <Mistakes items={data.mistakes} onAdd={() => setModal('mistake')} remove={id => remove('mistakes', id)} />}
      {page === 'analysis' && <Analysis items={data.analyses} setData={setData} notify={notify} remove={id => remove('analyses', id)} />}
      {page === 'psychology' && <Psychology />}
    </main>
    {modal === 'trade' && <TradeModal close={() => setModal(null)} save={x => { setData(d => ({ ...d, trades: [x, ...d.trades] })); setModal(null); notify('Trade journal mein save ho gaya'); }} />}
    {modal === 'holding' && <HoldingModal close={() => setModal(null)} save={x => { setData(d => ({ ...d, holdings: [x, ...d.holdings] })); setModal(null); notify('Holding add ho gayi'); }} />}
    {modal === 'mistake' && <MistakeModal close={() => setModal(null)} save={x => { setData(d => ({ ...d, mistakes: [x, ...d.mistakes] })); setModal(null); notify('Lesson saved — repeat nahi karna hai'); }} />}
    {toast && <div className="toast"><Sparkles size={17} />{toast}</div>}
  </div>;
}

function Sidebar({ page, navigate, open, close }) {
  return <><aside className={open ? 'sidebar open' : 'sidebar'}>
    <button className="icon-btn sidebar-close mobile-only" onClick={close}><X /></button>
    <div className="brand"><div className="brand-mark">NT</div><div><strong>New Age</strong><small>TRADER'S DESK</small></div></div>
    <div className="nav-label">WORKSPACE</div>
    <nav>{nav.map(([id, Icon, label]) => <button key={id} onClick={() => navigate(id)} className={page === id ? 'active' : ''}><Icon size={19} /><span>{label}</span><ChevronRight className="chevron" size={15} /></button>)}</nav>
    <div className="sidebar-card"><Feather size={22} /><p>Protect the downside.</p><span>The upside will take care of itself.</span></div>
    <div className="profile"><div className="avatar">DI</div><div><strong>Dhruvin</strong><small>Disciplined Trader</small></div></div>
  </aside>{open && <div className="scrim" onClick={close} />}</>;
}

function Dashboard({ data, pnl, wins, invested, current, navigate, setData }) {
  const winRate = data.trades.length ? Math.round(wins / data.trades.length * 100) : 0;
  const portPnl = current - invested;
  const chart = [...data.trades].reverse().map((t, i, a) => ({ name: `T${i + 1}`, pnl: a.slice(0, i + 1).reduce((s, x) => s + calcPnl(x), 0) }));
  const checklist = [
    ['setup', 'Setup matches my strategy'], ['sl', 'Stop loss is technically valid'],
    ['sizing', 'Position size is calculated'], ['rr', 'Risk : Reward is at least 1:2'], ['calm', 'I am calm, not chasing']
  ];
  return <div className="page">
    <section className="hero"><div><span className="kicker"><Sparkles size={14}/> YOUR TRADING SANCTUARY</span><h2>Trade the plan.<br/><em>Not the noise.</em></h2><p>A mindful command center for deliberate decisions, protected capital, and compounding lessons.</p></div><button className="primary" onClick={() => navigate('risk')}><Calculator size={18}/> Calculate a Trade</button></section>
    <div className="metric-grid">
      <Metric icon={CircleDollarSign} label="Trading P&L" value={inr(pnl)} tone={pnl >= 0 ? 'green' : 'red'} note="From closed journal trades" />
      <Metric icon={Target} label="Win Rate" value={`${winRate}%`} note={`${wins} wins · ${data.trades.length - wins} losses`} />
      <Metric icon={WalletCards} label="Portfolio Value" value={inr(current)} tone={portPnl >= 0 ? 'green' : 'red'} note={`${portPnl >= 0 ? '+' : ''}${inr(portPnl)} overall`} />
      <Metric icon={BookOpen} label="Journal Entries" value={data.trades.length} note="Keep documenting the process" />
    </div>
    <div className="dashboard-grid">
      <section className="card performance-card"><CardHead title="Performance Curve" subtitle="Cumulative realised P&L" icon={TrendingUp}/><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><defs><linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b35f3d" stopOpacity={.35}/><stop offset="100%" stopColor="#b35f3d" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfd6c8"/><XAxis dataKey="name" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false} width={48}/><Tooltip formatter={v => inr(v)}/><Area type="monotone" dataKey="pnl" stroke="#a85434" strokeWidth={3} fill="url(#pnlFill)"/></AreaChart></ResponsiveContainer></div></section>
      <section className="card ritual-card"><CardHead title="Pre-Trade Ritual" subtitle="Pause. Check. Then execute." icon={ShieldCheck}/><div className="checklist">{checklist.map(([key, label]) => <label key={key}><input type="checkbox" checked={!!data.checklist[key]} onChange={() => setData(d => ({ ...d, checklist: { ...d.checklist, [key]: !d.checklist[key] } }))}/><span>{label}</span></label>)}</div><div className="ritual-score"><span>Readiness</span><strong>{Math.round(Object.values(data.checklist).filter(Boolean).length / 5 * 100)}%</strong></div></section>
      <section className="card recent-card"><CardHead title="Recent Trades" subtitle="Latest journal entries" icon={BookOpen} action={() => navigate('journal')}/><div className="mini-table">{data.trades.slice(0, 4).map(t => <div key={t.id}><div><strong>{t.symbol}</strong><small>{t.date} · {t.strategy}</small></div><span className={calcPnl(t) >= 0 ? 'positive' : 'negative'}>{calcPnl(t) >= 0 ? '+' : ''}{inr(calcPnl(t))}</span></div>)}</div></section>
      <section className="quote-card"><span>RULE OF THE DAY</span><blockquote>“Your first job is to protect your capital. Your second job is to follow your process.”</blockquote><p>— Your trading desk</p></section>
    </div>
  </div>;
}

function Metric({ icon: Icon, label, value, note, tone }) { return <div className="metric card"><div className="metric-icon"><Icon size={20}/></div><span>{label}</span><strong className={tone === 'green' ? 'positive' : tone === 'red' ? 'negative' : ''}>{value}</strong><small>{note}</small></div>; }
function CardHead({ title, subtitle, icon: Icon, action }) { return <div className="card-head"><div><Icon size={19}/><div><h3>{title}</h3><p>{subtitle}</p></div></div>{action && <button className="text-btn" onClick={action}>View all <ChevronRight size={15}/></button>}</div>; }

function RiskCalculator({ notify }) {
  const [f, setF] = useState({ capital: 500000, risk: 1, entry: 1250, sl: 1225, target: 1300 });
  const riskAmount = f.capital * f.risk / 100;
  const perShare = Math.abs(f.entry - f.sl);
  const qty = perShare > 0 ? Math.floor(riskAmount / perShare) : 0;
  const position = qty * f.entry;
  const reward = Math.abs(f.target - f.entry) * qty;
  const rr = riskAmount > 0 ? reward / riskAmount : 0;
  return <div className="page narrow"><PageTitle kicker="CAPITAL PRESERVATION" title="Risk & Quantity Calculator" desc="Pehle risk decide karo, phir quantity. Kabhi ulta nahi."/>
    <div className="calculator-shell">
      <section className="card form-card"><CardHead title="Trade Parameters" subtitle="Enter your planned levels" icon={Calculator}/><div className="form-grid">
        <Field label="Trading Capital (₹)" type="number" value={f.capital} onChange={v => setF({...f, capital:+v})}/>
        <Field label="Risk per Trade (%)" type="number" step="0.1" value={f.risk} onChange={v => setF({...f, risk:+v})}/>
        <Field label="Entry Price (₹)" type="number" value={f.entry} onChange={v => setF({...f, entry:+v})}/>
        <Field label="Stop Loss (₹)" type="number" value={f.sl} onChange={v => setF({...f, sl:+v})}/>
        <Field label="Target Price (₹)" type="number" value={f.target} onChange={v => setF({...f, target:+v})}/>
      </div><div className="risk-slider"><span>Risk comfort</span><input type="range" min="0.1" max="3" step="0.1" value={f.risk} onChange={e => setF({...f, risk:+e.target.value})}/><div><span>Conservative 0.5%</span><span>Aggressive 3%</span></div></div></section>
      <section className="result-card"><span className="kicker"><ShieldCheck size={15}/> CALCULATED POSITION</span><div className="qty"><small>BUY QUANTITY</small><strong>{qty}</strong><span>shares</span></div><div className="result-grid"><div><span>Capital at Risk</span><strong>{inr(riskAmount)}</strong></div><div><span>Risk / Share</span><strong>{inr(perShare)}</strong></div><div><span>Position Value</span><strong>{inr(position)}</strong></div><div><span>Risk : Reward</span><strong className={rr >= 2 ? 'positive' : 'negative'}>1 : {rr.toFixed(2)}</strong></div></div><div className={position > f.capital ? 'warning' : 'safe'}>{position > f.capital ? '⚠ Position value exceeds your capital. Use available leverage only if planned.' : '✓ Position fits within available capital.'}</div><button className="light-button" onClick={() => notify('Trade size copied mentally — execute only after checklist')}>Lock this plan <Save size={17}/></button></section>
    </div>
    <div className="formula-note"><Brain/><div><strong>Why this works</strong><p>Quantity = (Capital × Risk %) ÷ |Entry − Stop Loss|. A wider stop automatically reduces quantity, keeping rupee risk constant.</p></div></div>
  </div>;
}

function Journal({ trades, onAdd, remove }) {
  const [search, setSearch] = useState('');
  const shown = trades.filter(t => `${t.symbol} ${t.strategy}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page"><PageTitle kicker="YOUR TRADING MEMORY" title="Trading Journal" desc="Har trade ek data point hai. Result ke saath decision bhi record karo." action="Log New Trade" onAction={onAdd}/><div className="toolbar"><input placeholder="Search symbol or strategy…" value={search} onChange={e => setSearch(e.target.value)}/><span>{shown.length} trades</span></div><div className="trade-list">{shown.map(t => <article className="trade-card card" key={t.id}>{t.image ? <img src={t.image} alt={`${t.symbol} chart`}/> : <div className="chart-placeholder"><BarChart3/><span>No chart</span></div>}<div className="trade-body"><div className="trade-title"><div><span className={`side ${t.side.toLowerCase()}`}>{t.side}</span><h3>{t.symbol}</h3></div><button className="delete" onClick={() => remove(t.id)}><Trash2 size={16}/></button></div><p className="trade-meta">{t.date} · {t.strategy}</p><div className="trade-levels"><span>Entry<strong>{inr(t.entry)}</strong></span><span>Exit<strong>{inr(t.exit)}</strong></span><span>SL<strong>{inr(t.sl)}</strong></span><span>Target<strong>{inr(t.target)}</strong></span></div><div className="trade-footer"><p>{t.notes || 'No notes added.'}</p><strong className={calcPnl(t) >= 0 ? 'positive' : 'negative'}>{calcPnl(t) >= 0 ? '+' : ''}{inr(calcPnl(t))}</strong></div></div></article>)}</div>{!shown.length && <Empty icon={BookOpen} text="No matching trades found."/>}</div>;
}

function Portfolio({ holdings, invested, current, onAdd, remove }) {
  const pnl = current - invested;
  const allocation = holdings.map((h, i) => ({ name: h.symbol, value: h.qty * h.price, color: ['#a85434','#477264','#c79746','#6d597a','#5f6b55'][i % 5] }));
  return <div className="page"><PageTitle kicker="LONG-TERM WEALTH" title="My Portfolio" desc="Holdings, cost basis aur unrealised performance ek clean view mein." action="Add Holding" onAction={onAdd}/><div className="portfolio-summary"><Metric icon={CircleDollarSign} label="Total Invested" value={inr(invested)}/><Metric icon={WalletCards} label="Current Value" value={inr(current)}/><Metric icon={pnl >= 0 ? TrendingUp : TrendingDown} label="Overall P&L" value={`${pnl >= 0 ? '+' : ''}${inr(pnl)}`} tone={pnl >= 0 ? 'green':'red'} note={`${invested ? (pnl/invested*100).toFixed(2) : 0}% return`}/></div><div className="portfolio-grid"><section className="card holdings-card"><CardHead title="Current Holdings" subtitle={`${holdings.length} active positions`} icon={WalletCards}/><div className="table-scroll"><table><thead><tr><th>Stock</th><th>Qty</th><th>Avg. Price</th><th>LTP</th><th>Invested</th><th>Current</th><th>P&L</th><th></th></tr></thead><tbody>{holdings.map(h => { const hp=(h.price-h.avg)*h.qty; return <tr key={h.id}><td><strong>{h.symbol}</strong></td><td>{h.qty}</td><td>{inr(h.avg)}</td><td>{inr(h.price)}</td><td>{inr(h.qty*h.avg)}</td><td>{inr(h.qty*h.price)}</td><td className={hp>=0?'positive':'negative'}>{hp>=0?'+':''}{inr(hp)}<small>{((h.price/h.avg-1)*100).toFixed(1)}%</small></td><td><button className="delete" onClick={() => remove(h.id)}><Trash2 size={15}/></button></td></tr>})}</tbody></table></div></section><section className="card allocation"><CardHead title="Allocation" subtitle="By current value" icon={BarChart3}/><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocation} dataKey="value" innerRadius={55} outerRadius={82} paddingAngle={3}>{allocation.map(x => <Cell key={x.name} fill={x.color}/>)}</Pie><Tooltip formatter={v => inr(v)}/></PieChart></ResponsiveContainer><div><strong>{holdings.length}</strong><span>holdings</span></div></div><div className="legend">{allocation.map(x => <div key={x.name}><i style={{background:x.color}}/><span>{x.name}</span><strong>{current ? (x.value/current*100).toFixed(1):0}%</strong></div>)}</div></section></div></div>;
}

function Mistakes({ items, onAdd, remove }) { return <div className="page"><PageTitle kicker="TURN ERRORS INTO EDGE" title="Mistakes & Lessons" desc="Jo mistake document hoti hai, wahi repeat hone se bachti hai." action="Record a Mistake" onAction={onAdd}/><div className="mistake-intro"><div><Brain/><strong>Your mistakes are tuition.</strong><span>Make sure you get the lesson.</span></div><div className="mistake-count"><strong>{items.length}</strong><span>lessons captured</span></div></div><div className="mistake-grid">{items.map(x => <article className="card mistake-card" key={x.id}><div className="mistake-top"><span className={`severity ${x.severity.toLowerCase()}`}>{x.severity}</span><button className="delete" onClick={() => remove(x.id)}><Trash2 size={16}/></button></div><small>{x.date} · {x.category}</small><h3>{x.title}</h3><div className="lesson"><Feather size={17}/><p>{x.lesson}</p></div></article>)}</div>{!items.length && <Empty icon={Target} text="Abhi koi mistake record nahi hai."/>}</div>; }

function Analysis({ items, setData, notify, remove }) {
  const [title, setTitle] = useState(''); const [thesis, setThesis] = useState(''); const [image, setImage] = useState('');
  const upload = async e => { const f=e.target.files[0]; if(f){ if(f.size>1500000){notify('Image 1.5 MB se chhoti rakhein');return;} setImage(await fileToData(f)); } };
  const save = () => { if(!title || !image) return notify('Title aur chart image dono required hain'); setData(d => ({...d, analyses:[{id:Date.now(),date:today(),title,thesis,image},...d.analyses]})); setTitle('');setThesis('');setImage('');notify('Chart analysis saved'); };
  return <div className="page"><PageTitle kicker="BUILD YOUR MARKET EYE" title="Chart Analysis Library" desc="Marked-up charts aur trade thesis ko apni personal playbook mein save karo."/><div className="analysis-layout"><section className="card upload-card"><CardHead title="New Analysis" subtitle="Capture your view before the move" icon={ImagePlus}/><Field label="Analysis title" value={title} onChange={setTitle} placeholder="e.g. NIFTY weekly breakout"/><label className="field"><span>Thesis / key levels</span><textarea value={thesis} onChange={e=>setThesis(e.target.value)} placeholder="Setup, levels, invalidation and expected move…"/></label><label className={image?'dropzone has-image':'dropzone'}>{image?<img src={image} alt="Preview"/>:<><Upload/><strong>Upload chart screenshot</strong><span>PNG/JPG · max 1.5 MB</span></>}<input type="file" accept="image/*" onChange={upload}/></label><button className="primary full" onClick={save}><Save size={17}/> Save Analysis</button></section><section><div className="analysis-gallery">{items.map(x=><article className="analysis-card card" key={x.id}><img src={x.image} alt={x.title}/><div><small>{x.date}</small><h3>{x.title}</h3><p>{x.thesis||'No thesis added.'}</p><button className="delete" onClick={()=>remove(x.id)}><Trash2 size={16}/> Delete</button></div></article>)}</div>{!items.length&&<Empty icon={Camera} text="Aapki chart library abhi empty hai. Pehla analysis upload karein."/>}</section></div></div>;
}

function Psychology() { const [active, setActive] = useState(0); const item=psychology[active]; const Icon=item.icon; return <div className="page"><PageTitle kicker="THE INNER GAME" title="Trading Psychology" desc="Market ko control nahi kar sakte. Apne actions ko kar sakte ho."/><div className="psy-tabs">{psychology.map((x,i)=><button key={x.topic} className={i===active?'active':''} onClick={()=>setActive(i)}><x.icon size={17}/>{x.topic}</button>)}</div><section className="psy-feature"><div className="psy-symbol"><Icon/></div><div><span className="kicker">{item.topic.toUpperCase()}</span><blockquote>“{item.quote}”</blockquote><p className="quote-by">— {item.by}</p><div className="practical"><strong>Practical learning</strong><p>{item.learn}</p></div></div></section><div className="mindset-grid">{psychology.map((x,i)=><button className={`mind-card card ${i===active?'selected':''}`} key={x.topic} onClick={()=>setActive(i)}><x.icon/><span>{x.topic}</span><p>{x.learn}</p></button>)}</div></div>; }

function PageTitle({ kicker, title, desc, action, onAction }) { return <div className="page-title"><div><span className="kicker">{kicker}</span><h2>{title}</h2><p>{desc}</p></div>{action&&<button className="primary" onClick={onAction}><Plus size={18}/>{action}</button>}</div>; }
function Field({ label, value, onChange, ...props }) { return <label className="field"><span>{label}</span><input value={value} onChange={e=>onChange(e.target.value)} {...props}/></label>; }
function Empty({ icon:Icon,text }) { return <div className="empty"><Icon/><p>{text}</p></div>; }

function Modal({ title, subtitle, close, children, save }) { return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-btn" onClick={close}><X/></button></div>{children}<div className="modal-actions"><button className="secondary" onClick={close}>Cancel</button><button className="primary" onClick={save}><Save size={17}/>Save</button></div></div></div>; }

function TradeModal({ close, save }) {
  const [f,setF]=useState({date:today(),symbol:'',side:'Long',entry:'',exit:'',sl:'',target:'',qty:'',strategy:'',notes:'',image:''});
  const submit=()=>{if(!f.symbol||!f.entry||!f.exit||!f.qty)return;save({...f,id:Date.now(),symbol:f.symbol.toUpperCase(),entry:+f.entry,exit:+f.exit,sl:+f.sl,target:+f.target,qty:+f.qty});};
  const upload=async e=>{const file=e.target.files[0];if(file&&file.size<1500000)setF({...f,image:await fileToData(file)});};
  return <Modal title="Log a Trade" subtitle="Record the plan, execution and lesson." close={close} save={submit}><div className="form-grid modal-grid"><Field label="Date" type="date" value={f.date} onChange={v=>setF({...f,date:v})}/><Field label="Symbol *" value={f.symbol} onChange={v=>setF({...f,symbol:v})} placeholder="RELIANCE"/><label className="field"><span>Direction</span><select value={f.side} onChange={e=>setF({...f,side:e.target.value})}><option>Long</option><option>Short</option></select></label><Field label="Quantity *" type="number" value={f.qty} onChange={v=>setF({...f,qty:v})}/><Field label="Entry *" type="number" value={f.entry} onChange={v=>setF({...f,entry:v})}/><Field label="Exit *" type="number" value={f.exit} onChange={v=>setF({...f,exit:v})}/><Field label="Stop Loss" type="number" value={f.sl} onChange={v=>setF({...f,sl:v})}/><Field label="Target" type="number" value={f.target} onChange={v=>setF({...f,target:v})}/><Field label="Strategy" value={f.strategy} onChange={v=>setF({...f,strategy:v})} placeholder="Breakout / Pullback"/></div><label className="field"><span>Notes & learning</span><textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></label><label className="file-line"><ImagePlus size={18}/><span>{f.image?'Chart attached':'Attach chart screenshot'}</span><input type="file" accept="image/*" onChange={upload}/></label></Modal>;
}
function HoldingModal({close,save}) { const[f,setF]=useState({symbol:'',qty:'',avg:'',price:''}); const submit=()=>{if(!f.symbol||!f.qty||!f.avg||!f.price)return;save({id:Date.now(),symbol:f.symbol.toUpperCase(),qty:+f.qty,avg:+f.avg,price:+f.price});}; return <Modal title="Add Holding" subtitle="Enter current position details." close={close} save={submit}><div className="form-grid"><Field label="Symbol *" value={f.symbol} onChange={v=>setF({...f,symbol:v})}/><Field label="Quantity *" type="number" value={f.qty} onChange={v=>setF({...f,qty:v})}/><Field label="Average Price *" type="number" value={f.avg} onChange={v=>setF({...f,avg:v})}/><Field label="Current Price *" type="number" value={f.price} onChange={v=>setF({...f,price:v})}/></div></Modal>; }
function MistakeModal({close,save}) { const[f,setF]=useState({date:today(),category:'FOMO',title:'',lesson:'',severity:'Medium'}); const submit=()=>{if(!f.title||!f.lesson)return;save({...f,id:Date.now()});}; return <Modal title="Record a Mistake" subtitle="Be honest, specific and constructive." close={close} save={submit}><div className="form-grid"><Field label="Date" type="date" value={f.date} onChange={v=>setF({...f,date:v})}/><label className="field"><span>Category</span><select value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{['FOMO','Early Entry','Late Exit','Oversizing','Moved SL','Revenge Trading','Ignored Setup'].map(x=><option key={x}>{x}</option>)}</select></label><label className="field"><span>Severity</span><select value={f.severity} onChange={e=>setF({...f,severity:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label><Field label="What happened? *" value={f.title} onChange={v=>setF({...f,title:v})}/></div><label className="field"><span>Lesson / new rule *</span><textarea value={f.lesson} onChange={e=>setF({...f,lesson:e.target.value})}/></label></Modal>; }

createRoot(document.getElementById('root')).render(<App />);
