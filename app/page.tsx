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
    seeAll:"See all", memory:"Memo memory", memoryText:"Your recent meals can become one-tap suggestions.",
    welcome:"Food tracking that gets easier over time.", welcomeText:"Register once. Next time, Memo remembers.",
    continue:"Continue", back:"Back", goalTitle:"What are you working toward?",
    goalText:"We’ll use this to make your daily targets useful—not perfect.", lose:"Lose weight",
    maintain:"Maintain weight", gain:"Gain weight", detailsTitle:"A little about you",
    detailsText:"These details stay local for now. Connect your account later.", name:"First name", age:"Age",
    weight:"Weight (kg)", height:"Height (cm)", finish:"Enter Memo", logTitle:"What did you eat?",
    logText:"Describe it naturally. Memo will estimate and ask only what matters.",
    placeholder:"e.g. chicken, rice and vegetables",
    result:"Memo's estimate", confirm:"Confirm meal", learned:"Memo learned this",
    learnedText:"Next time, you can log this meal in one tap.", noPressure:"No fake precision",
    range:"Estimated range", appearance:"Appearance", language:"Language", dark:"Dark", light:"Light",
    demo:"Demo mode", demoText:"This MVP uses local demo data. Database, AI and analytics adapters are ready to connect.",
    reset:"Reset demo", historySubtitle:"Your meals, corrections and learned patterns.", progressSubtitle:"Patterns are more useful than perfect numbers.", settingsSubtitle:"Make Memo feel like yours.", historyEyebrow:"MEMO / HISTORY", progressEyebrow:"MEMO / PROGRESS", settingsEyebrow:"MEMO / PREFERENCES", todayUpper:"TODAY", mealsLabel:"meals", intakeLabel:"7 DAY INTAKE", avgLabel:"avg kcal", consistency:"CONSISTENCY", loggedDays:"You logged on six days this week. The goal is consistency, not perfection.", streak:"4 day streak", noMealsYet:"Log your first meal to start building a real pattern.", startStreak:"Start your streak",
    landingEyebrow:"FOOD TRACKING, REIMAGINED", landingTitle:"The food tracker that gets easier the more you use it.", landingText:"Register a meal once. Memo remembers your usuals, learns from your corrections, and makes the next log faster.", landingCta:"Try Memo free", landingSecondary:"See how it works", landingProof:"No perfect measurements. No endless food searches. Just a tracker that learns your habits.", landingHow:"A tracker that learns you.", landingHowText:"Most trackers make you do the same work every day. Memo is designed to remove that work over time.", landingStep1:"Log naturally", landingStep1Text:"Describe a meal, use a photo, or pick a usual. Start with what you already know.", landingStep2:"Correct once", landingStep2Text:"If an estimate is off, make a quick correction. Memo keeps the useful part.", landingStep3:"Log faster next time", landingStep3Text:"Your recurring meals become one-tap suggestions, so tracking gets lighter.", landingFeature1:"Remembers your usual meals", landingFeature2:"Asks only what matters", landingFeature3:"Shows honest estimates", landingMemoryTitle:"Less logging. More knowing.", landingMemoryText:"The goal is not to make you log perfectly. It is to make you need less logging over time.", landingCtaBottom:"Start building your food memory", landingPrivacy:"Your MVP data stays on your device for now.", landingFooter:"Memo · Food tracking that learns you.", onboardingFeature1:"Remember your usual meals", onboardingFeature2:"Ask less, learn more", onboardingFeature3:"Show honest estimates", describe:"Describe", photo:"Photo", usualMeal:"Usual", photoDesc:"Add a photo of your meal. Image analysis is prepared for the real AI integration; the MVP keeps this step local.", addPhoto:"Add a meal photo", photoReady:"Photo ready to analyze", photoHint:"Tap to take a photo or choose one", meal:"Meal", portion:"Portion", breakfast:"Breakfast", lunch:"Lunch", snack:"Snack", dinner:"Dinner", usedBefore:"used before", sourcePhoto:"📷 Photo", sourceUsual:"⚡ Usual meal", sourceDescription:"✍️ Description", estimatedEnergy:"ESTIMATED ENERGY", proteinShort:"Protein", carbsShort:"Carbs", fatShort:"Fat", portionLabel:"portion", yourMeal:"Your meal", themeAria:"Theme", switchTheme:"Switch the interface theme", changeLanguage:"Change app language", freePlan:"Free plan", oneTapMeals:"One-tap meals", logEyebrow:"MEMO / MEAL LOG", addMealTitle:"Add a meal", reviewMealTitle:"Review your meal", describeHint:"Tell Memo what you ate in your own words. No need to search a food database.", describePlaceholder:"e.g. grilled chicken, 1 cup rice and beans", quickChicken:"Chicken + rice", quickOatmeal:"Oatmeal + banana", quickYogurt:"Yogurt + fruit", mealTip:"Memo learns from corrections, so you do not need perfect measurements.", analyze:"Review estimate", analyzing:"Analyzing…", confidenceMedium:"Medium confidence", edit:"Edit", approximate:"Approximate", uncertaintyTitle:"What could change this?", uncertaintyText:"Portion size is the biggest uncertainty. Correct it and Memo can use that correction next time.", quickCorrection:"Quick correction", smaller:"Smaller", aboutRight:"About right", larger:"Larger", confirmRemember:"Confirm & remember", learnedBannerTitle:"Memo will remember this", learnedBannerText:"Next time, this meal can become a one-tap suggestion.", small:"Small", normal:"Normal", large:"Large", high:"High", medium:"Medium",
  },
  pt: {
    hello:"Boa noite", subtitle:"Mantenha simples. O Memo aprende enquanto você come.", today:"Hoje", addMeal:"Registrar refeição",
    calories:"Calorias", protein:"Proteína", carbs:"Carboidratos", fat:"Gordura", home:"Início", history:"Histórico",
    progress:"Progresso", settings:"Definições", remaining:"restantes", usual:"Seus habituais", recent:"Refeições recentes",
    seeAll:"Ver tudo", memory:"Memória do Memo", memoryText:"Suas refeições recentes podem virar sugestões de um toque.",
    welcome:"Controle alimentar que fica mais fácil com o tempo.", welcomeText:"Registre uma vez. Da próxima vez, o Memo lembra.",
    continue:"Continuar", back:"Voltar", goalTitle:"O que você quer alcançar?",
    goalText:"Usaremos isso para tornar suas metas úteis — não perfeitas.", lose:"Perder peso",
    maintain:"Manter peso", gain:"Ganhar peso", detailsTitle:"Um pouco sobre você",
    detailsText:"Por enquanto, estes dados ficam no dispositivo. Sua conta virá depois.", name:"Nome", age:"Idade",
    weight:"Peso (kg)", height:"Altura (cm)", finish:"Entrar no Memo", logTitle:"O que você comeu?",
    logText:"Descreva naturalmente. O Memo estima e pergunta só o que importa.",
    placeholder:"ex.: frango, arroz e legumes",
    result:"Estimativa do Memo", confirm:"Confirmar refeição", learned:"O Memo aprendeu isso",
    learnedText:"Na próxima vez, você poderá registrar esta refeição com um toque.", noPressure:"Sem falsa precisão",
    range:"Faixa estimada", appearance:"Aparência", language:"Idioma", dark:"Escuro", light:"Claro",
    demo:"Modo demo", demoText:"Este MVP usa dados locais de demonstração. Banco, IA e analytics já têm adaptadores preparados.",
    reset:"Reiniciar demo", historySubtitle:"Suas refeições, correções e padrões aprendidos.", progressSubtitle:"Padrões são mais úteis do que números perfeitos.", settingsSubtitle:"Deixe o Memo com a sua cara.", historyEyebrow:"MEMO / HISTÓRICO", progressEyebrow:"MEMO / PROGRESSO", settingsEyebrow:"MEMO / DEFINIÇÕES", todayUpper:"HOJE", mealsLabel:"refeições", intakeLabel:"CONSUMO — 7 DIAS", avgLabel:"média kcal", consistency:"CONSISTÊNCIA", loggedDays:"Você registrou refeições em seis dias esta semana. O objetivo é consistência, não perfeição.", streak:"4 dias seguidos", noMealsYet:"Registre sua primeira refeição para começar a criar um padrão real.", startStreak:"Começar sequência",
    landingEyebrow:"CONTROLE ALIMENTAR, REIMAGINADO", landingTitle:"O tracker alimentar que fica mais fácil quanto mais você usa.", landingText:"Registre uma refeição uma vez. O Memo lembra seus habituais, aprende com suas correções e torna o próximo registro mais rápido.", landingCta:"Experimentar grátis", landingSecondary:"Ver como funciona", landingProof:"Sem medições perfeitas. Sem procurar alimentos o tempo todo. Só um tracker que aprende seus hábitos.", landingHow:"Um tracker que aprende com você.", landingHowText:"A maioria dos trackers faz você repetir o mesmo trabalho todos os dias. O Memo foi pensado para remover esse trabalho com o tempo.", landingStep1:"Registre naturalmente", landingStep1Text:"Descreva uma refeição, use uma foto ou escolha um habitual. Comece pelo que você já sabe.", landingStep2:"Corrija uma vez", landingStep2Text:"Se a estimativa estiver errada, faça uma correção rápida. O Memo guarda o que importa.", landingStep3:"Registre mais rápido", landingStep3Text:"Suas refeições recorrentes viram sugestões de um toque, deixando o controle mais leve.", landingFeature1:"Lembra seus habituais", landingFeature2:"Pergunta só o que importa", landingFeature3:"Mostra estimativas honestas", landingMemoryTitle:"Menos registros. Mais conhecimento.", landingMemoryText:"O objetivo não é fazer você registrar perfeitamente. É fazer você precisar registrar menos com o tempo.", landingCtaBottom:"Começar a criar sua memória alimentar", landingPrivacy:"Por enquanto, os dados do MVP ficam no seu dispositivo.", landingFooter:"Memo · Controle alimentar que aprende com você.", onboardingFeature1:"Lembra suas refeições habituais", onboardingFeature2:"Pergunta menos, aprende mais", onboardingFeature3:"Mostra estimativas honestas", describe:"Descrever", photo:"Foto", usualMeal:"Habitual", photoDesc:"Adicione uma foto da refeição. A análise de imagem está preparada para a integração real de IA; no MVP, esta etapa fica local.", addPhoto:"Adicionar foto da refeição", photoReady:"Foto pronta para analisar", photoHint:"Toque para tirar ou escolher uma foto", meal:"Refeição", portion:"Porção", breakfast:"Café da manhã", lunch:"Almoço", snack:"Lanche", dinner:"Jantar", usedBefore:"usada antes", sourcePhoto:"📷 Foto", sourceUsual:"⚡ Habitual", sourceDescription:"✍️ Descrição", estimatedEnergy:"ENERGIA ESTIMADA", proteinShort:"Proteína", carbsShort:"Carboidratos", fatShort:"Gordura", portionLabel:"porção", yourMeal:"Sua refeição", themeAria:"Tema", switchTheme:"Alternar o tema da interface", changeLanguage:"Alterar o idioma do app", freePlan:"Plano gratuito", oneTapMeals:"Refeições de um toque", logEyebrow:"MEMO / REGISTRO", addMealTitle:"Adicionar refeição", reviewMealTitle:"Reveja sua refeição", describeHint:"Conte ao Memo o que você comeu, do seu jeito. Sem procurar em bases de alimentos.", describePlaceholder:"ex.: frango grelhado, 1 xícara de arroz e feijão", quickChicken:"Frango + arroz", quickOatmeal:"Aveia + banana", quickYogurt:"Iogurte + fruta", mealTip:"O Memo aprende com suas correções. Você não precisa medir tudo perfeitamente.", analyze:"Rever estimativa", analyzing:"Analisando…", confidenceMedium:"Confiança média", edit:"Editar", approximate:"Aproximado", uncertaintyTitle:"O que pode mudar esta estimativa?", uncertaintyText:"O tamanho da porção é a maior incerteza. Corrija agora e o Memo pode usar isso na próxima vez.", quickCorrection:"Correção rápida", smaller:"Menor", aboutRight:"Certa", larger:"Maior", confirmRemember:"Confirmar e lembrar", learnedBannerTitle:"O Memo vai lembrar disso", learnedBannerText:"Na próxima vez, esta refeição pode virar uma sugestão de um toque.", small:"Pequena", normal:"Normal", large:"Grande", high:"Alta", medium:"Média",
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
  const [locale,setLocale]=useState<Locale>("pt"), [theme,setTheme]=useState<Theme>("light");
  const [onboarded,setOnboarded]=useState(false), [landingSeen,setLandingSeen]=useState(false), [step,setStep]=useState(1), [goal,setGoal]=useState<Goal>("maintain");
  const [view,setView]=useState<View>("home"), [showLogger,setShowLogger]=useState(false);
  const [mealText,setMealText]=useState(""), [analyzing,setAnalyzing]=useState(false), [result,setResult]=useState(false);
  const [loggerMode,setLoggerMode]=useState<"describe"|"photo"|"usual">("describe"), [mealType,setMealType]=useState<Meal["type"]>("Dinner");
  const [portion,setPortion]=useState("normal"), [photoName,setPhotoName]=useState("");
  const [meals,setMeals]=useState<Meal[]>(demoMeals);\n  const [profile,setProfile]=useState({name:"Alex",age:"24",weight:"72",height:"175"});
  const t=copy[locale];

  useEffect(()=>{const raw=localStorage.getItem("memo-demo");if(raw){try{const d=JSON.parse(raw);setOnboarded(!!d.onboarded);setLandingSeen(!!d.landingSeen);setGoal(d.goal??"maintain");setLocale(d.locale??"pt");setTheme(d.theme??"light");setProfile(d.profile??{name:"Alex",age:"24",weight:"72",height:"175"});setMeals(Array.isArray(d.meals)&&d.meals.length?d.meals:demoMeals)}catch{}}},[]);
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("memo-demo",JSON.stringify({onboarded,landingSeen,goal,locale,theme,profile,meals}))},[onboarded,landingSeen,goal,locale,theme,profile,meals]);

  const calories=meals.reduce((s,m)=>s+m.calories,0), protein=meals.reduce((s,m)=>s+m.protein,0);
  const carbs=meals.reduce((s,m)=>s+m.carbs,0), fat=meals.reduce((s,m)=>s+m.fat,0);
  const target=goal==="lose"?1900:goal==="gain"?2500:2200;
  const remainingCalories=Math.max(0,target-calories);
  const formatNumber=(n:number)=>n.toLocaleString(locale==="pt"?"pt-PT":"en-US");
  const learned=useMemo(()=>meals.slice(0,3),[meals]);

  function openLogger(mode:"describe"|"photo"|"usual"="describe"){setLoggerMode(mode);setResult(false);setPhotoName("");setMealText("");setMealType("Dinner");setPortion("normal");setAnalyzing(false);setShowLogger(true)}
  function analyze(){if(loggerMode==="photo"&&!photoName)return;if(loggerMode==="describe"&&!mealText.trim())return;setAnalyzing(true);setTimeout(()=>{setAnalyzing(false);setResult(true)},650)}
  function confirm(){
    const baseName=mealText.trim()||photoName||(locale==="pt"?"Refeição por foto":"Photo meal"); const adjusted=portion==="small"?0.82:portion==="large"?1.2:1;
    setMeals(cur=>[{id:crypto.randomUUID(),name:baseName,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),calories:Math.round(575*adjusted),protein:Math.round(31*adjusted),carbs:Math.round(56*adjusted),fat:Math.round(18*adjusted),note:locale==="pt"?"Aprendida com sua correção":"Learned from your correction",confidence:"Medium",type:mealType},...cur]);
    setShowLogger(false);setMealText("");setResult(false);
  }
  function reset(){localStorage.removeItem("memo-demo");setOnboarded(false);setLandingSeen(false);setStep(1);setView("home");setGoal("maintain");setLocale("pt");setTheme("light");setProfile({name:"Alex",age:"24",weight:"72",height:"175"});setMeals(demoMeals)}
  function startUsual(m:Meal){setMealText(m.name);setMealType(m.type);setPortion("normal");setLoggerMode("usual");setResult(true);setShowLogger(true)}

  if(!landingSeen) return <main className="landing-shell"><header className="landing-nav"><div className="landing-brand"><span>M</span><b>Memo</b></div><button className="language-button" onClick={()=>setLocale(locale==="en"?"pt":"en")}><Icon name="globe" size={16}/>{locale.toUpperCase()}</button></header>
  <section className="landing-hero"><div className="landing-copy"><span className="landing-eyebrow"><i/> {t.landingEyebrow}</span><h1>{t.landingTitle}</h1><p>{t.landingText}</p><div className="landing-actions"><button className="primary-button" onClick={()=>setLandingSeen(true)}>{t.landingCta}<Icon name="arrow" size={18}/></button><a href="#how">{t.landingSecondary}<Icon name="chevron" size={16}/></a></div><div className="landing-proof"><span>✓</span><p>{t.landingProof}</p></div></div>
    <div className="landing-product" aria-hidden="true"><div className="product-glow"/><div className="product-window"><div className="product-top"><div className="product-brand"><span>M</span><b>Memo</b></div><span className="product-date">{t.today}</span></div><div className="product-greeting"><span>{t.today}</span><strong>{t.hello}, {profile.name || "Alex"}.</strong><small>{t.subtitle}</small></div><div className="product-grid"><div className="product-card product-calories"><span>{t.calories}</span><strong>1,110 <small>/ 2,200</small></strong><div className="product-ring"><b>50%</b></div><div className="product-macros"><i/><i/><i/></div></div><div className="product-card product-memory"><span>✦ {t.memory}</span><strong>{t.landingMemoryTitle}</strong><small>{t.memoryText}</small></div></div><div className="product-section"><span>{t.usual}</span><strong>{t.oneTapMeals}</strong><div className="product-meals"><div><b>◒</b><span>{locale==="pt"?"Frango, arroz e feijão":"Chicken rice bowl"}<small>620 kcal</small></span><i>+</i></div><div><b>◉</b><span>{locale==="pt"?"Iogurte e banana":"Greek yogurt & banana"}<small>280 kcal</small></span><i>+</i></div></div></div></div></div></section>
  <section className="landing-trust"><span>{t.landingFeature1}</span><span>{t.landingFeature2}</span><span>{t.landingFeature3}</span></section>
  <section className="landing-how" id="how"><div className="landing-section-head"><span className="landing-eyebrow"><i/> MEMO</span><h2>{t.landingHow}</h2><p>{t.landingHowText}</p></div><div className="landing-steps"><article><span>01</span><div className="step-icon"><Icon name="clock" size={21}/></div><h3>{t.landingStep1}</h3><p>{t.landingStep1Text}</p></article><article><span>02</span><div className="step-icon"><Icon name="check" size={21}/></div><h3>{t.landingStep2}</h3><p>{t.landingStep2Text}</p></article><article><span>03</span><div className="step-icon"><Icon name="spark" size={21}/></div><h3>{t.landingStep3}</h3><p>{t.landingStep3Text}</p></article></div></section>
  <section className="landing-memory"><div><span className="landing-eyebrow"><i/> {t.memory}</span><h2>{t.landingMemoryTitle}</h2><p>{t.landingMemoryText}</p><button className="primary-button" onClick={()=>setLandingSeen(true)}>{t.landingCtaBottom}<Icon name="arrow" size={18}/></button></div><div className="memory-demo"><div className="memory-demo-top"><span>MEMO</span><span>+ {locale==="pt"?"aprendido":"learned"}</span></div><div className="memory-line"><b>{locale==="pt"?"Frango, arroz e feijão":"Chicken, rice & beans"}</b><span>{locale==="pt"?"Sua refeição habitual":"Your usual meal"}</span></div><div className="memory-line faded"><b>{locale==="pt"?"Iogurte e banana":"Greek yogurt & banana"}</b><span>{locale==="pt"?"Registrada 4 vezes":"Logged 4 times"}</span></div><div className="memory-button">⚡ {locale==="pt"?"Registrar em um toque":"Log in one tap"}</div></div></section><footer className="landing-footer"><span>{t.landingFooter}</span><small>{t.landingPrivacy}</small></footer></main>;

  if(!onboarded) return <main className="onboarding-shell">
    <div className="brand-mark">M</div>
    <div className="onboarding-card">
      <div className="eyebrow"><span className="eyebrow-dot"/> MEMO</div>
      {step===1 && <><div className="hero-orb"><Icon name="spark" size={34}/></div><h1>{t.welcome}</h1><p>{t.welcomeText}</p>
        <div className="feature-list"><div><span>01</span><b>{t.onboardingFeature1}</b></div><div><span>02</span><b>{t.onboardingFeature2}</b></div><div><span>03</span><b>{t.onboardingFeature3}</b></div></div>
        <button className="primary-button wide" onClick={()=>setStep(2)}>{t.continue}<Icon name="arrow"/></button></>}
      {step===2 && <><button className="back-button" onClick={()=>setStep(1)}><Icon name="back" size={18}/>{t.back}</button><h1>{t.goalTitle}</h1><p>{t.goalText}</p>
        <div className="choice-list">{(["lose","maintain","gain"] as Goal[]).map(g=><button key={g} className={"choice "+(goal===g?"selected":"")} onClick={()=>setGoal(g)}><span>{g==="lose"?"↓":g==="gain"?"↑":"→"}</span><b>{t[g]}</b>{goal===g&&<Icon name="check" size={18}/>}</button>)}</div>
        <button className="primary-button wide" onClick={()=>setStep(3)}>{t.continue}<Icon name="arrow"/></button></>}
      {step===3 && <><button className="back-button" onClick={()=>setStep(2)}><Icon name="back" size={18}/>{t.back}</button><h1>{t.detailsTitle}</h1><p>{t.detailsText}</p>
        <div className="input-grid"><label>{t.name}<input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} placeholder="Alex"/></label><label>{t.age}<input value={profile.age} onChange={e=>setProfile(p=>({...p,age:e.target.value}))} placeholder="24" inputMode="numeric"/></label><label>{t.weight}<input value={profile.weight} onChange={e=>setProfile(p=>({...p,weight:e.target.value}))} placeholder="72" inputMode="decimal"/></label><label>{t.height}<input value={profile.height} onChange={e=>setProfile(p=>({...p,height:e.target.value}))} placeholder="175" inputMode="numeric"/></label></div>
        <button className="primary-button wide" disabled={!profile.name.trim()||Number(profile.age)<13||Number(profile.weight)<=0||Number(profile.height)<=0} onClick={()=>{setOnboarded(true);setView("home")}}>{t.finish}<Icon name="arrow"/></button></>}
    </div>
    <div className="onboarding-footer"><span>01</span><div className="steps"><i className={step>=1?"active":""}/><i className={step>=2?"active":""}/><i className={step>=3?"active":""}/></div><span>03</span></div>
  </main>;

  const nav:[View,string,string][]=[["home",t.home,"home"],["history",t.history,"clock"],["progress",t.progress,"chart"],["settings",t.settings,"settings"]];

  return <div className="app-shell">
    <aside className="sidebar"><div className="sidebar-logo"><span>M</span><strong>Memo</strong></div><nav>{nav.map(([k,l,i])=><button key={k} className={"nav-item "+(view===k?"active":"")} onClick={()=>setView(k)}><Icon name={i} size={19}/><span>{l}</span></button>)}</nav>
      <div className="sidebar-memory"><Icon name="spark" size={17}/><b>{t.memory}</b><p>{t.memoryText}</p></div><div className="profile-mini"><div className="avatar">A</div><div><b>{profile.name || "Alex"}</b><span>{t.freePlan}</span></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="mobile-brand"><span>M</span><b>Memo</b></div><div className="topbar-actions">
        <button className="icon-button" onClick={()=>setTheme(theme==="light"?"dark":"light")} aria-label={t.themeAria}><Icon name={theme==="light"?"moon":"sun"} size={19}/></button>
        <button className="language-button" onClick={()=>setLocale(locale==="en"?"pt":"en")}><Icon name="globe" size={17}/>{locale.toUpperCase()}</button><div className="avatar">A</div>
      </div></header>

      {view==="home" && <div className="page-wrap">
        <section className="welcome-row"><div><span className="muted-label">{t.today} · {new Date().toLocaleDateString(locale==="pt"?"pt-PT":"en-US",{month:"short",day:"numeric"}).toUpperCase()}</span><h1>{t.hello}, {profile.name || "Alex"}.</h1><p>{t.subtitle}</p></div><button className="primary-button desktop-add" onClick={()=>openLogger()}><Icon name="plus" size={19}/>{t.addMeal}</button></section>
        <section className="dashboard-grid"><div className="card calorie-card"><div className="card-heading"><div><span className="muted-label">{t.calories}</span><h2>{formatNumber(calories)} <small>/ {formatNumber(target)}</small></h2><span className="calorie-remaining">{formatNumber(remainingCalories)} kcal {t.remaining}</span></div><ProgressRing value={calories} max={target}/></div>
          <div className="macro-row"><div><span className="macro-dot"/><span>{t.protein}</span><b>{protein}g</b></div><div><span className="macro-dot carbs"/><span>{t.carbs}</span><b>{carbs}g</b></div><div><span className="macro-dot fat"/><span>{t.fat}</span><b>{fat}g</b></div></div></div>
          <div className="card memory-card"><div className="memory-icon"><Icon name="spark" size={21}/></div><span className="muted-label">{t.memory}</span><h3>{t.landingMemoryTitle}</h3><p>{t.memoryText}</p><button className="text-button" onClick={()=>setView("history")}>{t.seeAll}<Icon name="arrow" size={15}/></button></div>
        </section>
        <section className="section"><div className="section-heading"><div><span className="muted-label">{t.usual}</span><h2>{t.oneTapMeals}</h2></div><button className="text-button" onClick={()=>setView("history")}>{t.seeAll}<Icon name="chevron" size={15}/></button></div>
          <div className="usual-grid">{learned.map(m=><button className="usual-card" key={m.id} onClick={()=>startUsual(m)}><div className="meal-symbol">{m.type==="Breakfast"?"☀":m.type==="Lunch"?"◒":"◉"}</div><div><b>{locale==="pt"?(m.id==="1"?"Frango com arroz":m.id==="2"?"Iogurte grego e banana":m.id==="3"?"Maçã e pasta de amendoim":m.name):m.name}</b><span>{m.calories} kcal · {m.protein}g {locale==="pt"?"proteína":"protein"}</span></div><Icon name="plus" size={17}/></button>)}</div>
        </section>
        <section className="section"><div className="section-heading"><div><span className="muted-label">{t.recent}</span><h2>{t.today}</h2></div><button className="text-button" onClick={()=>setView("history")}>{t.seeAll}<Icon name="arrow" size={15}/></button></div>
          <div className="meal-list">{meals.slice(0,4).map(m=><div className="meal-row" key={m.id}><div className="meal-symbol soft">{m.type==="Breakfast"?"☀":m.type==="Lunch"?"◒":m.type==="Snack"?"◉":"◍"}</div><div className="meal-main"><b>{locale==="pt"?(m.id==="1"?"Frango com arroz":m.id==="2"?"Iogurte grego e banana":m.id==="3"?"Maçã e pasta de amendoim":m.name):m.name}</b><span>{m.time} · {locale==="pt"?(m.id==="1"?"Seu almoço habitual":m.id==="2"?"Registrada de uma refeição salva":m.id==="3"?"Estimativa da descrição":m.note):m.note}</span></div><div className="meal-kcal"><b>{m.calories}</b><span>kcal</span></div><Icon name="chevron" size={16}/></div>)}</div>
        </section>
      </div>}

      {view==="history" && <div className="page-wrap"><section className="welcome-row compact"><div><span className="muted-label">{t.historyEyebrow}</span><h1>{t.history}</h1><p>{t.historySubtitle}</p></div><button className="primary-button" onClick={()=>openLogger()}><Icon name="plus" size={19}/>{t.addMeal}</button></section>
        <div className="history-day"><div className="day-label">{t.todayUpper} <span>{meals.length} {t.mealsLabel}</span></div>{meals.map(m=><div className="meal-row large" key={m.id}><div className="meal-symbol soft">◒</div><div className="meal-main"><b>{locale==="pt"?(m.id==="1"?"Frango com arroz":m.id==="2"?"Iogurte grego e banana":m.id==="3"?"Maçã e pasta de amendoim":m.name):m.name}</b><span>{m.time} · {locale==="pt"?(m.id==="1"?"Seu almoço habitual":m.id==="2"?"Registrada de uma refeição salva":m.id==="3"?"Estimativa da descrição":m.note):m.note}</span></div><div className="confidence">{m.confidence==="High"?t.high:t.medium}<i/></div><div className="meal-kcal"><b>{m.calories}</b><span>kcal</span></div></div>)}</div>
      </div>}

      {view==="progress" && <div className="page-wrap"><section className="welcome-row compact"><div><span className="muted-label">{t.progressEyebrow}</span><h1>{t.progress}</h1><p>{t.progressSubtitle}</p></div></section>
        <div className="progress-grid"><div className="card progress-main"><span className="muted-label">{t.intakeLabel}</span><h2>{formatNumber(meals.length?Math.round(calories/Math.max(1,meals.length)):0)} <small>{t.avgLabel}</small></h2><div className="bars">{Array.from({length:7},(_,i)=>{const v=meals.length?Math.min(100,Math.round((calories/Math.max(1,meals.length))/target*100)+(i===6?0:-i*3)):0;return <div className="bar-col" key={i}><div className="bar" style={{height:Math.max(8,v)+"%"}}/><span>{(locale==="pt"?["S","T","Q","Q","S","S","D"]:["M","T","W","T","F","S","S"])[i]}</span></div>})}</div></div>
          <div className="card"><span className="muted-label">{t.consistency}</span><h2>{meals.length>0?"1 / 1":"0 / 1"}</h2><p className="card-note">{meals.length>0?t.loggedDays:t.noMealsYet}</p><div className="streak"><Icon name="flame" size={18}/> {meals.length>0?t.streak:t.startStreak}</div></div></div>
      </div>}

      {view==="settings" && <div className="page-wrap"><section className="welcome-row compact"><div><span className="muted-label">{t.settingsEyebrow}</span><h1>{t.settings}</h1><p>{t.settingsSubtitle}</p></div></section>
        <div className="settings-list"><div className="settings-section"><span className="muted-label">{t.appearance}</span><button onClick={()=>setTheme(theme==="light"?"dark":"light")}><div className="setting-icon"><Icon name={theme==="light"?"sun":"moon"}/></div><div><b>{theme==="light"?t.light:t.dark}</b><span>{t.switchTheme}</span></div><Icon name="chevron"/></button></div>
          <div className="settings-section"><span className="muted-label">{t.language}</span><button onClick={()=>setLocale(locale==="en"?"pt":"en")}><div className="setting-icon"><Icon name="globe"/></div><div><b>{locale==="en"?"English":"Português"}</b><span>{t.changeLanguage}</span></div><Icon name="chevron"/></button></div>
          <div className="settings-section"><span className="muted-label">{t.demo}</span><div className="demo-note"><Icon name="info"/><p>{t.demoText}</p></div><button className="danger-button" onClick={reset}>{t.reset}</button></div>
        </div>
      </div>}
    </main>

    <nav className="bottom-nav">{nav.map(([k,l,i])=><button key={k} className={view===k?"active":""} onClick={()=>setView(k)}><Icon name={i} size={20}/><span>{l}</span></button>)}</nav>
    <button className="floating-add" onClick={()=>openLogger()}><Icon name="plus" size={23}/></button>

    {showLogger && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowLogger(false)}}><div className="meal-modal meal-modal-rich">
      <div className="modal-header"><div><span className="muted-label">{t.logEyebrow}</span><h2>{result?t.reviewMealTitle:t.addMealTitle}</h2></div><button className="icon-button" onClick={()=>setShowLogger(false)}><Icon name="close"/></button></div>
      {!result ? <>
        <div className="logger-tabs"><button className={loggerMode==="describe"?"active":""} onClick={()=>setLoggerMode("describe")}>✍️ {t.describe}</button><button className={loggerMode==="photo"?"active":""} onClick={()=>setLoggerMode("photo")}>📷 {t.photo}</button><button className={loggerMode==="usual"?"active":""} onClick={()=>setLoggerMode("usual")}>⚡ {t.usualMeal}</button></div>
        {loggerMode==="describe" && <><p className="modal-copy">{t.describeHint}</p><textarea value={mealText} onChange={e=>setMealText(e.target.value)} placeholder={t.describePlaceholder} autoFocus/><div className="quick-examples"><button onClick={()=>setMealText(locale==="pt"?"Frango grelhado, arroz e feijão":"Grilled chicken, rice and beans")}>{t.quickChicken}</button><button onClick={()=>setMealText(locale==="pt"?"Aveia, banana e pasta de amendoim":"Oatmeal, banana and peanut butter")}>{t.quickOatmeal}</button><button onClick={()=>setMealText(locale==="pt"?"Iogurte grego e fruta":"Greek yogurt and fruit")}>{t.quickYogurt}</button></div></>}
        {loggerMode==="photo" && <><p className="modal-copy">{t.photoDesc}</p><label className="photo-drop"><input type="file" accept="image/*" capture="environment" onChange={e=>setPhotoName(e.target.files?.[0]?.name||"")}/><span className="photo-icon">📷</span><b>{photoName||t.addPhoto}</b><small>{photoName?t.photoReady:t.photoHint}</small></label></>}
        {loggerMode==="usual" && <div className="usual-picker">{learned.map(m=><button key={m.id} onClick={()=>{setMealText(m.name);setMealType(m.type);setResult(true)}}><span className="meal-symbol">{m.type==="Breakfast"?"☀":m.type==="Lunch"?"◒":"◉"}</span><span><b>{m.name}</b><small>{m.calories} kcal · {t.usedBefore}</small></span><Icon name="chevron" size={16}/></button>)}</div>}
        <div className="logger-details"><label><span>{t.meal}</span><select value={mealType} onChange={e=>setMealType(e.target.value as Meal["type"])}><option value="Breakfast">{t.breakfast}</option><option value="Lunch">{t.lunch}</option><option value="Snack">{t.snack}</option><option value="Dinner">{t.dinner}</option></select></label><label><span>{t.portion}</span><select value={portion} onChange={e=>setPortion(e.target.value)}><option value="small">{t.small}</option><option value="normal">{t.normal}</option><option value="large">{t.large}</option></select></label></div>
        <div className="modal-tip"><Icon name="spark" size={17}/><span>{t.mealTip}</span></div>
        <button className="primary-button wide" disabled={analyzing||(loggerMode==="photo"?!photoName:loggerMode==="usual"?false:!mealText.trim())} onClick={analyze}>{analyzing?t.analyzing:t.analyze}<Icon name="arrow"/></button>
      </> : <>
        <div className="review-source"><span className="source-pill">{loggerMode==="photo"?t.sourcePhoto:loggerMode==="usual"?t.sourceUsual:t.sourceDescription}</span><span className="confidence-pill">{t.confidenceMedium}</span></div>
        <div className="meal-preview-card"><div className="meal-symbol">{mealType==="Breakfast"?"☀":mealType==="Lunch"?"◒":mealType==="Snack"?"◉":"◍"}</div><div><b>{mealText||photoName||t.yourMeal}</b><span>{mealType==="Breakfast"?t.breakfast:mealType==="Lunch"?t.lunch:mealType==="Snack"?t.snack:t.dinner} · {t.portionLabel}: {portion==="small"?t.small.toLowerCase():portion==="large"?t.large.toLowerCase():t.normal.toLowerCase()}</span></div><button className="text-button" onClick={()=>setResult(false)}>{t.edit}</button></div>
        <div className="estimate estimate-rich"><div><span className="muted-label">{t.estimatedEnergy}</span><strong>{portion==="small"?"450–510":portion==="large"?"650–730":"540–610"}</strong><span>kcal</span></div><div className="estimate-badge">{t.approximate}</div></div>
        <div className="estimate-grid"><div><span>{t.proteinShort}</span><b>{portion==="small"?"25":"31"}g</b></div><div><span>{t.carbsShort}</span><b>{portion==="large"?"67":"56"}g</b></div><div><span>{t.fatShort}</span><b>{portion==="small"?"15":"18"}g</b></div></div>
        <div className="uncertainty"><Icon name="info" size={17}/><div><b>{t.uncertaintyTitle}</b><p>{t.uncertaintyText}</p></div></div>
        <div className="correction-box"><b>{t.quickCorrection}</b><div><button className={portion==="small"?"selected":""} onClick={()=>setPortion("small")}>{t.smaller}</button><button className={portion==="normal"?"selected":""} onClick={()=>setPortion("normal")}>{t.aboutRight}</button><button className={portion==="large"?"selected":""} onClick={()=>setPortion("large")}>{t.larger}</button></div></div>
        <div className="modal-actions"><button className="secondary-button" onClick={()=>setResult(false)}>{t.back}</button><button className="primary-button" onClick={confirm} disabled={!mealText.trim()&&!photoName}>{t.confirmRemember} <Icon name="check" size={18}/></button></div>
        <div className="learned-banner"><Icon name="spark" size={17}/><div><b>{t.learnedBannerTitle}</b><span>{t.learnedBannerText}</span></div></div>
      </>}
    </div></div>}
  </div>;
}
