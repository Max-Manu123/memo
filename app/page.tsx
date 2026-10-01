"use client";

import { useEffect, useMemo, useState } from "react";

type Goal = "lose" | "maintain" | "gain";
type View = "home" | "history" | "progress" | "settings";
type Theme = "light" | "dark";
type Locale = "en" | "pt";
type Meal = {
  id: string; name: string; time: string; calories: number; protein: number;
  carbs: number; fat: number; note: string; confidence: "High" | "Medium";
  type: "Breakfast" | "Lunch" | "Snack" | "Dinner";
};

const demoMeals: Meal[] = [
  { id:"1", name:"Chicken rice bowl", time:"12:42", calories:620, protein:42, carbs:68, fat:18, note:"Your usual lunch", confidence:"High", type:"Lunch" },
  { id:"2", name:"Greek yogurt & banana", time:"08:15", calories:280, protein:17, carbs:39, fat:7, note:"Logged from a saved meal", confidence:"High", type:"Breakfast" },
  { id:"3", name:"Apple & peanut butter", time:"16:20", calories:210, protein:6, carbs:25, fat:10, note:"Estimated from description", confidence:"Medium", type:"Snack" },
];

const copy = {
  en: {
    hello:"Good evening", subtitle:"Keep it simple. Memo learns as you eat.", today:"Today", addMeal:"Log a meal",
    calories:"Calories", protein:"Protein", carbs:"Carbs", fat:"Fat", home:"Home", history:"History",
    progress:"Progress", settings:"Settings", remaining:"remaining", usual:"Your usuals", recent:"Recent meals",
    seeAll:"See all", memory:"Memo memory", memoryText:"3 meals learned. Next time, confirm in one tap.",
    welcome:"Food tracking that gets easier over time.", welcomeText:"Register once. Next time, Memo remembers.",
    continue:"Continue", back:"Back", goalTitle:"What are you working toward?",
    goalText:"We’ll use this to make your daily targets useful—not perfect.", lose:"Lose weight",
    maintain:"Maintain weight", gain:"Gain weight", detailsTitle:"A little about you",
    detailsText:"These details stay local for now. Connect your account later.", name:"First name", age:"Age",
    weight:"Weight (kg)", height:"Height (cm)", finish:"Enter Memo", logTitle:"What did you eat?",
    logText:"Describe it naturally. Memo will estimate and ask only what matters.",
    placeholder:"e.g. chicken, rice and vegetables", analyze:"Analyze meal", analyzing:"Learning your meal…",
    result:"Memo's estimate", confirm:"Confirm meal", edit:"Edit", learned:"Memo learned this",
    learnedText:"Next time, you can log this meal in one tap.", noPressure:"No fake precision",
    range:"Estimated range", appearance:"Appearance", language:"Language", dark:"Dark", light:"Light",
    demo:"Demo mode", demoText:"This MVP uses local demo data. Database, AI and analytics adapters are ready to connect.",
    reset:"Reset demo",
  },
  pt: {
    hello:"Boa noite", subtitle:"Mantenha simples. O Memo aprende enquanto você come.", today:"Hoje", addMeal:"Registrar refeição",
    calories:"Calorias", protein:"Proteína", carbs:"Carboidratos", fat:"Gordura", home:"Início", history:"Histórico",
    progress:"Progresso", settings:"Definições", remaining:"restantes", usual:"Seus habituais", recent:"Refeições recentes",
    seeAll:"Ver tudo", memory:"Memória do Memo", memoryText:"3 refeições aprendidas. Na próxima vez, confirme com um toque.",
    welcome:"Controle alimentar que fica mais fácil com o tempo.", welcomeText:"Registre uma vez. Da próxima vez, o Memo lembra.",
    continue:"Continuar", back:"Voltar", goalTitle:"O que você quer alcançar?",
    goalText:"Usaremos isso para tornar suas metas úteis — não perfeitas.", lose:"Perder peso",
    maintain:"Manter peso", gain:"Ganhar peso", detailsTitle:"Um pouco sobre você",
    detailsText:"Por enquanto, estes dados ficam no dispositivo. Sua conta virá depois.", name:"Nome", age:"Idade",
    weight:"Peso (kg)", height:"Altura (cm)", finish:"Entrar no Memo", logTitle:"O que você comeu?",
    logText:"Descreva naturalmente. O Memo estima e pergunta só o que importa.",
    placeholder:"ex.: frango, arroz e legumes", analyze:"Analisar refeição", analyzing:"Aprendendo sua refeição…",
    result:"Estimativa do Memo", confirm:"Confirmar refeição", edit:"Editar", learned:"O Memo aprendeu isso",
    learnedText:"Na próxima vez, você poderá registrar esta refeição com um toque.", noPressure:"Sem falsa precisão",
    range:"Faixa estimada", appearance:"Aparência", language:"Idioma", dark:"Escuro", light:"Claro",
    demo:"Modo demo", demoText:"Este MVP usa dados locais de demonstração. Banco, IA e analytics já têm adaptadores preparados.",
    reset:"Reiniciar demo",
  },
} as const;

