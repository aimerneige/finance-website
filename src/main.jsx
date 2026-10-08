import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'mdui/mdui.css';
import 'mdui/components/button.js';
import 'mdui/components/button-icon.js';
import { setTheme } from 'mdui/functions/setTheme.js';
import { setColorScheme } from 'mdui/functions/setColorScheme.js';
import { compound, savingsMonths, mortgage, presentValue } from './finance.js';
import './style.css';

const paths = { home: '首页', formulas: '公式探索', compound: '复利计算器', savings: '储蓄目标计算器', mortgage: '房贷计算器', present: '现值折算计算器' };
const money = n => Number.isFinite(n) ? new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(n) : '超出计算范围';
function Icon({ name, size = 22, ...props }) {
  const shapes = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/></>,
    book: <><path d="M12 5v15M3 4c3-1 6 0 9 2 3-2 6-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2Z"/></>,
    chart: <><path d="M4 4v16h17M8 14l4-5 4 3 5-7"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    house: <><path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    moon: <path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/></>,
    search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></>,
    leaf: <><path d="M20 3C8 2 3 7 5 15c8 4 16-1 15-12ZM4 21 15 10"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></>,
    github: <path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.3-2-1-2 4-.5 7-2 7-6 0-2-.5-3-1.5-4 .3-1.3.3-2.7-.2-4-2 0-3 1-4 1.5a14 14 0 0 0-6.6 0C7 3 6 2 4 2c-.5 1.3-.5 2.7-.2 4C3 7 2.5 8 2.5 10c0 4 3 5.5 7 6-.7.5-1 1.5-1 2v4"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{shapes[name] || shapes.chart}</svg>;
}
const formulas = [
  { id: 'simple', title: '单利', en: 'Simple interest', category: '利息与增长', icon: 'chart', color: 'green', formula: 'I = P × r × t', description: '只有本金产生利息，增长像走楼梯一样稳定。', fields: [['本金', 10000, '元'], ['年利率', 5, '%'], ['时间', 3, '年']], calc: ([p,r,t]) => p*r/100*t, result: '获得利息', note: 'P 是本金，r 是年利率，t 是年数。利息不会再次生息。' },
  { id: 'compound', title: '复利', en: 'Compound interest', category: '利息与增长', icon: 'chart', color: 'green', formula: 'FV = PV × (1 + r)ⁿ', description: '让利息也赚取利息，感受时间带来的力量。', fields: [['本金',10000,'元'],['年利率',5,'%'],['时间',10,'年']], calc: ([p,r,t]) => compound(p,r/100,t,1), result: '未来价值', note: 'PV 是当前本金，FV 是未来价值。这里假设每年复利一次。' },
  { id: 'present', title: '现值', en: 'Present value', category: '货币时间价值', icon: 'clock', color: 'blue', formula: 'PV = FV ÷ (1 + r)ⁿ', description: '未来的 100 元，今天究竟值多少钱？', fields: [['未来金额',10000,'元'],['折现率',5,'%'],['时间',5,'年']], calc: ([p,r,t]) => presentValue(p,r/100,t), result: '今天的价值', note: '用折现率把未来的钱换算成今天的钱，折现率越高，现值越小。' },
  { id: 'annuity', title: '年金终值', en: 'Future value of an annuity', category: '储蓄与贷款', icon: 'target', color: 'orange', formula: 'FV = A × [(1 + r)ⁿ − 1] ÷ r', description: '每期存一点，看看小习惯能积累多少。', fields: [['每年存款',12000,'元'],['年利率',5,'%'],['时间',10,'年']], calc: ([a,r,n]) => r===0?a*n:a*Math.expm1(n*Math.log1p(r/100))/(r/100), result: '累计金额', note: 'A 是每期存款。假设每年年末存入，按年复利。' },
  { id: 'loan', title: '等额本息', en: 'Equal monthly payment', category: '储蓄与贷款', icon: 'house', color: 'purple', formula: 'M = P × r(1 + r)ⁿ ÷ [(1 + r)ⁿ − 1]', description: '每个月还一样多的钱，房贷是怎么算的？', fields: [['贷款本金',1000000,'元'],['年利率',3.5,'%'],['贷款期限',30,'年']], calc: ([p,r,t]) => t>=1&&Number.isInteger(t)?mortgage(p,r/100,t).payment:NaN, result: '每月还款', note: '公式中的 r 是月利率，n 是总月数。期限须为 1–100 的整年数，不含税费。' },
  { id: 'real', title: '实际收益率', en: 'Real rate of return', category: '收益与风险', icon: 'chart', color: 'pink', formula: 'r实际 = (1 + r名义) ÷ (1 + i) − 1', description: '扣掉通货膨胀，你的钱真的变多了吗？', fields: [['名义收益率',5,'%'],['通胀率',2,'%']], calc: ([r,i]) => ((1+r/100)/(1+i/100)-1)*100, result: '实际收益率', unit: '%', note: 'i 是通胀率。实际收益率衡量购买力的变化，而不是账户数字的变化。' },
  { id: 'roi', title: '投资回报率', en: 'Return on investment', category: '收益与风险', icon: 'chart', color: 'pink', formula: 'ROI = (收益 − 成本) ÷ 成本 × 100%', description: '投入与收回之间，算清每一份回报。', fields: [['总收回金额',12000,'元'],['投入成本',10000,'元']], calc: ([a,b]) => b===0?NaN:(a-b)/b*100, result: '投资回报率', unit: '%', note: '这里收益指总收回金额。成本必须大于零；该指标不考虑持有时间。' },
  { id: 'double', title: '72 法则', en: 'Rule of 72', category: '利息与增长', icon: 'clock', color: 'blue', formula: '翻倍时间 ≈ 72 ÷ 年收益率', description: '一个心算小技巧，估算资产翻倍的时间。', fields: [['年收益率',6,'%']], calc: ([r]) => r===0?Infinity:72/r, result: '预计翻倍时间', unit: '年', note: '年收益率直接用百分数代入。这只是正收益率下的粗略估算，不是保证。' },
  { id: 'growth', title: '年化增长率', en: 'Compound annual growth rate', category: '收益与风险', icon: 'leaf', color: 'green', formula: 'CAGR = (期末 ÷ 期初)¹/ⁿ − 1', description: '把多年增长，换算成每年的平均增长速度。', fields: [['期初金额',10000,'元'],['期末金额',15000,'元'],['时间',5,'年']], calc: ([a,b,n]) => a===0||n===0?NaN:((b/a)**(1/n)-1)*100, result: '年化增长率', unit: '%', note: '期初金额和时间必须大于零。假设期间没有额外存入或取出。' },
];
const tools = [
  { id: 'compound', title: '复利计算器', description: '看看你的钱，如何随着时间慢慢长大。', icon: 'chart', color: 'green', tag: '让时间成为朋友' },
  { id: 'savings', title: '多久能存到目标？', description: '从每月的一小笔开始，离梦想更近一点。', icon: 'target', color: 'orange', tag: '给梦想一个日期' },
  { id: 'mortgage', title: '房贷计算器', description: '比较两种还款方式，让每月支出心中有数。', icon: 'house', color: 'purple', tag: '算清每一笔还款' },
  { id: 'present', title: '现值折算计算器', description: '把未来的钱，换算成今天的价值。', icon: 'clock', color: 'blue', tag: '理解钱的时间价值' },
];
function Button({ children, href, onClick, variant = 'filled', ...props }) { return <mdui-button variant={variant} href={href} onClick={onClick} {...props}>{children}</mdui-button>; }
function HeroArt() {
  return <div className="hero-art" aria-hidden="true"><div className="art-grid"/><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-label"><span className="tiny-dot"/> 每一点成长，都算数</div><svg viewBox="0 0 370 240" className="art-chart"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#79ae82" stopOpacity=".25"/><stop offset="1" stopColor="#79ae82" stopOpacity="0"/></linearGradient></defs><path d="M30 196C95 192 104 164 151 152S235 113 260 91 299 49 337 24V220H30Z" fill="url(#area)"/><path d="M30 196C95 192 104 164 151 152S235 113 260 91 299 49 337 24" fill="none" stroke="#438365" strokeWidth="3" strokeLinecap="round"/><circle cx="260" cy="91" r="6" fill="#438365" stroke="#eaf2e8" strokeWidth="4"/></svg><div className="growth-bubble"><Icon name="chart" size={19}/> + 更好的未来</div><div className="art-bars"><i/><i/><i/><i/><i/></div><div className="coin coin-one">¥</div><div className="coin coin-two">¥</div><div className="seed"><Icon name="leaf" size={37}/></div></div>;
}
function FormulaCard({ item, onOpen }) { return <button className="formula-card" onClick={() => onOpen(item)}><div className="card-top"><span className={`icon-box ${item.color}`}><Icon name={item.icon}/></span><span className="category">{item.category}</span></div><h3>{item.title}<span>{item.en}</span></h3><div className="equation">{item.formula}</div><p>{item.description}</p><div className="card-link">动手试一试 <Icon name="arrow" size={17}/></div></button>; }
function SectionTitle({ eyebrow, title, subtitle, link, href }) { return <div className="section-title"><div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{link&&<a href={href}>{link} <Icon name="arrow" size={17}/></a>}</div>; }
function ToolCards() { return <div className="tools-grid">{tools.map(tool => <a href={`#/${tool.id}`} className="tool-card" key={tool.id}><span className={`icon-box large ${tool.color}`}><Icon name={tool.icon} size={26}/></span><div><h3>{tool.title}</h3><p>{tool.description}</p><span className="tool-tag">{tool.tag}</span></div><span className="tool-arrow"><Icon name="arrow"/></span></a>)}</div>; }
function Home({ onOpen }) { return <><div className="page-intro"><span className="eyebrow">一点知识，一点改变</span><span className="intro-right"><span className="tiny-dot"/> 为每一个金融初学者而设计</span></div><section className="hero"><div className="hero-copy"><span className="hero-kicker"><Icon name="leaf" size={15}/> 让金融知识，走进日常生活</span><h1>认识金钱，<br/>从一个<span>小公式</span>开始。</h1><p>金融不必复杂。用简单的公式和交互工具，<br className="desktop-break"/>理解利息、储蓄与贷款，做更从容的生活决策。</p><div className="hero-actions"><Button href="#/formulas">开始探索公式 <Icon name="arrow" size={18}/></Button><a href="#calculators">试试计算器 <span>↗</span></a></div><div className="hero-footnote"><Icon name="check" size={15}/> 零基础友好 <span>·</span> 免费使用 <span>·</span> 无需注册</div></div><HeroArt/></section><div className="principles"><span><Icon name="book" size={19}/><b>先理解，再计算</b><small>用生活的语言解释金融</small></span><span><Icon name="chart" size={19}/><b>动手试，才有感觉</b><small>调整数字，看见变化</small></span><span><Icon name="leaf" size={19}/><b>小知识，大有用</b><small>把所学带回日常生活</small></span></div><section className="section"><SectionTitle eyebrow="THE BASICS" title="常见公式，一点就懂" subtitle="不用背下来。试着改变数字，看看背后的规律。" link="查看全部公式" href="#/formulas"/><div className="formula-grid">{formulas.slice(0,6).map(item=><FormulaCard key={item.id} item={item} onOpen={onOpen}/>)}</div></section><section className="section" id="calculators"><SectionTitle eyebrow="YOUR FINANCIAL TOOLKIT" title="把知识，变成自己的答案" subtitle="从一个具体的问题开始，让计算为你带来清晰。"/><ToolCards/></section><div className="learning-note"><span className="icon-box green"><Icon name="book"/></span><div><h3>不用急着成为专家，每次懂一点就好。</h3><p>这里的计算基于简化假设，用于学习与参考。真实决策，还需要结合实际情况。</p></div><span className="note-leaf"><Icon name="leaf" size={39}/></span></div></>; }
function FormulaPage({ onOpen }) { const [category,setCategory]=useState('全部公式'); const [search,setSearch]=useState(''); const selected=formulas.filter(f=>(category==='全部公式'||f.category===category)&&`${f.title} ${f.en} ${f.description}`.toLowerCase().includes(search.toLowerCase())); return <><PageHeading title="常见公式，一点就懂" description="从钱的时间价值到投资回报，找到你想理解的那个小公式。"/><div className="formula-toolbar"><div className="filters">{['全部公式','利息与增长','货币时间价值','储蓄与贷款','收益与风险'].map(c=><button key={c} className={c===category?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="search"><Icon name="search" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索公式…" aria-label="搜索公式"/></label></div><div className="results-count">共 {selected.length} 个公式 · 点击卡片，动手试一试</div><div className="formula-grid">{selected.map(f=><FormulaCard key={f.id} item={f} onOpen={onOpen}/>)}</div>{selected.length===0&&<p className="empty">没有找到相关公式，试试其他关键词。</p>}<div className="learning-note"><Icon name="info"/><p>公式中的利率通常使用小数：5% = 0.05。年利率与月利率、年数与月数需要使用一致的时间单位。</p></div></>; }
function PageHeading({ title, description }) { return <><div className="breadcrumb"><a href="#/home">首页</a><span>/</span>{title}</div><div className="page-heading"><span className="eyebrow">LEARN BY DOING</span><h1>{title}</h1><p>{description}</p></div></>; }
function Field({ label, value, onChange, unit, min=0, max=1e12, step='any' }) { return <label className="field"><span>{label}</span><div><input type="number" value={value} min={min} max={max} step={step} required onChange={e=>onChange(e.target.value===''?'':Number(e.target.value))}/><span>{unit}</span></div></label>; }
function FormulaModal({ item, close }) { const [values,setValues]=useState(item.fields.map(f=>f[1])); const limit=unit=>unit==='元'?1e12:100; const valid=values.every((v,i)=>v!==''&&Number.isFinite(v)&&v>=0&&v<=limit(item.fields[i][2])); const result=valid?item.calc(values):NaN; useEffect(()=>{const handler=e=>{if(e.key==='Escape')close();};document.addEventListener('keydown',handler);const previous=document.activeElement;document.getElementById('modal-close')?.focus();return()=>{document.removeEventListener('keydown',handler);previous?.focus();};},[]); return <div className="modal-backdrop" onClick={close}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Tab'){const focusable=e.currentTarget.querySelectorAll('button,input');const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}><button id="modal-close" className="close" aria-label="关闭公式" onClick={close}>×</button><span className={`icon-box ${item.color}`}><Icon name={item.icon}/></span><h2 id="modal-title">{item.title}</h2><p>{item.description}</p><div className="equation big">{item.formula}</div><div className="modal-fields">{item.fields.map(([label,,unit],i)=><Field key={label} label={label} unit={unit} max={limit(unit)} value={values[i]} onChange={v=>setValues(a=>a.map((x,k)=>k===i?v:x))}/>)}</div><div className="mini-result" aria-live="polite"><span>{item.result}</span><strong>{Number.isFinite(result)?money(result):'请输入有效数值'} <small>{Number.isFinite(result)?item.unit||'元':''}</small></strong></div><p className="modal-note"><Icon name="info" size={17}/>{item.note}</p></section></div>; }
function Chart({ series, labels=['现在','未来'], legend='账户总额' }) { const max=Math.max(...series.map(s=>Math.max(s.value,s.base||0)),1); const pos=(v,i)=>`${44+i/(series.length-1)*556},${180-v/max*145}`; const line=series.map((s,i)=>pos(s.value,i)).join(' '); const base=series.map((s,i)=>pos(s.base||0,i)).join(' ');return <div className="chart"><div className="chart-heading"><b>看见时间的力量</b><span><i/>{legend}<i className="base"/>投入本金</span></div><svg viewBox="0 0 640 220" role="img" aria-label={`${legend}随时间的变化趋势`}><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#579578" stopOpacity=".25"/><stop offset="1" stopColor="#579578" stopOpacity=".02"/></linearGradient></defs>{[0,1,2,3].map(i=><g key={i}><line x1="44" x2="600" y1={35+i*48.3} y2={35+i*48.3} stroke="var(--border)" strokeDasharray="4 4"/><text x="0" y={39+i*48.3}>{money(max*(3-i)/3/10000)}万</text></g>)}<polygon points={`44,180 ${line} 600,180`} fill="url(#chart-fill)"/><polyline points={base} fill="none" stroke="#a6b8ae" strokeWidth="2" strokeDasharray="5 4"/><polyline points={line} fill="none" stroke="#438365" strokeWidth="3" strokeLinejoin="round"/><text x="44" y="208">{labels[0]}</text><text x="600" y="208" textAnchor="end">{labels[1]}</text></svg></div>; }
function Calculator({ type }) {
  const tool=tools.find(t=>t.id===type);
  const initial=type==='compound'?{principal:10000,rate:5,years:10,frequency:12}:type==='savings'?{principal:10000,deposit:2000,rate:3,target:100000}:type==='mortgage'?{principal:1000000,rate:3.5,years:30,method:'annuity'}:{future:100000,rate:5,years:10};
  const [values,setValues]=useState(initial); const [table,setTable]=useState(false); const [showAll,setShowAll]=useState(false);
  const set=(key,value)=>setValues(v=>({...v,[key]:value}));
  const valid=Object.entries(values).every(([k,v])=>k==='method'||(v!==''&&Number.isFinite(v)&&v>=0&&v<=(k==='years'?100:k==='rate'?100:1e12)))&&(type!=='mortgage'||(values.years>=1&&Number.isInteger(values.years)));
  let total=0, invested=0, months=0, loan=null, series=[];
  if(valid){
    if(type==='compound'){invested=values.principal;total=compound(values.principal,values.rate/100,values.years,values.frequency);series=Array.from({length:21},(_,i)=>({value:compound(values.principal,values.rate/100,values.years*i/20,values.frequency),base:invested}));}
    if(type==='savings'){months=savingsMonths(values.principal,values.deposit,values.rate/100,values.target);const n=Math.min(months,12000);const r=values.rate/1200;const balance=t=>values.principal*(1+r)**t+(r===0?values.deposit*t:values.deposit*Math.expm1(t*Math.log1p(r))/r);invested=values.principal+values.deposit*n;total=balance(n);series=Array.from({length:21},(_,i)=>({value:balance(n*i/20),base:values.principal+values.deposit*n*i/20}));}
    if(type==='mortgage'){loan=mortgage(values.principal,values.rate/100,values.years,values.method);total=loan.total;invested=values.principal;series=Array.from({length:21},(_,i)=>({value:i===0?values.principal:loan.rows[Math.min(loan.rows.length-1,Math.ceil(loan.rows.length*i/20)-1)].remaining,base:0}));}
    if(type==='present'){total=presentValue(values.future,values.rate/100,values.years);invested=values.future;series=Array.from({length:21},(_,i)=>({value:presentValue(values.future,values.rate/100,values.years*i/20),base:0}));}
  }
  const finite=valid&&Number.isFinite(total)&&!(type==='savings'&&(!Number.isFinite(months)||months>12000));
  const field=(key,label,unit,extra={})=><Field label={label} unit={unit} value={values[key]} onChange={v=>set(key,v)} {...extra}/>;
  return <><PageHeading title={tool.title} description={tool.description}/><div className="calculator-layout"><section className="input-panel"><div className="panel-title"><span className={`icon-box ${tool.color}`}><Icon name={tool.icon}/></span><h2>设定你的计划</h2></div>{type!=='present'&&field('principal',type==='mortgage'?'贷款本金':'初始本金','元')}{type==='present'&&field('future','未来金额','元')}{type==='savings'&&field('deposit','每月存款','元')}{type==='savings'&&field('target','目标金额','元')}{field('rate',type==='present'?'年折现率':'年利率','%',{max:100})}{type!=='savings'&&field('years',type==='mortgage'?'贷款期限':'时间','年',{max:100,min:type==='mortgage'?1:0,step:type==='mortgage'?1:'any'})}{type==='compound'&&<label className="field"><span>复利频率</span><select value={values.frequency} onChange={e=>set('frequency',Number(e.target.value))}><option value="12">每月复利</option><option value="4">每季度复利</option><option value="1">每年复利</option><option value="365">每日复利（365 天）</option></select></label>}{type==='mortgage'&&<label className="field"><span>还款方式</span><select value={values.method} onChange={e=>set('method',e.target.value)}><option value="annuity">等额本息 · 每月还款相同</option><option value="equal">等额本金 · 每月还款递减</option></select></label>}<Button variant="outlined" onClick={()=>setValues(initial)}>恢复默认值</Button><p className="input-hint"><Icon name="info" size={16}/> 调整数值，结果即刻更新。金额以人民币计。</p></section><section className="output-panel" aria-live="polite"><span className="eyebrow">YOUR RESULT</span><h2>{type==='compound'?'未来的账户总额':type==='savings'?'预计达成目标需要':type==='mortgage'?'首月还款金额':'这笔钱今天的价值'}</h2>{finite?<><div className="result-number">{type==='savings'?<>{Math.floor(months/12)>0&&<>{Math.floor(months/12)}<small>年</small></>}{months%12}<small>个月</small></>:<><small>¥</small>{money(type==='mortgage'?loan.payment:total)}</>}</div><div className="result-stats"><div><span>{type==='present'?'未来金额':type==='mortgage'?'还款总额':'累计投入'}</span><b>¥ {money(type==='mortgage'?total:invested)}</b></div><div><span>{type==='present'?'折现差额':type==='mortgage'?'利息总额':'获得利息'}</span><b className="green-text">¥ {money(type==='present'?invested-total:total-invested)}</b></div></div><Chart series={series} legend={type==='mortgage'?'剩余贷款':type==='present'?'折算现值':'账户总额'} labels={['现在',type==='savings'?`${months} 个月后`:`${values.years} 年后`]}/>{type==='savings'&&<p className="result-note">{months===0?'你已经达到储蓄目标。':`按月末存入、月复利计算，达成时账户约有 ¥ ${money(total)}。`}</p>}{type==='mortgage'&&<><Button variant="text" onClick={()=>setTable(!table)}>{table?'收起':'查看'}还款明细 <Icon name="arrow" size={17}/></Button>{table&&<><div className="table-wrap"><table><thead><tr><th>期数</th><th>月供</th><th>本金</th><th>利息</th><th>剩余本金</th></tr></thead><tbody>{(showAll?loan.rows:loan.rows.slice(0,12)).map(row=><tr key={row.month}><td>{row.month}</td>{['payment','capital','interest','remaining'].map(k=><td key={k}>{money(row[k])}</td>)}</tr>)}</tbody></table></div>{loan.rows.length>12&&<Button variant="text" onClick={()=>setShowAll(!showAll)}>{showAll?'仅显示前 12 期':`显示全部 ${loan.rows.length} 期`}</Button>}</>}</>}</>:<div className="invalid"><Icon name="info" size={30}/><h3>{!valid?'请检查输入数值':months>12000?'当前计划无法在 1,000 年内达到目标':'结果超出计算范围'}</h3><p>{!valid?'请输入非负金额、0–100% 的利率和不超过 100 年的期限；房贷期限需为正整数。':'试着增加每月存款，或调整目标和其他参数。'}</p></div>}</section></div><div className="explanation"><Icon name="book"/><div><h3>这个结果，怎么理解？</h3><p>{type==='compound'?'复利是“利息也会生息”。这里年利率是名义年利率，每期利率 = 年利率 ÷ 每年复利次数；未来价值 = 本金 × (1 + 每期利率) 的总期数次方。时间越长，复利与单利的差别越明显。':type==='savings'?'假设年利率固定，每月先计息，再于月末存入固定金额。月利率 = 年利率 ÷ 12；下月余额 = 本月余额 × (1 + 月利率) + 每月存款。结果向上取整到完整月份。':type==='mortgage'?'等额本息每月还款相同，前期利息占比较高；等额本金每月偿还本金相同，月供逐渐减少。计算使用固定年利率 ÷ 12 作为月利率，不包括提前还款、手续费、税费及利率变动。':'现值反映未来现金在今天的价值。现值 = 未来金额 ÷ (1 + 年折现率) 的年数次方。折现率可以代表机会成本；这不是对未来收益的预测。'}</p></div></div></>;
}
function App() {
  const [page, setPage] = useState(() => location.hash.startsWith('#/') ? location.hash.slice(2) : 'home');
  const [modal, setModal] = useState(null);
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('theme') === 'dark'; } catch { return false; } });
  useEffect(() => {
    const route = () => {
      if (location.hash && !location.hash.startsWith('#/')) return;
      setPage(location.hash.slice(2) || 'home');
      setModal(null);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', route);
    return () => window.removeEventListener('hashchange', route);
  }, []);
  useEffect(() => {
    setColorScheme('#39785c');
    setTheme(dark ? 'dark' : 'light');
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* 隐私模式禁用存储时，主题仍在当前会话生效。 */ }
  }, [dark]);
  useEffect(() => { document.title = `${paths[page] || '页面未找到'} · 知钱`; }, [page]);
  return <>
    <a className="skip-link" href="#main">跳到主要内容</a>
    <aside className="sidebar">
      <a className="brand" href="#/home"><span className="brand-mark"><Icon name="chart" size={26}/></span><span>知钱<small>FINANCE, MADE SIMPLE</small></span></a>
      <div className="nav-label">开始学习</div>
      <nav aria-label="主要导航">
        <a href="#/home" className={page === 'home' ? 'active' : ''} aria-current={page === 'home' ? 'page' : undefined}><Icon name="home"/>首页</a>
        <a href="#/formulas" className={page === 'formulas' ? 'active' : ''} aria-current={page === 'formulas' ? 'page' : undefined}><Icon name="book"/>公式探索<span className="nav-count">9</span></a>
        <div className="nav-label">实用计算器</div>
        {tools.map(t => <a href={`#/${t.id}`} className={page === t.id ? 'active' : ''} aria-current={page === t.id ? 'page' : undefined} key={t.id}><Icon name={t.icon}/>{t.id === 'savings' ? '储蓄目标' : t.title}</a>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><Icon name="leaf"/><h4>投资自己，从学习开始。</h4><p>每天懂一点，<br/>让未来多一种可能。</p></div>
        <a className="github-link" href="https://github.com/aimerneige/finance-website" target="_blank" rel="noopener noreferrer"><Icon name="github" size={18}/> 在 GitHub 查看源码 <span>↗</span></a>
      </div>
    </aside>
    <div className="workspace">
      <header className="topbar"><span>金融入门，<b>从这里开始。</b></span><div><span className="topbar-caption">保持好奇，慢慢积累</span><span className="header-divider"/><mdui-button-icon aria-label={dark ? '切换亮色主题' : '切换暗色主题'} title={dark ? '切换亮色主题' : '切换暗色主题'} onClick={() => setDark(!dark)}><Icon name={dark ? 'sun' : 'moon'} size={20}/></mdui-button-icon><a href="https://github.com/aimerneige/finance-website" target="_blank" rel="noopener noreferrer" aria-label="GitHub 代码仓库" className="header-github"><Icon name="github" size={21}/></a></div></header>
      <main id="main">
        {page === 'home' ? <Home onOpen={setModal}/> : page === 'formulas' ? <FormulaPage onOpen={setModal}/> : tools.some(t => t.id === page) ? <Calculator key={page} type={page}/> : <><PageHeading title="页面未找到" description="从首页重新开始探索吧。"/><Button href="#/home">返回首页</Button></>}
        <footer><span>© {new Date().getFullYear()} 知钱 <span className="footer-dot">·</span> 让金融知识触手可及</span><span>仅供学习参考，不构成投资建议 <span className="footer-dot">·</span> 用心制作 <Icon name="leaf" size={14}/></span></footer>
      </main>
    </div>
    {modal && <FormulaModal item={modal} close={() => setModal(null)}/>}
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