function Icon({ name, size=20 }: { name:string; size?:number }) {
  const common={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
  const p: Record<string,React.ReactNode>={
    home:<><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    chart:<><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 3-4 3 2 4-6"/></>,
    settings:<><circle cx="12" cy="12" r="3.5"/><path d="M19 15.1a2 2 0 0 0 .4 2.2l.1.1-2.2 2.2-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8v.1h-3.1v-.1a2 2 0 0 0-1.2-1.8 2 2 0 0 0-2.2.4l-.1.1-2.2-2.2.1-.1a2 2 0 0 0 .4-2.2A2 2 0 0 0 5.7 14H5.5v-3.1h.2a2 2 0 0 0 1.8-1.2 2 2 0 0 0-.4-2.2L7 7.4l2.2-2.2.1.1a2 2 0 0 0 2.2.4A2 2 0 0 0 12.7 4v-.1h3.1V4a2 2 0 0 0 1.2 1.8 2 2 0 0 0 2.2-.4l.1-.1 2.2 2.2-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2h.1V14h-.1a2 2 0 0 0-1.8 1.1Z"/></>,
    plus:<><path d="M12 5v14M5 12h14"/></>,
    spark:<><path d="m12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4L12 3Z"/><path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z"/></>,
    arrow:<><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>, back:<path d="m15 18-6-6 6-6"/>,
    check:<path d="m5 12 4 4L19 6"/>, chevron:<path d="m9 18 6-6-6-6"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon:<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/>,
    globe:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>, close:<><path d="m6 6 12 12M18 6 6 18"/></>,
    flame:<path d="M12 22c4 0 7-3 7-7 0-4-3-7-6-11-1 3-3 4-4 5-1-3 0-5 0-6-4 3-6 7-6 11 0 5 3 8 7 8Z"/>,
  };
  return <svg {...common}>{p[name] ?? p.spark}</svg>;
}

function ProgressRing({ value,max }:{value:number;max:number}) {
  const pct=Math.min(100,Math.round(value/max*100));
  return <div className="ring" style={{"--progress":pct*3.6+"deg"} as React.CSSProperties}><div className="ring-inner"><strong>{value.toLocaleString()}</strong><span>kcal</span></div></div>;
}

export default function Home() {
  const [locale,setLocale]=useState<Locale>("en"), [theme,setTheme]=useState<Theme>("light");
  const [onboarded,setOnboarded]=useState(false), [step,setStep]=useState(1), [goal,setGoal]=useState<Goal>("maintain");
  const [view,setView]=useState<View>("home"), [showLogger,setShowLogger]=useState(false);
  const [mealText,setMealText]=useState(""), [analyzing,setAnalyzing]=useState(false), [result,setResult]=useState(false);
  const [meals,setMeals]=useState<Meal[]>(demoMeals);
  const t=copy[locale];

  useEffect(()=>{const raw=localStorage.getItem("memo-demo");if(raw){try{const d=JSON.parse(raw);setOnboarded(!!d.onboarded);setGoal(d.goal??"maintain");setLocale(d.locale??"en");setTheme(d.theme??"light")}catch{}}},[]);
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("memo-demo",JSON.stringify({onboarded,goal,locale,theme}))},[onboarded,goal,locale,theme]);

  const calories=meals.reduce((s,m)=>s+m.calories,0), protein=meals.reduce((s,m)=>s+m.protein,0);
  const carbs=meals.reduce((s,m)=>s+m.carbs,0), fat=meals.reduce((s,m)=>s+m.fat,0);
  const target=goal==="lose"?1900:goal==="gain"?2500:2200;
  const learned=useMemo(()=>meals.slice(0,3),[meals]);

  function analyze(){if(!mealText.trim())return;setAnalyzing(true);setTimeout(()=>{setAnalyzing(false);setResult(true)},700)}
  function confirm(){
    setMeals(cur=>[{id:crypto.randomUUID(),name:mealText.trim(),time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),calories:575,protein:31,carbs:56,fat:18,note:"Learned from your correction",confidence:"Medium",type:"Dinner"},...cur]);
    setShowLogger(false);setMealText("");setResult(false);
  }
  function reset(){localStorage.removeItem("memo-demo");setOnboarded(false);setStep(1);setView("home");setMeals(demoMeals)}

  if(!onboarded) return <main className="onboarding-shell">
    <div className="brand-mark">M</div>
    <div className="onboarding-card">
      <div className="eyebrow"><span className="eyebrow-dot"/> MEMO</div>
      {step===1 && <><div className="hero-orb"><Icon name="spark" size={34}/></div><h1>{t.welcome}</h1><p>{t.welcomeText}</p>
        <div className="feature-list"><div><span>01</span><b>Remember your usual meals</b></div><div><span>02</span><b>Ask less, learn more</b></div><div><span>03</span><b>Show honest estimates</b></div></div>
        <button className="primary-button wide" onClick={()=>setStep(2)}>{t.continue}<Icon name="arrow"/></button></>}
      {step===2 && <><button className="back-button" onClick={()=>setStep(1)}><Icon name="back" size={18}/>{t.back}</button><h1>{t.goalTitle}</h1><p>{t.goalText}</p>
        <div className="choice-list">{(["lose","maintain","gain"] as Goal[]).map(g=><button key={g} className={"choice "+(goal===g?"selected":"")} onClick={()=>setGoal(g)}><span>{g==="lose"?"↓":g==="gain"?"↑":"→"}</span><b>{t[g]}</b>{goal===g&&<Icon name="check" size={18}/>}</button>)}</div>
        <button className="primary-button wide" onClick={()=>setStep(3)}>{t.continue}<Icon name="arrow"/></button></>}
      {step===3 && <><button className="back-button" onClick={()=>setStep(2)}><Icon name="back" size={18}/>{t.back}</button><h1>{t.detailsTitle}</h1><p>{t.detailsText}</p>
        <div className="input-grid"><label>{t.name}<input placeholder="Alex"/></label><label>{t.age}<input placeholder="24" inputMode="numeric"/></label><label>{t.weight}<input placeholder="72" inputMode="decimal"/></label><label>{t.height}<input placeholder="175" inputMode="numeric"/></label></div>
        <button className="primary-button wide" onClick={()=>setOnboarded(true)}>{t.finish}<Icon name="arrow"/></button></>}
    </div>
    <div className="onboarding-footer"><span>01</span><div className="steps"><i className={step>=1?"active":""}/><i className={step>=2?"active":""}/><i className={step>=3?"active":""}/></div><span>03</span></div>
  </main>;

  const nav:[View,string,string][]=[["home",t.home,"home"],["history",t.history,"clock"],["progress",t.progress,"chart"],["settings",t.settings,"settings"]];

  return <div className="app-shell">
    <aside className="sidebar"><div className="sidebar-logo"><span>M</span><strong>Memo</strong></div><nav>{nav.map(([k,l,i])=><button key={k} className={"nav-item "+(view===k?"active":"")} onClick={()=>setView(k)}><Icon name={i} size={19}/><span>{l}</span></button>)}</nav>
      <div className="sidebar-memory"><Icon name="spark" size={17}/><b>{t.memory}</b><p>{t.memoryText}</p></div><div className="profile-mini"><div className="avatar">A</div><div><b>Alex</b><span>Free plan</span></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="mobile-brand"><span>M</span><b>Memo</b></div><div className="topbar-actions">
        <button className="icon-button" onClick={()=>setTheme(theme==="light"?"dark":"light")} aria-label="Theme"><Icon name={theme==="light"?"moon":"sun"} size={19}/></button>
        <button className="language-button" onClick={()=>setLocale(locale==="en"?"pt":"en")}><Icon name="globe" size={17}/>{locale.toUpperCase()}</button><div className="avatar">A</div>
      </div></header>

      {view==="home" && <div className="page-wrap">
        <section className="welcome-row"><div><span className="muted-label">{t.today} · OCT 1</span><h1>{t.hello}, Alex.</h1><p>{t.subtitle}</p></div><button className="primary-button desktop-add" onClick={()=>setShowLogger(true)}><Icon name="plus" size={19}/>{t.addMeal}</button></section>
        <section className="dashboard-grid"><div className="card calorie-card"><div className="card-heading"><div><span className="muted-label">{t.calories}</span><h2>{calories.toLocaleString()} <small>/ {target.toLocaleString()}</small></h2></div><ProgressRing value={calories} max={target}/></div>
          <div className="macro-row"><div><span className="macro-dot"/><span>{t.protein}</span><b>{protein}g</b></div><div><span className="macro-dot carbs"/><span>{t.carbs}</span><b>{carbs}g</b></div><div><span className="macro-dot fat"/><span>{t.fat}</span><b>{fat}g</b></div></div></div>
          <div className="card memory-card"><div className="memory-icon"><Icon name="spark" size={21}/></div><span className="muted-label">{t.memory}</span><h3>Less logging. More knowing.</h3><p>{t.memoryText}</p><button className="text-button" onClick={()=>setView("history")}>{t.seeAll}<Icon name="arrow" size={15}/></button></div>
        </section>
        <section className="section"><div className="section-heading"><div><span className="muted-label">{t.usual}</span><h2>One-tap meals</h2></div><button className="text-button">{t.seeAll}<Icon name="chevron" size={15}/></button></div>
          <div className="usual-grid">{learned.map(m=><button className="usual-card" key={m.id} onClick={()=>{setMealText(m.name);setShowLogger(true);setResult(true)}}><div className="meal-symbol">{m.type==="Breakfast"?"☀":m.type==="Lunch"?"◒":"◉"}</div><div><b>{m.name}</b><span>{m.calories} kcal · {m.protein}g protein</span></div><Icon name="plus" size={17}/></button>)}</div>
        </section>
        <section className="section"><div className="section-heading"><div><span className="muted-label">{t.recent}</span><h2>{t.today}</h2></div><button className="text-button" onClick={()=>setView("history")}>{t.seeAll}<Icon name="arrow" size={15}/></button></div>
          <div className="meal-list">{meals.slice(0,4).map(m=><div className="meal-row" key={m.id}><div className="meal-symbol soft">◒</div><div className="meal-main"><b>{m.name}</b><span>{m.time} · {m.note}</span></div><div className="meal-kcal"><b>{m.calories}</b><span>kcal</span></div><Icon name="chevron" size={16}/></div>)}</div>
        </section>
      </div>}

      {view==="history" && <div className="page-wrap"><section className="welcome-row compact"><div><span className="muted-label">MEMO / HISTORY</span><h1>{t.history}</h1><p>Your meals, corrections and learned patterns.</p></div><button className="primary-button" onClick={()=>setShowLogger(true)}><Icon name="plus" size={19}/>{t.addMeal}</button></section>
        <div className="history-day"><div className="day-label">TODAY <span>{meals.length} meals</span></div>{meals.map(m=><div className="meal-row large" key={m.id}><div className="meal-symbol soft">◒</div><div className="meal-main"><b>{m.name}</b><span>{m.time} · {m.note}</span></div><div className="confidence">{m.confidence}<i/></div><div className="meal-kcal"><b>{m.calories}</b><span>kcal</span></div></div>)}</div>
      </div>}

      {view==="progress" && <div className="page-wrap"><section className="welcome-row compact"><div><span className="muted-label">MEMO / PROGRESS</span><h1>{t.progress}</h1><p>Patterns are more useful than perfect numbers.</p></div></section>
        <div className="progress-grid"><div className="card progress-main"><span className="muted-label">7 DAY INTAKE</span><h2>2,040 <small>avg kcal</small></h2><div className="bars">{[68,82,61,88,74,93,79].map((v,i)=><div className="bar-col" key={i}><div className="bar" style={{height:v+"%"}}/><span>{["M","T","W","T","F","S","S"][i]}</span></div>)}</div></div>
          <div className="card"><span className="muted-label">CONSISTENCY</span><h2>6 / 7</h2><p className="card-note">You logged on six days this week. The goal is consistency, not perfection.</p><div className="streak"><Icon name="flame" size={18}/> 4 day streak</div></div></div>
      </div>}

      {view==="settings" && <div className="page-wrap"><section className="welcome-row compact"><div><span className="muted-label">MEMO / PREFERENCES</span><h1>{t.settings}</h1><p>Make Memo feel like yours.</p></div></section>
        <div className="settings-list"><div className="settings-section"><span className="muted-label">{t.appearance}</span><button onClick={()=>setTheme(theme==="light"?"dark":"light")}><div className="setting-icon"><Icon name={theme==="light"?"sun":"moon"}/></div><div><b>{theme==="light"?t.light:t.dark}</b><span>Switch the interface theme</span></div><Icon name="chevron"/></button></div>
          <div className="settings-section"><span className="muted-label">{t.language}</span><button onClick={()=>setLocale(locale==="en"?"pt":"en")}><div className="setting-icon"><Icon name="globe"/></div><div><b>{locale==="en"?"English":"Português"}</b><span>Change app language</span></div><Icon name="chevron"/></button></div>
          <div className="settings-section"><span className="muted-label">{t.demo}</span><div className="demo-note"><Icon name="info"/><p>{t.demoText}</p></div><button className="danger-button" onClick={reset}>{t.reset}</button></div>
        </div>
      </div>}
    </main>

    <nav className="bottom-nav">{nav.map(([k,l,i])=><button key={k} className={view===k?"active":""} onClick={()=>setView(k)}><Icon name={i} size={20}/><span>{l}</span></button>)}</nav>
    <button className="floating-add" onClick={()=>setShowLogger(true)}><Icon name="plus" size={23}/></button>

    {showLogger && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowLogger(false)}}><div className="meal-modal">
      <div className="modal-header"><div><span className="muted-label">MEMO / MEAL</span><h2>{result?t.result:t.logTitle}</h2></div><button className="icon-button" onClick={()=>setShowLogger(false)}><Icon name="close"/></button></div>
      {!result ? <><p className="modal-copy">{t.logText}</p><textarea value={mealText} onChange={e=>setMealText(e.target.value)} placeholder={t.placeholder} autoFocus/>
        <div className="modal-tip"><Icon name="spark" size={17}/><span>Memo gets better when you correct it.</span></div>
        <button className="primary-button wide" disabled={analyzing||!mealText.trim()} onClick={analyze}>{analyzing?t.analyzing:t.analyze}<Icon name="arrow"/></button></>
      : <><div className="estimate"><div><span className="muted-label">{t.calories}</span><strong>540–610</strong><span>kcal</span></div><div className="estimate-badge">{t.noPressure}</div></div>
        <div className="estimate-grid"><div><span>{t.protein}</span><b>31g</b></div><div><span>{t.carbs}</span><b>56g</b></div><div><span>{t.fat}</span><b>18g</b></div></div>
        <div className="uncertainty"><Icon name="info" size={17}/><div><b>{t.range}</b><p>Portion size is the main uncertainty. Correct it now and Memo will remember.</p></div></div>
        <div className="modal-actions"><button className="secondary-button" onClick={()=>setResult(false)}>{t.edit}</button><button className="primary-button" onClick={confirm}>{t.confirm}<Icon name="check" size={18}/></button></div>
        <div className="learned-banner"><Icon name="spark" size={17}/><div><b>{t.learned}</b><span>{t.learnedText}</span></div></div></>}
    </div></div>}
  </div>;
}
