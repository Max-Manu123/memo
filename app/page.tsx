"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseAuth } from "../lib/auth.supabase";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

type Goal = "lose" | "maintain" | "gain";
type View = "home" | "history" | "progress" | "settings";
type Theme = "light" | "dark" | "system";
type Locale = "en" | "pt";
type TrackingMethod = "search" | "text" | "photo" | "weigh" | "repeat" | "none";
type TrackingPain = "repeat" | "search" | "manual" | "remember" | "corrections" | "speed" | "none";
type Meal = {
  id: string; name: string; time: string; calories: number; protein: number;
  carbs: number; fat: number; note: string; confidence: "High" | "Medium";
  type: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  loggedAt?: string; saved?: boolean; useCount?: number; savedMealId?: string; photoName?: string;
};

const demoMeals: Meal[] = [];

type FoodItem = { id:string; pt:string; en:string; aliases:string[]; calories:number; protein:number; carbs:number; fat:number };
const foodDatabase: FoodItem[] = [
  {id:"rice",pt:"Arroz cozido",en:"Cooked rice",aliases:["arroz","rice"],calories:130,protein:2.7,carbs:28,fat:.3},
  {id:"chicken",pt:"Frango grelhado",en:"Grilled chicken",aliases:["frango","chicken"],calories:165,protein:31,carbs:0,fat:3.6},
  {id:"beans",pt:"Feijão cozido",en:"Cooked beans",aliases:["feijão","feijao","beans"],calories:127,protein:8.7,carbs:22.8,fat:.5},
  {id:"egg",pt:"Ovo",en:"Egg",aliases:["ovo","ovos","egg","eggs"],calories:143,protein:12.6,carbs:.7,fat:9.5},
  {id:"banana",pt:"Banana",en:"Banana",aliases:["banana"],calories:89,protein:1.1,carbs:22.8,fat:.3},
  {id:"oats",pt:"Aveia",en:"Oatmeal",aliases:["aveia","oatmeal","oats"],calories:389,protein:16.9,carbs:66.3,fat:6.9},
  {id:"yogurt",pt:"Iogurte grego",en:"Greek yogurt",aliases:["iogurte","iogurte grego","yogurt","greek yogurt"],calories:73,protein:9.9,carbs:3.9,fat:2},
  {id:"bread",pt:"Pão",en:"Bread",aliases:["pão","pao","bread"],calories:266,protein:8.9,carbs:49,fat:3.2},
  {id:"apple",pt:"Maçã",en:"Apple",aliases:["maçã","maca","apple"],calories:52,protein:.3,carbs:13.8,fat:.2},
  {id:"peanut",pt:"Pasta de amendoim",en:"Peanut butter",aliases:["pasta de amendoim","peanut butter"],calories:588,protein:25,carbs:20,fat:50},
];

const copy = {
  en: {
    morning:"Good morning", afternoon:"Good afternoon", evening:"Good evening", hello:"Good evening", subtitle:"Keep it simple. Memo learns as you eat.", today:"Today", addMeal:"Log a meal",
    calories:"Calories", protein:"Protein", carbs:"Carbs", fat:"Fat", home:"Home", history:"History",
    progress:"Progress", settings:"Settings", remaining:"remaining", usual:"Your usuals", recent:"Recent meals",
    seeAll:"See all", memory:"Memo memory", memoryText:"Your recent meals can become one-tap suggestions.",
    welcome:"Food tracking that gets easier over time.", welcomeText:"Register once. Next time, Memo remembers.",
    continue:"Continue", back:"Back", goalTitle:"What are you working toward?",
    goalText:"We’ll use this to make your daily targets useful—not perfect.", lose:"Lose weight",
    maintain:"Maintain weight", gain:"Gain weight", detailsTitle:"A little about you",
    detailsText:"Your name is required. The other details are optional and stay on your device in this MVP.", name:"First name", age:"Age", skip:"Skip for now",
    weight:"Weight (kg)", height:"Height (cm)", finish:"Enter Memo", logTitle:"What did you eat?",
    logText:"Describe it naturally. Memo will estimate and ask only what matters.",
    placeholder:"e.g. chicken, rice and vegetables",
    result:"Memo's estimate", confirm:"Confirm meal", learned:"Memo learned this",
    learnedText:"Next time, you can log this meal in one tap.", noPressure:"No fake precision",
    range:"Estimated range", appearance:"Appearance", language:"Language", themeSystem:"System", dark:"Dark", light:"Light",
     historySubtitle:"Your meals, corrections and learned patterns.", progressSubtitle:"See what you have actually logged so far.", settingsSubtitle:"Make Memo feel like yours.", historyEyebrow:"MEMO / HISTORY", progressEyebrow:"MEMO / PROGRESS", settingsEyebrow:"MEMO / PREFERENCES", todayUpper:"TODAY", mealsLabel:"meals", intakeLabel:"TODAY'S INTAKE", avgLabel:"avg kcal", consistency:"TODAY", loggedDays:"Use your real logged meals to build a pattern over time.", streak:"meals logged today", noMealsYet:"Log your first meal to start building a real pattern.", startStreak:"Log your first meal", profile:"PROFILE", editProfile:"Edit profile", editProfileText:"Update the details you entered during onboarding. You can change them anytime.", saveChanges:"Save changes", cancel:"Cancel", goalSettingsTitle:"Choose your current goal", profileUpdated:"Profile updated.", goal:"Goal",
    landingEyebrow:"FOOD TRACKING, REIMAGINED", landingLogin:"Log in", landingTitle:"Log your meals once. Make the next ones faster.", landingText:"Memo learns the meals you repeat, remembers your corrections, and turns recurring meals into faster suggestions.", landingCta:"Start free", landingSecondary:"See how it works", landingProof:"No perfect measurements. No endless food searches. Just a simpler way to keep track.", landingHow:"A tracker that learns you.", landingHowText:"Most trackers make you do the same work every day. Memo is designed to remove that work over time.", landingStep1:"Log naturally", landingStep1Text:"Describe a meal, use a photo, or pick a usual. Start with what you already know.", landingStep2:"Correct once", landingStep2Text:"If an estimate is off, make a quick correction. Memo keeps the useful part.", landingStep3:"Log faster next time", landingStep3Text:"Your recurring meals become one-tap suggestions, so tracking gets lighter.", landingFeature1:"Remembers your usual meals", landingFeature2:"Asks only what matters", landingFeature3:"Shows honest estimates", landingMemoryTitle:"Less logging. More knowing.", landingMemoryText:"The goal is not to make you log perfectly. It is to make you need less logging over time.", landingCtaBottom:"Start building your food memory", landingPrivacy:"Explore without an account. Create one when you want to keep your food memory.", landingFooter:"Memo · Food tracking that learns you.", authTitle:"Welcome back", authSignupTitle:"Create your Memo account", authLoginText:"Sign in to continue where you left off.", authSignupText:"Start free and keep your food memory with you.", email:"Email", password:"Password", login:"Log in", signup:"Create account", noAccount:"Don’t have an account?", hasAccount:"Already have an account?", switchSignup:"Start free", switchLogin:"Log in", authBack:"Back to Memo", backToMemo:"Back to Memo", authLoading:"Please wait…", authCheckEmail:"Check your email to confirm your account, then log in.", authConfig:"Connect Supabase to enable accounts.", authEmailRequired:"Enter a valid email.", authPasswordRequired:"Use at least 8 characters.", authGeneric:"Something went wrong. Please try again.", authEmailHint:"Use the email you want to use for Memo.", authPasswordHint:"At least 8 characters, with an uppercase letter, a lowercase letter, and a number.", authConfirmPassword:"Confirm password", authConfirmHint:"Enter the same password again.", authPasswordMismatch:"Passwords do not match.", authWeakPassword:"Use 8–128 characters, including at least one uppercase letter, one lowercase letter, and one number.", authForgotPassword:"Forgot your password?", authResetTitle:"Reset your password", authResetText:"Enter your email and we’ll send you a secure reset link.", authResetPasswordTitle:"Choose a new password", authResetPasswordText:"Create a new password for your Memo account.", authSendReset:"Send reset link", authResetSent:"Check your email for a password reset link.", authPasswordUpdated:"Password updated. You can now log in.", authBackToLogin:"Back to login", authSaveNewPassword:"Save new password", authAccountCreated:"Account created. Check your email to confirm it, then come back and log in.", authEmailInUse:"This email may already have an account. Try logging in instead.", authInvalidCredentials:"Email or password is incorrect.", authRateLimited:"Too many attempts. Please wait a moment and try again.", authPasswordTooShort:"Password must contain at least 8 characters.", accountReadyTitle:"Your Memo is ready.", accountReadyText:"Create a free account to keep your food memory and continue across devices.", accountBenefit1:"Keep your food history saved", accountBenefit2:"Continue using Memo on other devices", accountBenefit3:"Keep your learned meals with you", createFreeAccount:"Create free account", continueWithoutAccount:"Continue without an account", alreadyAccount:"Already have an account?", accountSecurity:"Your account is secured by Supabase Auth.", onboardingFeature1:"Remember your usual meals", onboardingFeature2:"Learn from your corrections", onboardingFeature3:"Make future logs faster", trackingTitle:"How do you usually track food?", trackingText:"Tell Memo what your current routine looks like. You can choose more than one.", trackingSearch:"Search foods", trackingTextMethod:"Write what I ate", trackingPhoto:"Take photos", trackingWeigh:"Weigh portions", trackingRepeat:"Reuse previous meals", trackingNone:"I don’t track yet", invalidGoal:"Choose a goal before continuing.", invalidTracking:"Choose at least one way you currently track food.", invalidPain:"Choose what you would most like to make easier.", profileEyebrow:"PROFILE · OPTIONAL", profileTitle:"A little about you", profileText:"Start with the essentials. Your name is the only required detail. Everything else is optional.", painTitle:"What would you most like to make easier?", painText:"This helps Memo focus on the part of tracking that matters most to you.", painRepeat:"Logging the same meals again", painSearch:"Finding the same foods again", painManual:"Typing everything manually", painRemember:"Remembering what I ate", painCorrections:"Correcting portions or estimates", painSpeed:"Logging quickly", painNone:"I don’t have a specific problem yet", namePlaceholder:"Your name", optional:"Optional", required:"Required", ageRange:"13–100 years", weightRange:"30–300 kg", heightRange:"100–230 cm", onboardingStep1:"A lighter way to track", onboardingStep2:"Choose your direction", onboardingStep3:"Make it personal", onboardingTime:"About 30 seconds · You can go back or change this later", goalLoseText:"I want to reduce my weight over time.", goalMaintainText:"I want to maintain my weight and track my food.", goalGainText:"I want to increase my weight over time.", detailsHint:"Add only what you want. You can complete or change these details later.", invalidName:"Use at least 2 characters.", invalidAge:"Enter an age from 13 to 100.", invalidWeight:"Enter a weight from 30 to 300 kg.", invalidHeight:"Enter a height from 100 to 230 cm.", nameHint:"What should Memo call you?", ageHint:"13–100", weightHint:"Your current weight", heightHint:"Your height", describe:"Describe", photo:"Photo", usualMeal:"Usual", photoDesc:"Add a photo of your meal. Image analysis is prepared for the real AI integration; the MVP keeps this step local.", addPhoto:"Add a meal photo", photoReady:"Photo ready to analyze", photoHint:"Tap to take a photo or choose one", photoAiTitle:"AI photo analysis is prepared", photoAiText:"The photo flow is ready for the future AI integration. Nutrition analysis is not active in this MVP.", photoAiAction:"AI analysis coming soon", meal:"Meal", portion:"Portion", breakfast:"Breakfast", lunch:"Lunch", snack:"Snack", dinner:"Dinner", usedBefore:"used before", sourcePhoto:"📷 Photo", sourceUsual:"⚡ Usual meal", sourceDescription:"✍️ Description", estimatedEnergy:"ESTIMATED ENERGY", proteinShort:"Protein", carbsShort:"Carbs", fatShort:"Fat", portionLabel:"portion", yourMeal:"Your meal", themeAria:"Theme", switchTheme:"Switch the interface theme", changeLanguage:"Change app language", freePlan:"Free plan", oneTapMeals:"One-tap meals", upgrade:"Upgrade to Memo Pro", upgradeTitle:"Make Memo work harder for you.", upgradeText:"More memory, more useful patterns, and less repeated work.", upgradePrice:"$9/month", upgradeBenefit1:"Unlimited usual meals", upgradeBenefit2:"Full meal history", upgradeBenefit3:"Pattern and habit insights", upgradeBenefit4:"Smarter suggestions", upgradeBenefit5:"Advanced logging features", upgradeAction:"Join the Pro waitlist", upgradeEmailHint:"We’ll use this email only for the Memo Pro launch.", upgradeSuccess:"You’re on the Pro list. We’ll email you when it’s ready.", upgradeAlready:"This email is already on the list.", upgradeNeedEmail:"Enter your email to join the Pro list.", upgradeClose:"Not now", databaseTitle:"Food database", databaseHint:"Search common foods or add one to your meal.", databasePlaceholder:"Search foods…", databaseEmpty:"No matching foods.", noMeals:"No meals logged yet.", noMealsText:"Start with your next meal. Memo will build your memory from real entries.", noUsuals:"Your usual meals will appear here after you save a few.", usedTimes:"times", last7:"LAST 7 DAYS", avgDaily:"Daily average", daysActive:"Days active", topMeals:"Most repeated", noPattern:"Your patterns will appear after you log a few meals.", logEyebrow:"MEMO / MEAL LOG", addMealTitle:"Add a meal", reviewMealTitle:"Review your meal", describeHint:"Tell Memo what you ate in your own words. No need to search a food database.", describePlaceholder:"e.g. grilled chicken, 1 cup rice and beans", quickChicken:"Chicken + rice", quickOatmeal:"Oatmeal + banana", quickYogurt:"Yogurt + banana", mealTip:"Memo learns from corrections, so you do not need perfect measurements.", analyze:"Review estimate", analyzing:"Analyzing…", confidenceMedium:"Medium confidence", edit:"Edit", mealName:"Meal name", approximate:"Approximate", uncertaintyTitle:"What could change this?", uncertaintyText:"The biggest source of variation is how much you actually ate. If this portion was smaller or larger than shown, adjust it below.", quickCorrection:"Adjust portion", smaller:"I ate less", aboutRight:"This looks right", larger:"I ate more", confirmRemember:"Confirm & remember", learnedBannerTitle:"Memo will remember this", learnedBannerText:"Next time, this meal can become a one-tap suggestion.", small:"Small", normal:"Normal", large:"Large", high:"High", medium:"Medium",
  },
  pt: {
    morning:"Bom dia", afternoon:"Boa tarde", evening:"Boa noite", hello:"Boa noite", subtitle:"Mantenha simples. O Memo aprende enquanto você come.", today:"Hoje", addMeal:"Registrar refeição",
    calories:"Calorias", protein:"Proteína", carbs:"Carboidratos", fat:"Gordura", home:"Início", history:"Histórico",
    progress:"Progresso", settings:"Definições", remaining:"restantes", usual:"Seus habituais", recent:"Refeições recentes",
    seeAll:"Ver tudo", memory:"Memória do Memo", memoryText:"Suas refeições recentes podem virar sugestões de um toque.",
    welcome:"Controle alimentar sem trabalho repetido.", welcomeText:"Registre uma refeição do seu jeito. O Memo aprende seus hábitos para tornar os próximos registros mais rápidos.",
    continue:"Continuar", back:"Voltar", goalTitle:"O que você quer alcançar?",
    goalText:"Usaremos isso para tornar suas metas úteis — não perfeitas.", lose:"Perder peso",
    maintain:"Manter peso", gain:"Ganhar peso", detailsTitle:"Um pouco sobre você",
    detailsText:"Seu nome é necessário. Os outros dados são opcionais e ficam no dispositivo neste MVP.", name:"Nome", age:"Idade", skip:"Pular por agora",
    weight:"Peso (kg)", height:"Altura (cm)", finish:"Entrar no Memo", logTitle:"O que você comeu?",
    logText:"Descreva naturalmente. O Memo estima e pergunta só o que importa.",
    placeholder:"ex.: frango, arroz e legumes",
    result:"Estimativa do Memo", confirm:"Confirmar refeição", learned:"O Memo aprendeu isso",
    learnedText:"Na próxima vez, você poderá registrar esta refeição com um toque.", noPressure:"Sem falsa precisão",
    range:"Faixa estimada", appearance:"Aparência", language:"Idioma", themeSystem:"Sistema", dark:"Escuro", light:"Claro",
     historySubtitle:"Suas refeições, correções e padrões aprendidos.", progressSubtitle:"Veja o que você realmente registrou até agora.", settingsSubtitle:"Deixe o Memo com a sua cara.", historyEyebrow:"MEMO / HISTÓRICO", progressEyebrow:"MEMO / PROGRESSO", settingsEyebrow:"MEMO / DEFINIÇÕES", todayUpper:"HOJE", mealsLabel:"refeições", intakeLabel:"CONSUMO DE HOJE", avgLabel:"média kcal", consistency:"HOJE", loggedDays:"Use suas refeições reais para criar um padrão ao longo do tempo.", streak:"refeições registradas hoje", noMealsYet:"Registre sua primeira refeição para começar a criar um padrão real.", startStreak:"Registrar primeira refeição", profile:"PERFIL", editProfile:"Editar perfil", editProfileText:"Atualize os dados que você informou no onboarding. Você pode alterá-los quando quiser.", saveChanges:"Guardar alterações", cancel:"Cancelar", goalSettingsTitle:"Escolha o seu objetivo atual", profileUpdated:"Perfil atualizado.", goal:"Objetivo",
    landingEyebrow:"REGISTRO ALIMENTAR, REIMAGINADO", landingLogin:"Entrar", landingTitle:"Registre suas refeições. As próximas ficam mais rápidas.", landingText:"O Memo aprende as refeições que você repete, lembra suas correções e transforma seus habituais em sugestões mais rápidas.", landingCta:"Começar grátis", landingSecondary:"Ver como funciona", landingProof:"Sem medições perfeitas. Sem procurar alimentos o tempo todo. Só uma forma mais simples de registrar.", landingHow:"Um tracker que aprende com você.", landingHowText:"A maioria dos trackers faz você repetir o mesmo trabalho todos os dias. O Memo foi pensado para remover esse trabalho com o tempo.", landingStep1:"Registre naturalmente", landingStep1Text:"Descreva uma refeição, use uma foto ou escolha um habitual. Comece pelo que você já sabe.", landingStep2:"Corrija uma vez", landingStep2Text:"Se a estimativa estiver errada, faça uma correção rápida. O Memo guarda o que importa.", landingStep3:"Registre mais rápido", landingStep3Text:"Suas refeições recorrentes viram sugestões de um toque, deixando o controle mais leve.", landingFeature1:"Lembra seus habituais", landingFeature2:"Pergunta só o que importa", landingFeature3:"Mostra estimativas honestas", landingMemoryTitle:"Menos registros. Mais conhecimento.", landingMemoryText:"O objetivo não é fazer você registrar perfeitamente. É fazer você precisar registrar menos com o tempo.", landingCtaBottom:"Começar a criar sua memória alimentar", landingPrivacy:"Explore sem conta. Crie uma quando quiser guardar sua memória alimentar.", landingFooter:"Memo · Controle alimentar que aprende com você.", authTitle:"Bem-vindo de volta", authSignupTitle:"Crie sua conta no Memo", authLoginText:"Entre para continuar de onde parou.", authSignupText:"Comece grátis e leve sua memória alimentar com você.", email:"Email", password:"Senha", login:"Entrar", signup:"Criar conta", noAccount:"Ainda não tem conta?", hasAccount:"Já tem uma conta?", switchSignup:"Começar grátis", switchLogin:"Entrar", authBack:"Voltar para o Memo", backToMemo:"Voltar para o Memo", authLoading:"Aguarde…", authCheckEmail:"Verifique seu email para confirmar a conta e depois entre.", authConfig:"Conecte o Supabase para ativar as contas.", authEmailRequired:"Digite um email válido.", authPasswordRequired:"Use pelo menos 8 caracteres.", authGeneric:"Algo deu errado. Tente novamente.", authEmailHint:"Use o email que você quer usar no Memo.", authPasswordHint:"Pelo menos 8 caracteres, com uma letra maiúscula, uma letra minúscula e um número.", authConfirmPassword:"Confirmar senha", authConfirmHint:"Digite a mesma senha novamente.", authPasswordMismatch:"As senhas não coincidem.", authWeakPassword:"Use 8–128 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula e um número.", authForgotPassword:"Esqueci minha senha", authResetTitle:"Redefinir sua senha", authResetText:"Digite seu email e enviaremos um link seguro para redefinir sua senha.", authResetPasswordTitle:"Escolha uma nova senha", authResetPasswordText:"Crie uma nova senha para sua conta do Memo.", authSendReset:"Enviar link de redefinição", authResetSent:"Verifique seu email para encontrar o link de redefinição.", authPasswordUpdated:"Senha atualizada. Agora você pode entrar.", authBackToLogin:"Voltar para entrar", authSaveNewPassword:"Salvar nova senha", authAccountCreated:"Conta criada. Verifique seu email para confirmá-la e depois entre no Memo.", authEmailInUse:"Este email pode já ter uma conta. Tente entrar em vez disso.", authInvalidCredentials:"O email ou a senha estão incorretos.", authRateLimited:"Muitas tentativas. Aguarde um momento e tente novamente.", authPasswordTooShort:"A senha deve ter pelo menos 8 caracteres.", accountReadyTitle:"Seu Memo está pronto.", accountReadyText:"Crie uma conta grátis para guardar sua memória alimentar e continuar em outros dispositivos.", accountBenefit1:"Mantenha seu histórico de refeições salvo", accountBenefit2:"Continue usando o Memo em outros dispositivos", accountBenefit3:"Leve suas refeições aprendidas com você", createFreeAccount:"Criar conta grátis", continueWithoutAccount:"Continuar sem conta", alreadyAccount:"Já tem uma conta?", accountSecurity:"Sua conta é protegida pelo Supabase Auth.", onboardingFeature1:"Lembra suas refeições habituais", onboardingFeature2:"Aprende com suas correções", onboardingFeature3:"Torna os próximos registros mais rápidos", trackingTitle:"Como você costuma registrar comida?", trackingText:"Conte ao Memo como é sua rotina hoje. Você pode escolher mais de uma opção.", trackingSearch:"Procuro alimentos", trackingTextMethod:"Escrevo o que comi", trackingPhoto:"Tiro fotos", trackingWeigh:"Peso as porções", trackingRepeat:"Reutilizo refeições anteriores", trackingNone:"Ainda não registro", invalidGoal:"Escolha um objetivo antes de continuar.", invalidTracking:"Escolha pelo menos uma forma como você registra comida hoje.", invalidPain:"Escolha o que você mais gostaria de tornar fácil.", profileEyebrow:"PERFIL · OPCIONAL", profileTitle:"Um pouco sobre você", profileText:"Comece pelo essencial. Seu nome é o único dado necessário. O restante é opcional.", painTitle:"O que você mais gostaria de tornar fácil?", painText:"Isso ajuda o Memo a focar na parte do registro que mais importa para você.", painRepeat:"Registrar as mesmas refeições novamente", painSearch:"Encontrar os mesmos alimentos", painManual:"Digitar tudo manualmente", painRemember:"Lembrar o que comi", painCorrections:"Corrigir porções ou estimativas", painSpeed:"Registrar rapidamente", painNone:"Ainda não tenho um problema específico", namePlaceholder:"Seu nome", optional:"Opcional", required:"Obrigatório", ageRange:"13–100 anos", weightRange:"30–300 kg", heightRange:"100–230 cm", onboardingStep1:"Um jeito mais leve de registrar", onboardingStep2:"Escolha sua direção", onboardingStep3:"Deixe o Memo pessoal", onboardingTime:"Cerca de 30 segundos · Você pode voltar ou alterar depois", goalLoseText:"Quero reduzir meu peso ao longo do tempo.", goalMaintainText:"Quero manter meu peso e acompanhar minha alimentação.", goalGainText:"Quero aumentar meu peso ao longo do tempo.", detailsHint:"Adicione apenas o que quiser. Você poderá completar ou alterar estes dados depois.", invalidName:"Use pelo menos 2 caracteres.", invalidAge:"Digite uma idade entre 13 e 100 anos.", invalidWeight:"Digite um peso entre 30 e 300 kg.", invalidHeight:"Digite uma altura entre 100 e 230 cm.", nameHint:"Como o Memo deve chamar você?", ageHint:"13–100", weightHint:"Seu peso atual", heightHint:"Sua altura", describe:"Descrever", photo:"Foto", usualMeal:"Habitual", photoDesc:"Adicione uma foto da refeição. A análise de imagem está preparada para a integração real de IA; no MVP, esta etapa fica local.", photoAiTitle:"Análise por IA preparada", photoAiText:"O fluxo da foto está pronto para a futura integração de IA. A análise nutricional ainda não está ativa neste MVP.", photoAiAction:"Análise por IA em breve", addPhoto:"Adicionar foto da refeição", photoReady:"Foto pronta para analisar", photoHint:"Toque para tirar ou escolher uma foto", meal:"Refeição", portion:"Porção", breakfast:"Café da manhã", lunch:"Almoço", snack:"Lanche", dinner:"Jantar", usedBefore:"usada antes", sourcePhoto:"📷 Foto", sourceUsual:"⚡ Habitual", sourceDescription:"✍️ Descrição", estimatedEnergy:"ENERGIA ESTIMADA", proteinShort:"Proteína", carbsShort:"Carboidratos", fatShort:"Gordura", portionLabel:"porção", yourMeal:"Sua refeição", themeAria:"Tema", switchTheme:"Alternar o tema da interface", changeLanguage:"Alterar o idioma do app", freePlan:"Plano gratuito", oneTapMeals:"Refeições de um toque", upgrade:"Conhecer o Memo Pro", upgradeTitle:"Faça o Memo trabalhar ainda mais por você.", upgradeText:"Mais memória, padrões úteis e menos trabalho repetido.", upgradePrice:"US$ 9/mês", upgradeBenefit1:"Refeições habituais ilimitadas", upgradeBenefit2:"Histórico completo", upgradeBenefit3:"Insights sobre seus padrões", upgradeBenefit4:"Sugestões mais inteligentes", upgradeBenefit5:"Recursos avançados de registro", upgradeAction:"Entrar na lista do Pro", upgradeEmailHint:"Usaremos este email apenas para avisar quando o Memo Pro estiver disponível.", upgradeSuccess:"Você entrou na lista do Pro. Avisaremos por email quando estiver pronto.", upgradeAlready:"Este email já está na lista.", upgradeNeedEmail:"Digite seu email para entrar na lista do Pro.", upgradeClose:"Agora não", databaseTitle:"Banco de alimentos", databaseHint:"Pesquise alimentos comuns ou adicione um à refeição.", databasePlaceholder:"Pesquisar alimentos…", databaseEmpty:"Nenhum alimento encontrado.", noMeals:"Nenhuma refeição registrada ainda.", noMealsText:"Comece pela próxima refeição. O Memo vai criar sua memória a partir dos registros reais.", noUsuals:"Seus habituais aparecerão aqui depois que você salvar algumas refeições.", usedTimes:"vezes", last7:"ÚLTIMOS 7 DIAS", avgDaily:"Média diária", daysActive:"Dias ativos", topMeals:"Mais repetidas", noPattern:"Seus padrões aparecerão depois de alguns registros.", logEyebrow:"MEMO / REGISTRO", addMealTitle:"Adicionar refeição", reviewMealTitle:"Reveja sua refeição", describeHint:"Conte ao Memo o que você comeu, do seu jeito. Sem procurar em bases de alimentos.", describePlaceholder:"ex.: frango grelhado, 1 xícara de arroz e feijão", quickChicken:"Frango + arroz", quickOatmeal:"Aveia + banana", quickYogurt:"Iogurte + banana", mealTip:"O Memo aprende com suas correções. Você não precisa medir tudo perfeitamente.", analyze:"Rever estimativa", analyzing:"Analisando…", confidenceMedium:"Confiança média", edit:"Editar", mealName:"Nome da refeição", approximate:"Aproximado", uncertaintyTitle:"O que pode mudar esta estimativa?", uncertaintyText:"A maior fonte de variação é a quantidade que você realmente comeu. Se esta porção foi menor ou maior do que a mostrada, ajuste abaixo.", quickCorrection:"Ajustar porção", smaller:"Comi menos", aboutRight:"Está certo", larger:"Comi mais", confirmRemember:"Confirmar e lembrar", learnedBannerTitle:"O Memo vai lembrar disso", learnedBannerText:"Na próxima vez, esta refeição pode virar uma sugestão de um toque.", small:"Pequena", normal:"Normal", large:"Grande", high:"Alta", medium:"Média",
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
    monitor:<><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon:<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/>,
    pen:<><path d="m4 20 4.5-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z"/><path d="m13.8 7.2 3 3"/></>,
    search:<><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    camera:<><path d="M4 8h3l1.5-2h7L17 8h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/></>,
    bolt:<path d="m13 2-9 11h7l-1 9 9-12h-7Z"/>,
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
  const [onboarded,setOnboarded]=useState(false), [landingSeen,setLandingSeen]=useState(false), [step,setStep]=useState(1), [goal,setGoal]=useState<Goal|"">("");
  const [authenticated,setAuthenticated]=useState(false), [authMode,setAuthMode]=useState<"login"|"signup"|"resetRequest"|"resetPassword">("signup"), [authEmail,setAuthEmail]=useState(""), [authPassword,setAuthPassword]=useState(""), [authConfirmPassword,setAuthConfirmPassword]=useState(""), [showAuthPassword,setShowAuthPassword]=useState(false), [showAuthConfirmPassword,setShowAuthConfirmPassword]=useState(false), [authLoading,setAuthLoading]=useState(false), [authError,setAuthError]=useState(""), [authNotice,setAuthNotice]=useState("");
  const [accountPrompt,setAccountPrompt]=useState(false), [authActive,setAuthActive]=useState(false);
  const [view,setView]=useState<View>("home"), [showLogger,setShowLogger]=useState(false), [showUpgrade,setShowUpgrade]=useState(false);
  const [systemDark,setSystemDark]=useState(false);
  const [authUserId,setAuthUserId]=useState(""), [selectedUsualId,setSelectedUsualId]=useState(""), [foodSearch,setFoodSearch]=useState(""), [estimate,setEstimate]=useState({min:450,max:610,protein:31,carbs:56,fat:18});
  const [upgradeEmail,setUpgradeEmail]=useState(""), [upgradeLoading,setUpgradeLoading]=useState(false), [upgradeNotice,setUpgradeNotice]=useState("");
  const [mealText,setMealText]=useState(""), [analyzing,setAnalyzing]=useState(false), [result,setResult]=useState(false);
  const [editingMealId,setEditingMealId]=useState(""), [editNotice,setEditNotice]=useState("");
  const [editBaseEstimate,setEditBaseEstimate]=useState({min:450,max:610,protein:31,carbs:56,fat:18});
  const [loggerMode,setLoggerMode]=useState<"describe"|"search"|"photo"|"usual">("describe"), [mealType,setMealType]=useState<Meal["type"]>("Dinner");
  const [portion,setPortion]=useState("normal"), [photoName,setPhotoName]=useState("");
  const [selectedFoodIds,setSelectedFoodIds]=useState<string[]>([]);
  const [meals,setMeals]=useState<Meal[]>(demoMeals);
  const [profile,setProfile]=useState({name:"",age:"",weight:"",height:""});
  const [onboardingError,setOnboardingError]=useState("");
  const [trackingMethod,setTrackingMethod]=useState<TrackingMethod[]>([]);
  const [trackingPain,setTrackingPain]=useState<TrackingPain|"">("");
  const [editingProfile,setEditingProfile]=useState(false);
  const [profileNotice,setProfileNotice]=useState("");
  const t=copy[locale];

  useEffect(()=>{const recovery=typeof window!=="undefined"&&window.location.hash.includes("type=recovery"); if(recovery){setAuthActive(true);setAuthMode("resetPassword");setLandingSeen(true)} supabaseAuth.getCurrentUser().then(user=>{if(user){setAuthUserId(user.id);setAuthEmail(user.email);if(!recovery)setAuthenticated(true)}}).catch(()=>{}); const raw=localStorage.getItem("memo-demo");if(raw){try{const d=JSON.parse(raw);setOnboarded(!!d.onboarded);setLandingSeen(!!d.landingSeen);setGoal(d.goal==="lose"||d.goal==="maintain"||d.goal==="gain"?d.goal:"");setLocale(d.locale??"pt");setTheme(d.theme??"light");setProfile(d.profile??{name:"",age:"",weight:"",height:""});setTrackingMethod(Array.isArray(d.trackingMethod)?d.trackingMethod:[]);setTrackingPain(d.trackingPain==="repeat"||d.trackingPain==="search"||d.trackingPain==="manual"||d.trackingPain==="remember"||d.trackingPain==="corrections"||d.trackingPain==="speed"||d.trackingPain==="none"?d.trackingPain:"");setMeals(Array.isArray(d.meals)?d.meals:[])}catch{}}},[]);
  useEffect(()=>{const effective=theme==="system"?(systemDark?"dark":"light"):theme;document.documentElement.dataset.theme=effective;localStorage.setItem("memo-demo",JSON.stringify({onboarded,landingSeen,goal,locale,theme,profile,trackingMethod,trackingPain,meals}))},[onboarded,landingSeen,goal,locale,theme,profile,trackingMethod,trackingPain,meals,systemDark]);
  useEffect(()=>{if(!showLogger)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setShowLogger(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[showLogger]);
  useEffect(()=>{const mq=window.matchMedia("(prefers-color-scheme: dark)");const sync=()=>setSystemDark(mq.matches);sync();mq.addEventListener?.("change",sync);return()=>mq.removeEventListener?.("change",sync)},[]);
  useEffect(()=>{if(!authUserId||!isSupabaseConfigured)return;let cancelled=false;(async()=>{try{const sb=getSupabase();const [{data:rows},{data:savedRows},{data:p}]=await Promise.all([sb.from("meals").select("*").eq("user_id",authUserId).order("logged_at",{ascending:false}),sb.from("saved_meals").select("id,name,use_count,last_used_at").eq("user_id",authUserId),sb.from("profiles").select("*").eq("id",authUserId).maybeSingle()]);if(cancelled)return;const savedMap=new Map((savedRows??[]).map((m:any)=>[m.id,m]));if(Array.isArray(rows)&&rows.length){setMeals(rows.map((m:any)=>{const d=new Date(m.logged_at),hour=d.getHours();const type:Meal["type"]=hour<11?"Breakfast":hour<15?"Lunch":hour<18?"Snack":"Dinner";const saved=savedMap.get(m.saved_meal_id);return {id:m.id,name:m.name,time:d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),loggedAt:m.logged_at,calories:Math.round((Number(m.calories_min)+Number(m.calories_max))/2),protein:Number(m.protein_g),carbs:Number(m.carbs_g),fat:Number(m.fat_g),note:m.source==="saved"?(locale==="pt"?"Refeição habitual":"Usual meal"):(locale==="pt"?"Registrada pelo Memo":"Logged by Memo"),confidence:m.confidence==="high"?"High":"Medium",type,saved:Boolean(saved),savedMealId:saved?.id,useCount:Number(saved?.use_count??1)}}));}else{const raw=localStorage.getItem("memo-demo");const local=raw?JSON.parse(raw).meals:[];if(Array.isArray(local)&&local.length){for(const meal of local as Meal[])await syncMealToCloud(meal)}}if(p&&p.first_name&&p.first_name!=="Usuário"){setProfile(cur=>({...cur,name:cur.name||p.first_name,age:cur.age||String(p.age??""),weight:cur.weight||String(p.weight_kg??""),height:cur.height||String(p.height_cm??"")}));if(!goal&&p.goal)setGoal(p.goal as Goal)}}catch{} })();return()=>{cancelled=true}},[authUserId]);

  const calories=meals.reduce((s,m)=>s+m.calories,0), protein=meals.reduce((s,m)=>s+m.protein,0);
  const carbs=meals.reduce((s,m)=>s+m.carbs,0), fat=meals.reduce((s,m)=>s+m.fat,0);
  const target=goal==="lose"?1900:goal==="gain"?2500:2200;
  const remainingCalories=Math.max(0,target-calories);
  const formatNumber=(n:number)=>n.toLocaleString(locale==="pt"?"pt-PT":"en-US");
  const now=new Date();
  const greetingKey=now.getHours()<12?"morning":now.getHours()<18?"afternoon":"evening";
  const todayKey=now.toDateString();
  const todayDateLabel=locale==="pt"?`${now.getDate()}/${now.getMonth()+1}`:`${now.getMonth()+1}/${now.getDate()}`;
  const avatarLetter=((profile.name.trim()||authEmail.trim()||"Memo").trim()[0]||"M").toUpperCase();
  const mealDate=(m:Meal)=>m.loggedAt?new Date(m.loggedAt):now;
  const todayMeals=useMemo(()=>meals.filter(m=>mealDate(m).toDateString()===todayKey),[meals,todayKey]);
  const last7Meals=useMemo(()=>meals.filter(m=>now.getTime()-mealDate(m).getTime()<7*86400000),[meals]);
  const todayCalories=todayMeals.reduce((s,m)=>s+m.calories,0), todayProtein=todayMeals.reduce((s,m)=>s+m.protein,0), todayCarbs=todayMeals.reduce((s,m)=>s+m.carbs,0), todayFat=todayMeals.reduce((s,m)=>s+m.fat,0);
  const learned=useMemo(()=>Array.from(new Map(meals.filter(m=>m.saved).map(m=>[m.name.toLowerCase(),m])).values()).sort((a,b)=>(b.useCount??1)-(a.useCount??1)).slice(0,6),[meals]);
  const filteredFoods=useMemo(()=>{const q=foodSearch.trim().toLowerCase();return foodDatabase.filter(f=>!q||[f.pt,f.en,...f.aliases].some(v=>v.toLowerCase().includes(q))).slice(0,8)},[foodSearch]);
  const activeDays=useMemo(()=>new Set(last7Meals.map(m=>mealDate(m).toDateString())).size,[last7Meals]);
  const averageCalories=last7Meals.length?Math.round(last7Meals.reduce((s,m)=>s+m.calories,0)/Math.max(1,activeDays)):0;
  const repeated=useMemo(()=>{const counts=new Map<string,number>();meals.forEach(m=>counts.set(m.name.toLowerCase(),(counts.get(m.name.toLowerCase())??0)+1));return Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,3)},[meals]);

  function normalizeAuthEmail(value:string){
    return value.trim().toLowerCase();
  }

  function validateAuthEmail(email:string){
    return email.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function validateSignupPassword(password:string){
    return password.length>=8 && password.length<=128 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
  }

  function friendlyAuthError(error:unknown){
    const message=error instanceof Error?error.message.toLowerCase():"";
    if(message.includes("invalid login credentials")) return t.authInvalidCredentials;
    if(message.includes("already registered")||message.includes("user already registered")) return t.authEmailInUse;
    if(message.includes("rate limit")||message.includes("too many")) return t.authRateLimited;
    if(message.includes("password")) return t.authGeneric;
    return t.authGeneric;
  }

  async function handleAuth(e:React.FormEvent){
    e.preventDefault();
    if(authLoading)return;
    setAuthError(""); setAuthNotice("");
    const email=normalizeAuthEmail(authEmail);
    if(authMode!=="resetPassword"&&!validateAuthEmail(email)){setAuthError(t.authEmailRequired);return}
    if(authMode==="resetPassword"){
      if(!isSupabaseConfigured){setAuthError(t.authConfig);return}
      if(!validateSignupPassword(authPassword)){setAuthError(t.authWeakPassword);return}
      if(authPassword!==authConfirmPassword){setAuthError(t.authPasswordMismatch);return}
      setAuthLoading(true);
      try{await supabaseAuth.updatePassword(authPassword);setAuthPassword("");setAuthConfirmPassword("");setAuthNotice(t.authPasswordUpdated);setAuthMode("login")}
      catch(error){setAuthError(friendlyAuthError(error))}
      finally{setAuthLoading(false)}
      return;
    }
    if(authMode==="resetRequest"){
      if(!validateAuthEmail(email)){setAuthError(t.authEmailRequired);return}
      if(!isSupabaseConfigured){setAuthError(t.authConfig);return}
      setAuthLoading(true);
      try{
        await supabaseAuth.resetPassword(email);
        setAuthNotice(t.authResetSent);
      }catch(error){setAuthError(friendlyAuthError(error))}
      finally{setAuthLoading(false)}
      return;
    }
    if(!authPassword){setAuthError(t.authPasswordRequired);return}
    if(authPassword.length>128){setAuthError(t.authWeakPassword);return}
    if(authMode==="signup"){
      if(!validateSignupPassword(authPassword)){setAuthError(t.authWeakPassword);return}
      if(authPassword!==authConfirmPassword){setAuthError(t.authPasswordMismatch);return}
    }else if(authPassword.length<8){setAuthError(t.authPasswordTooShort);return}
    if(!isSupabaseConfigured){setAuthError(t.authConfig);return}
    setAuthLoading(true);
    try{
      const user=authMode==="signup"
        ?await supabaseAuth.signUp({email,password:authPassword})
        :await supabaseAuth.signIn({email,password:authPassword});
      if(authMode==="signup"&&!user.emailConfirmed){
        setAuthEmail(email);setAuthPassword("");setAuthConfirmPassword("");
        setAuthNotice(t.authAccountCreated);
        return;
      }
      const current=await supabaseAuth.getCurrentUser();
      if(!current){setAuthError(t.authCheckEmail);return}
      setAuthenticated(true);setAuthUserId(current.id);setAuthEmail(current.email);void syncProfileToCloud(current.id);setAuthPassword("");setAuthConfirmPassword("");
      setAccountPrompt(false);setAuthActive(false);setAuthNotice("");setOnboarded(true);setLandingSeen(true);
      setView("home");
    }catch(error){setAuthError(friendlyAuthError(error))}
    finally{setAuthLoading(false)}
  }


  function saveProfileSettings(){
    if(!validateProfile()) return;
    setProfile(p=>({...p,name:p.name.trim().replace(/\\s+/g," ")}));
    setEditingProfile(false);
    setProfileNotice(locale==="pt"?"Perfil atualizado.":"Profile updated.");
    window.setTimeout(()=>setProfileNotice(""),2600);
    if(authenticated&&authUserId) void syncProfileToCloud(authUserId);
  }

  function setSettingsGoal(next:Goal){setGoal(next);setProfileNotice(locale==="pt"?"Objetivo atualizado.":"Goal updated.");if(authenticated&&authUserId) void syncProfileToCloud(authUserId)}

  function validateProfile(){
    const name=profile.name.trim().replace(/\s+/g," ");
    if(name.length<2||name.length>80||!/[\p{L}]/u.test(name)){setOnboardingError(t.invalidName);return false}
    if(profile.age){
      const age=Number(profile.age);
      if(!Number.isInteger(age)||age<13||age>100){setOnboardingError(t.invalidAge);return false}
    }
    if(profile.weight){
      const weight=Number(profile.weight);
      if(!Number.isFinite(weight)||weight<30||weight>300){setOnboardingError(t.invalidWeight);return false}
    }
    if(profile.height){
      const height=Number(profile.height);
      if(!Number.isInteger(height)||height<100||height>230){setOnboardingError(t.invalidHeight);return false}
    }
    setOnboardingError("");
    return true
  }

  function validateStep(target:number){
    if(target===2&&!goal){setOnboardingError(t.invalidGoal);return false}
    if(target===3&&trackingMethod.length===0){setOnboardingError(t.invalidTracking);return false}
    if(target===4&&!trackingPain){setOnboardingError(t.invalidPain);return false}
    if(target===5&&!validateProfile())return false;
    setOnboardingError("");
    return true
  }

  function toggleTrackingMethod(method:TrackingMethod){
    setTrackingMethod(cur=>{
      if(method==="none") return cur.includes("none")?[]:["none"];
      return cur.includes(method)
        ? cur.filter(item=>item!==method)
        : [...cur.filter(item=>item!=="none"),method];
    });
    setOnboardingError("")
  }

  function finishOnboarding(){
    if(!validateStep(5)) return;
    setStep(1);
    if(authenticated){
      setOnboarded(true);
      setAccountPrompt(false);
      setView("home");
    }else{
      setAccountPrompt(true);
    }
  }

  function skipOnboarding(){
    setOnboardingError("");
    setStep(1);
    if(authenticated){
      setOnboarded(true);
      setAccountPrompt(false);
      setView("home");
    }else{
      setAccountPrompt(true);
    }
  }

  function openLogger(mode:"describe"|"search"|"photo"|"usual"="describe"){const hour=new Date().getHours();const defaultType:Meal["type"]=hour<11?"Breakfast":hour<15?"Lunch":hour<18?"Snack":"Dinner";setEditingMealId("");setEditNotice("");setEditBaseEstimate({min:450,max:610,protein:31,carbs:56,fat:18});setLoggerMode(mode);setResult(false);setPhotoName("");setMealText("");setMealType(defaultType);setPortion("normal");setSelectedUsualId("");setSelectedFoodIds([]);setFoodSearch("");setEstimate({min:450,max:610,protein:31,carbs:56,fat:18});setAnalyzing(false);setShowLogger(true)}
  function findFoodIdsForMeal(name:string){const normalized=name.toLowerCase();return foodDatabase.filter(food=>food.aliases.some(alias=>normalized.includes(alias))).map(food=>food.id)}
  function openMealEditor(meal:Meal,mode:"describe"|"search"|"photo"|"usual"="describe"){
    if(!meal?.id)return;
    if(!meals.some(item=>item.id===meal.id)){setEditNotice(locale==="pt"?"Esta refeição não está mais disponível.":"This meal is no longer available.");return}
    setEditingMealId(meal.id);setEditNotice("");setLoggerMode(mode);setResult(false);setAnalyzing(false);setSelectedUsualId(mode==="usual"?meal.id:"");setMealText(meal.name.trim());setMealType(meal.type);setPortion("normal");setPhotoName(meal.photoName||"");setFoodSearch("");setSelectedFoodIds(mode==="search"||mode==="usual"?findFoodIdsForMeal(meal.name):[]);setEstimate({min:meal.calories,max:meal.calories,protein:meal.protein,carbs:meal.carbs,fat:meal.fat});setEditBaseEstimate({min:meal.calories,max:meal.calories,protein:meal.protein,carbs:meal.carbs,fat:meal.fat});setShowLogger(true);
  }
  function closeLogger(){setShowLogger(false);setEditingMealId("");setEditNotice("");setEditBaseEstimate({min:450,max:610,protein:31,carbs:56,fat:18});setSelectedUsualId("");setSelectedFoodIds([]);setMealText("");setPhotoName("");setResult(false)}
  function estimateMealText(text:string,size:string){const normalized=text.toLowerCase();const matches=foodDatabase.filter(f=>f.aliases.some(a=>normalized.includes(a)));const multiplier=size==="small"?.82:size==="large"?1.2:1;if(!matches.length)return {min:Math.round(540*multiplier),max:Math.round(610*multiplier),protein:Math.round(31*multiplier),carbs:Math.round(56*multiplier),fat:Math.round(18*multiplier)};const base=matches.reduce((a,f)=>({kcal:a.kcal+f.calories,protein:a.protein+f.protein,carbs:a.carbs+f.carbs,fat:a.fat+f.fat}),{kcal:0,protein:0,carbs:0,fat:0});const kcal=base.kcal*multiplier;return {min:Math.max(80,Math.round(kcal*.9)),max:Math.max(100,Math.round(kcal*1.1)),protein:Math.round(base.protein*multiplier),carbs:Math.round(base.carbs*multiplier),fat:Math.round(base.fat*multiplier)}}
  function analyze(){
    if(editingMealId&&loggerMode==="photo"){setResult(true);return}
    if(editingMealId&&loggerMode==="usual"){
      if(!mealText.trim())return;
      if(selectedFoodIds.length){const next=estimateMealText(mealText,portion);setEstimate(next);setEditBaseEstimate(estimateMealText(mealText,"normal"));}
      setResult(true);return;
    }
    if(loggerMode==="photo"||loggerMode==="usual"&&!selectedUsualId)return;
    if(!mealText.trim())return;
    if(loggerMode==="search"&&!selectedFoodIds.length)return;
    setAnalyzing(true);
    window.setTimeout(()=>{const next=estimateMealText(mealText,portion);setEstimate(next);if(editingMealId)setEditBaseEstimate(next);setAnalyzing(false);setResult(true)},450)
  }
  async function syncProfileToCloud(userId:string){if(!isSupabaseConfigured)return;try{const sb=getSupabase();await sb.from("profiles").update({first_name:profile.name.trim()||"Usuário",age:profile.age?Number(profile.age):null,weight_kg:profile.weight?Number(profile.weight):null,height_cm:profile.height?Number(profile.height):null,goal:goal||"maintain"}).eq("id",userId)}catch{}}
  async function syncMealToCloud(meal:Meal){if(!authUserId||!isSupabaseConfigured)return;try{const sb=getSupabase();let savedMealId=meal.savedMealId;if(meal.saved&&!savedMealId){const {data,error}=await sb.from("saved_meals").insert({user_id:authUserId,name:meal.name,analysis:{calories:{min:meal.calories,max:meal.calories},proteinGrams:meal.protein,carbsGrams:meal.carbs,fatGrams:meal.fat,confidence:meal.confidence.toLowerCase(),assumptions:["Estimate based on the meal description."]},use_count:Math.max(1,meal.useCount??1)}).select("id").single();if(error)throw error;savedMealId=data.id}const {error}=await sb.from("meals").insert({id:meal.id,user_id:authUserId,name:meal.name,logged_at:meal.loggedAt,source:meal.saved?"saved":"text",calories_min:Math.max(0,meal.calories-30),calories_max:meal.calories+30,protein_g:meal.protein,carbs_g:meal.carbs,fat_g:meal.fat,confidence:meal.confidence.toLowerCase(),assumptions:["Estimate based on the meal description."],saved_meal_id:savedMealId||null});if(error)throw error}catch{}}
  async function confirm(){
    if(editingMealId){
      const current=meals.find(m=>m.id===editingMealId);
      if(!current){setEditNotice(locale==="pt"?"Esta refeição não está mais disponível.":"This meal is no longer available.");return}
      const cleanName=mealText.trim();
      if(loggerMode==="photo"&&!photoName&&!current.photoName){setEditNotice(locale==="pt"?"Escolha uma foto antes de guardar.":"Choose a photo before saving.");setResult(false);return}
      if(loggerMode!=="photo"&&cleanName.length<2){setEditNotice(locale==="pt"?"Digite pelo menos 2 caracteres para o nome da refeição.":"Enter at least 2 characters for the meal name.");setResult(false);return}
      if(cleanName.length>120){setEditNotice(locale==="pt"?"O nome da refeição é muito longo.":"The meal name is too long.");setResult(false);return}
      if((loggerMode==="search"||loggerMode==="usual")&&!selectedFoodIds.length){setEditNotice(locale==="pt"?"Selecione pelo menos um alimento.":"Select at least one food.");setResult(false);return}
      if(!["Breakfast","Lunch","Snack","Dinner"].includes(mealType)){setEditNotice(locale==="pt"?"Tipo de refeição inválido.":"Invalid meal type.");setResult(false);return}
      if(!Number.isFinite(estimate.min)||!Number.isFinite(estimate.max)||!Number.isFinite(estimate.protein)||!Number.isFinite(estimate.carbs)||!Number.isFinite(estimate.fat)){setEditNotice(locale==="pt"?"Não foi possível validar a estimativa. Tente novamente.":"The estimate could not be validated. Please try again.");setResult(false);return}
      const updated:Meal={...current,name:loggerMode==="photo"?(current.name||cleanName):(cleanName||current.name),type:mealType,calories:Math.round((estimate.min+estimate.max)/2),protein:estimate.protein,carbs:estimate.carbs,fat:estimate.fat,photoName:loggerMode==="photo"?(photoName||current.photoName):current.photoName,note:locale==="pt"?"Refeição editada":"Meal edited"};
      setMeals(cur=>cur.map(item=>item.id===editingMealId?updated:item));
      if(authUserId&&isSupabaseConfigured){
        try{
          const sb=getSupabase();
          await sb.from("meals").update({name:updated.name,calories_min:Math.max(0,updated.calories-30),calories_max:updated.calories+30,protein_g:updated.protein,carbs_g:updated.carbs,fat_g:updated.fat,confidence:updated.confidence.toLowerCase(),logged_at:updated.loggedAt}).eq("id",updated.id).eq("user_id",authUserId);
          if(updated.savedMealId){await sb.from("saved_meals").update({name:updated.name,analysis:{calories:{min:updated.calories,max:updated.calories},proteinGrams:updated.protein,carbsGrams:updated.carbs,fatGrams:updated.fat,confidence:updated.confidence.toLowerCase(),assumptions:["Updated from meal editor."]}}).eq("id",updated.savedMealId).eq("user_id",authUserId)}
        }catch{}
      }
      closeLogger();
      return;
    }
    const selected=selectedUsualId?meals.find(m=>m.id===selectedUsualId):undefined;const baseName=selected?.name||mealText.trim()||photoName||(locale==="pt"?"Refeição":"Meal");const nowIso=new Date().toISOString();const nextUseCount=(selected?.useCount??1)+1;const meal:Meal={id:crypto.randomUUID(),name:baseName,time:new Date(nowIso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),loggedAt:nowIso,calories:Math.round((estimate.min+estimate.max)/2),protein:estimate.protein,carbs:estimate.carbs,fat:estimate.fat,note:locale==="pt"?"Aprendida com sua correção":"Learned from your correction",confidence:selected?.confidence??"Medium",type:selected?.type??mealType,saved:true,useCount:nextUseCount,savedMealId:selected?.savedMealId};setMeals(cur=>[meal,...cur]);if(authUserId&&isSupabaseConfigured&&selected?.savedMealId){try{await getSupabase().from("saved_meals").update({use_count:nextUseCount,last_used_at:nowIso}).eq("id",selected.savedMealId)}catch{}}void syncMealToCloud(meal);closeLogger()}
  async function openUpgrade(){setUpgradeNotice("");const local=typeof window!=="undefined"?localStorage.getItem("memo-pro-waitlist-email"):"";if(local){setUpgradeEmail(local);setUpgradeNotice(t.upgradeAlready);setShowUpgrade(true);return}if(!upgradeEmail){try{const user=await supabaseAuth.getCurrentUser();if(user)setUpgradeEmail(user.email)}catch{}}setShowUpgrade(true)}
  async function submitUpgrade(){const email=normalizeAuthEmail(upgradeEmail);if(!validateAuthEmail(email)){setUpgradeNotice(t.upgradeNeedEmail);return}setUpgradeLoading(true);try{if(isSupabaseConfigured){const {error}=await getSupabase().from("pro_waitlist").insert({email});if(error&&error.code!=="23505")throw error}localStorage.setItem("memo-pro-waitlist-email",email);setUpgradeEmail(email);setUpgradeNotice(t.upgradeSuccess)}catch{setUpgradeNotice(t.authGeneric)}finally{setUpgradeLoading(false)}}
  async function handleSignOut(){try{await supabaseAuth.signOut()}catch{}setAuthenticated(false);setAuthUserId("");setOnboarded(true);setLandingSeen(true);setAccountPrompt(false);setAuthActive(false);setView("home");setMeals([]);setAuthNotice("")}
  function reset(){localStorage.removeItem("memo-demo");localStorage.removeItem("memo-pro-waitlist-email");setOnboarded(false);setLandingSeen(false);setStep(1);setView("home");setGoal("");setLocale("pt");setTheme("system");setProfile({name:"",age:"",weight:"",height:""});setTrackingMethod([]);setTrackingPain("");setMeals([])}
  function adjustEstimate(base:{min:number;max:number;protein:number;carbs:number;fat:number},size:string){const multiplier=size==="small"?.82:size==="large"?1.2:1;return {min:Math.max(0,Math.round(base.min*multiplier)),max:Math.max(0,Math.round(base.max*multiplier)),protein:Math.max(0,Math.round(base.protein*multiplier)),carbs:Math.max(0,Math.round(base.carbs*multiplier)),fat:Math.max(0,Math.round(base.fat*multiplier))}}
  function selectFood(food:FoodItem){
    setSelectedUsualId("");
    setSelectedFoodIds(cur=>{
      const next=cur.includes(food.id)?cur.filter(id=>id!==food.id):[...cur,food.id];
      const names=next.map(id=>foodDatabase.find(item=>item.id===id)).filter(Boolean).map(item=>locale==="pt"?item!.pt:item!.en);
      setMealText(locale==="pt"?names.join(" e "):names.join(" and "));
      return next;
    });
  }
  function startUsual(m:Meal){setEditingMealId("");setEditNotice("");setSelectedUsualId(m.id);setSelectedFoodIds([]);setMealText(m.name);setMealType(m.type);setPortion("normal");setLoggerMode("usual");setResult(true);setEstimate({min:m.calories,max:m.calories,protein:m.protein,carbs:m.carbs,fat:m.fat});setShowLogger(true)}
  function toggleEditUsualFood(food:FoodItem){setSelectedFoodIds(cur=>{const next=cur.includes(food.id)?cur.filter(id=>id!==food.id):[...cur,food.id];const names=next.map(id=>foodDatabase.find(item=>item.id===id)).filter(Boolean).map(item=>locale==="pt"?item!.pt:item!.en);if(names.length){const nextName=(locale==="pt"?names.join(" e "):names.join(" and ")).slice(0,120);setMealText(nextName);const base=estimateMealText(nextName,"normal");setEditBaseEstimate(base);setEstimate(adjustEstimate(base,portion));}else{setMealText("");setEditBaseEstimate({min:0,max:0,protein:0,carbs:0,fat:0});setEstimate({min:0,max:0,protein:0,carbs:0,fat:0});}return next})}

  if(!landingSeen) return <main className="landing-shell"><header className="landing-nav"><div className="landing-brand"><span>M</span><b>Memo</b></div><div className="landing-nav-actions"><button className="landing-login" onClick={()=>{setAuthMode("login");setAuthError("");setLandingSeen(true);setAccountPrompt(false);setAuthActive(true)}}>{t.landingLogin}</button><div className="landing-languages" aria-label="Language"><button className={locale==="pt"?"active":""} onClick={()=>setLocale("pt")}>PT</button><span>/</span><button className={locale==="en"?"active":""} onClick={()=>setLocale("en")}>EN</button></div></div></header>
  <section className="landing-hero"><div className="landing-copy"><span className="landing-eyebrow"><i/> {t.landingEyebrow}</span><h1>{t.landingTitle}</h1><p>{t.landingText}</p><div className="landing-actions"><button className="primary-button" onClick={()=>{setAuthError("");setLandingSeen(true);setAccountPrompt(false);setAuthActive(false);setStep(1)}}>{t.landingCta}<Icon name="arrow" size={18}/></button><a href="#how">{t.landingSecondary}<Icon name="chevron" size={16}/></a></div><div className="landing-proof"><span>✓</span><p>{t.landingProof}</p></div></div>
    <div className="landing-product" aria-hidden="true"><div className="product-glow"/><div className="product-window"><div className="product-top"><div className="product-brand"><span>M</span><b>Memo</b></div><span className="product-date">{t.today}</span></div><div className="product-greeting"><span>{t.today}</span><strong>{t[greetingKey]}{profile.name.trim()?`, ${profile.name.trim().split(/\s+/)[0]}`:""}, {profile.name || "Alex"}.</strong><small>{t.subtitle}</small></div><div className="product-grid"><div className="product-card product-calories"><span>{t.calories}</span><strong>1,110 <small>/ 2,200</small></strong><div className="product-ring"><b>50%</b></div><div className="product-macros"><i/><i/><i/></div></div><div className="product-card product-memory"><span>✦ {t.memory}</span><strong>{t.landingMemoryTitle}</strong><small>{t.memoryText}</small></div></div><div className="product-section"><span>{t.usual}</span><strong>{t.oneTapMeals}</strong><div className="product-meals"><div><b>◒</b><span>{locale==="pt"?"Frango, arroz e feijão":"Chicken rice bowl"}<small>620 kcal</small></span><i>+</i></div><div><b>◉</b><span>{locale==="pt"?"Iogurte e banana":"Greek yogurt & banana"}<small>280 kcal</small></span><i>+</i></div></div></div></div></div></section>
  <section className="landing-trust"><span>{t.landingFeature1}</span><span>{t.landingFeature2}</span><span>{t.landingFeature3}</span></section>
  <section className="landing-how" id="how"><div className="landing-section-head"><span className="landing-eyebrow"><i/> MEMO</span><h2>{t.landingHow}</h2><p>{t.landingHowText}</p></div><div className="landing-steps"><article><span>01</span><div className="step-icon"><Icon name="clock" size={21}/></div><h3>{t.landingStep1}</h3><p>{t.landingStep1Text}</p></article><article><span>02</span><div className="step-icon"><Icon name="check" size={21}/></div><h3>{t.landingStep2}</h3><p>{t.landingStep2Text}</p></article><article><span>03</span><div className="step-icon"><Icon name="spark" size={21}/></div><h3>{t.landingStep3}</h3><p>{t.landingStep3Text}</p></article></div></section>
  <section className="landing-memory"><div><span className="landing-eyebrow"><i/> {t.memory}</span><h2>{t.landingMemoryTitle}</h2><p>{t.landingMemoryText}</p><button className="primary-button" onClick={()=>{setLandingSeen(true);setAccountPrompt(false);setAuthActive(false);setStep(1)}}>{t.landingCtaBottom}<Icon name="arrow" size={18}/></button></div><div className="memory-demo"><div className="memory-demo-top"><span>MEMO</span><span>+ {locale==="pt"?"aprendido":"learned"}</span></div><div className="memory-line"><b>{locale==="pt"?"Frango, arroz e feijão":"Chicken, rice & beans"}</b><span>{locale==="pt"?"Sua refeição habitual":"Your usual meal"}</span></div><div className="memory-line faded"><b>{locale==="pt"?"Iogurte e banana":"Greek yogurt & banana"}</b><span>{locale==="pt"?"Registrada 4 vezes":"Logged 4 times"}</span></div><div className="memory-button">⚡ {locale==="pt"?"Registrar em um toque":"Log in one tap"}</div></div></section><footer className="landing-footer"><span>{t.landingFooter}</span><small>{t.landingPrivacy}</small></footer></main>;

  if(landingSeen && !authenticated && authActive) return <main className="auth-shell"><div className="auth-card">
    <button className="auth-back" onClick={()=>{setAuthError("");setAuthNotice("");setAuthPassword("");setAuthConfirmPassword("");setShowAuthPassword(false);setShowAuthConfirmPassword(false);setAuthActive(false);setAccountPrompt(false);setLandingSeen(false)}}><Icon name="back" size={17}/>{t.authBack}</button>
    <div className="auth-brand"><span>M</span><b>Memo</b></div>
    <div className="eyebrow"><span className="eyebrow-dot"/> MEMO</div>
    <h1>{authMode==="login"?t.authTitle:authMode==="signup"?t.authSignupTitle:authMode==="resetPassword"?t.authResetPasswordTitle:t.authResetTitle}</h1>
    <p>{authMode==="login"?t.authLoginText:authMode==="signup"?t.authSignupText:authMode==="resetPassword"?t.authResetPasswordText:t.authResetText}</p>
    <form onSubmit={handleAuth} className="auth-form" noValidate>
      <label>
        <span>{t.email}</span>
        <input type="email" value={authEmail} onChange={e=>{setAuthEmail(e.target.value.slice(0,254));setAuthError("");setAuthNotice("")}} placeholder="you@example.com" autoComplete="email" inputMode="email" maxLength={254} aria-invalid={!!authError} required/>
        <small>{t.authEmailHint}</small>
      </label>
      {authMode!=="resetRequest"&&<label>
        <span>{t.password}</span>
        <div className="auth-password-field">
          <input type={showAuthPassword?"text":"password"} value={authPassword} onChange={e=>{setAuthPassword(e.target.value.slice(0,128));setAuthError("");setAuthNotice("")}} placeholder="••••••••" autoComplete={authMode==="login"?"current-password":"new-password"} minLength={8} maxLength={128} aria-invalid={!!authError} required/>
          <button type="button" className="auth-eye" onClick={()=>setShowAuthPassword(v=>!v)} aria-label={showAuthPassword?"Hide password":"Show password"}>{showAuthPassword?<Icon name="eye-off" size={17}/>:<Icon name="eye" size={17}/>}</button>
        </div>
        {authMode==="signup"||authMode==="resetPassword"?<small>{t.authPasswordHint}</small>:null}
      </label>}
      {(authMode==="signup"||authMode==="resetPassword")&&<label>
        <span>{t.authConfirmPassword}</span>
        <div className="auth-password-field">
          <input type={showAuthConfirmPassword?"text":"password"} value={authConfirmPassword} onChange={e=>{setAuthConfirmPassword(e.target.value.slice(0,128));setAuthError("");setAuthNotice("")}} placeholder="••••••••" autoComplete="new-password" minLength={8} maxLength={128} aria-invalid={!!authError} required/>
          <button type="button" className="auth-eye" onClick={()=>setShowAuthConfirmPassword(v=>!v)} aria-label={showAuthConfirmPassword?"Hide password":"Show password"}>{showAuthConfirmPassword?<Icon name="eye-off" size={17}/>:<Icon name="eye" size={17}/>}</button>
        </div>
        <small>{t.authConfirmHint}</small>
      </label>}
      {authError&&<div className="auth-error" role="alert"><Icon name="info" size={15}/><span>{authError}</span></div>}
      {authNotice&&<div className="auth-notice" role="status"><Icon name="check" size={15}/><span>{authNotice}</span></div>}
      <button className="primary-button wide auth-submit" disabled={authLoading}>{authLoading?t.authLoading:(authMode==="resetRequest"?t.authSendReset:authMode==="resetPassword"?t.authSaveNewPassword:authMode==="login"?t.login:t.signup)}<Icon name="arrow" size={17}/></button>
    </form>
    {authMode==="login"&&<button className="auth-forgot" onClick={()=>{setAuthMode("resetRequest");setAuthError("");setAuthNotice("")}}>{t.authForgotPassword}</button>}
    {authMode==="resetRequest"&&<button className="auth-forgot" onClick={()=>{setAuthMode("login");setAuthError("");setAuthNotice("")}}>{t.authBackToLogin}</button>}
    {authMode!=="resetRequest"&&authMode!=="resetPassword"&&<div className="auth-switch">{authMode==="login"?t.noAccount:t.hasAccount} <button onClick={()=>{setAuthMode(authMode==="login"?"signup":"login");setAuthError("");setAuthNotice("");setAuthPassword("");setAuthConfirmPassword("")}}>{authMode==="login"?t.switchSignup:t.switchLogin}</button></div>}
    <div className="auth-security"><Icon name="check" size={15}/><span>{isSupabaseConfigured?t.accountSecurity:t.authConfig}</span></div>
  </div></main>;

  if(landingSeen && !authenticated && accountPrompt) return <main className="account-shell">
    <div className="account-card">
      <div className="account-orb"><Icon name="check" size={28}/></div>
      <div className="eyebrow"><span className="eyebrow-dot"/> MEMO</div>
      <h1>{t.accountReadyTitle}</h1>
      <p>{t.accountReadyText}</p>
      <div className="account-benefits">
        <div><Icon name="check" size={16}/><span>{t.accountBenefit1}</span></div>
        <div><Icon name="check" size={16}/><span>{t.accountBenefit2}</span></div>
        <div><Icon name="check" size={16}/><span>{t.accountBenefit3}</span></div>
      </div>
      <button className="primary-button wide" onClick={()=>{setAuthMode("signup");setAuthError("");setAuthNotice("");setAuthPassword("");setAuthConfirmPassword("");setAccountPrompt(false);setAuthActive(true)}}>{t.createFreeAccount}<Icon name="arrow" size={17}/></button>
      <button className="account-secondary" onClick={()=>{setOnboarded(true);setAccountPrompt(false);setView("home")}}>{t.continueWithoutAccount}</button>
      <div className="account-login">{t.alreadyAccount} <button onClick={()=>{setAuthMode("login");setAuthError("");setAuthNotice("");setAuthPassword("");setAuthConfirmPassword("");setAccountPrompt(false);setAuthActive(true)}}>{t.login}</button></div>
      <div className="auth-security"><Icon name="check" size={15}/><span>{t.accountSecurity}</span></div>
    </div>
  </main>;

  if(landingSeen && !authenticated && !accountPrompt && !onboarded) return <main className="onboarding-shell">
    <div className="onboarding-card onboarding-card-rich">
      <div className="onboarding-brand"><span>M</span><b>Memo</b><span className="onboarding-step-count">{String(step).padStart(2,"0")} / 05</span><button className="onboarding-global-skip" onClick={skipOnboarding}>{t.skip}<Icon name="arrow" size={14}/></button></div>
      <div className="onboarding-progress"><i className={step>=1?"active":""}/><i className={step>=2?"active":""}/><i className={step>=3?"active":""}/><i className={step>=4?"active":""}/><i className={step>=5?"active":""}/></div>

      {step===1 && <>
        <button className="onboarding-back-landing" onClick={()=>{setOnboardingError("");setAccountPrompt(false);setAuthActive(false);setLandingSeen(false)}}><Icon name="back" size={16}/>{t.backToMemo}</button>
        <div className="onboarding-kicker">01 / 05</div><h1>{t.welcome}</h1><p>{t.welcomeText}</p>
        <div className="feature-list"><div><span>01</span><b>{t.onboardingFeature1}</b></div><div><span>02</span><b>{t.onboardingFeature2}</b></div><div><span>03</span><b>{t.onboardingFeature3}</b></div></div>
        <div className="onboarding-note"><Icon name="clock" size={16}/><span>{t.onboardingTime}</span></div>
        <button className="primary-button wide" onClick={()=>{setOnboardingError("");setStep(2)}}>{t.continue}<Icon name="arrow"/></button>
      </>}

      {step===2 && <>
        <button className="back-button" onClick={()=>{setOnboardingError("");setStep(1)}}><Icon name="back" size={18}/>{t.back}</button>
        <div className="onboarding-kicker">02 / 05</div><h1>{t.goalTitle}</h1><p>{t.goalText}</p>
        <div className="choice-list">{([[["lose","↓",t.goalLoseText],["maintain","→",t.goalMaintainText],["gain","↑",t.goalGainText]]] as [Goal,string,string][][])[0].map(([g,icon,description])=><button key={g} className={"choice choice-rich "+(goal===g?"selected":"")} onClick={()=>{setGoal(g);setOnboardingError("")}}><span className="choice-icon">{icon}</span><div><b>{t[g]}</b><small>{description}</small></div>{goal===g&&<Icon name="check" size={18}/>}</button>)}</div>
        {goal&&<div className="selection-status"><Icon name="check" size={14}/><span>{goal==="lose"?t.lose:goal==="gain"?t.gain:t.maintain}</span></div>}
        {onboardingError&&<div className="onboarding-error" role="alert"><Icon name="info" size={15}/><span>{onboardingError}</span></div>}
        <button className="primary-button wide" onClick={()=>{if(validateStep(2))setStep(3)}}>{t.continue}<Icon name="arrow"/></button>
      </>}

      {step===3 && <>
        <button className="back-button" onClick={()=>{setOnboardingError("");setStep(2)}}><Icon name="back" size={18}/>{t.back}</button>
        <div className="onboarding-kicker">03 / 05</div><h1>{t.trackingTitle}</h1><p>{t.trackingText}</p>
        <div className="onboarding-choice-grid">{([[["search",t.trackingSearch],["text",t.trackingTextMethod],["photo",t.trackingPhoto],["weigh",t.trackingWeigh],["repeat",t.trackingRepeat],["none",t.trackingNone]]] as [TrackingMethod,string][][])[0].map(([method,label])=><button key={method} className={"onboarding-chip "+(trackingMethod.includes(method)?"selected":"")} onClick={()=>toggleTrackingMethod(method)}>{label}{trackingMethod.includes(method)&&<Icon name="check" size={15}/>}</button>)}</div>
        {onboardingError&&<div className="onboarding-error" role="alert"><Icon name="info" size={15}/><span>{onboardingError}</span></div>}
        <button className="primary-button wide" onClick={()=>{if(validateStep(3))setStep(4)}}>{t.continue}<Icon name="arrow"/></button>
      </>}

      {step===4 && <>
        <button className="back-button" onClick={()=>{setOnboardingError("");setStep(3)}}><Icon name="back" size={18}/>{t.back}</button>
        <div className="onboarding-kicker">04 / 05</div>
        <h1>{t.painTitle}</h1>
        <p>{t.painText}</p>
        <div className="choice-list pain-list">
          {([[["repeat",t.painRepeat],["search",t.painSearch],["manual",t.painManual],["remember",t.painRemember],["corrections",t.painCorrections],["speed",t.painSpeed],["none",t.painNone]]] as [TrackingPain,string][][])[0].map(([pain,label])=>
            <button key={pain} className={"choice choice-rich "+(trackingPain===pain?"selected":"")} onClick={()=>{setTrackingPain(pain);setOnboardingError("")}}>
              <div><b>{label}</b></div>{trackingPain===pain&&<Icon name="check" size={18}/>}
            </button>
          )}
        </div>
        {onboardingError&&<div className="onboarding-error" role="alert"><Icon name="info" size={15}/><span>{onboardingError}</span></div>}
        <button className="primary-button wide" onClick={()=>{if(validateStep(4))setStep(5)}}>{t.continue}<Icon name="arrow"/></button>
      </>}

      {step===5 && <>
        <button className="back-button" onClick={()=>{setOnboardingError("");setStep(4)}}><Icon name="back" size={18}/>{t.back}</button>
        <div className="onboarding-kicker">05 / 05</div>
        <div className="onboarding-profile-header">
          <div className="onboarding-profile-eyebrow">{t.profileEyebrow}</div>
          <h1>{t.profileTitle}</h1>
          <p>{t.profileText}</p>
        </div>

        {onboardingError&&<div className="onboarding-error" role="alert"><Icon name="info" size={15}/><span>{onboardingError}</span></div>}
        <div className="input-grid input-grid-rich">
          <label className={onboardingError&&profile.name.trim().length<2?"has-error":""}>
            <span>{t.name}<em>{t.required}</em></span>
            <input aria-invalid={!!onboardingError&&profile.name.trim().length<2} value={profile.name} onChange={e=>{setProfile(p=>({...p,name:e.target.value.slice(0,80)}));setOnboardingError("")}} onBlur={()=>{if(profile.name.trim())validateProfile()}} placeholder={t.namePlaceholder} autoComplete="given-name" maxLength={80}/>
            <small>{t.nameHint}</small>
          </label>
          <label>
            <span>{t.age}<em>{t.optional}</em></span>
            <input value={profile.age} onChange={e=>{setProfile(p=>({...p,age:e.target.value.replace(/\D/g,"").slice(0,3)}));setOnboardingError("")}} onBlur={()=>{if(profile.age)validateProfile()}} placeholder={t.ageHint} inputMode="numeric" maxLength={3}/>
            <small>{t.ageRange}</small>
          </label>
          <label>
            <span>{t.weight}<em>{t.optional}</em></span>
            <input value={profile.weight} onChange={e=>{setProfile(p=>({...p,weight:e.target.value.replace(/[^0-9.]/g,"").slice(0,6)}));setOnboardingError("")}} onBlur={()=>{if(profile.weight)validateProfile()}} placeholder={t.weightHint} inputMode="decimal" maxLength={6}/>
            <small>{t.weightRange}</small>
          </label>
          <label>
            <span>{t.height}<em>{t.optional}</em></span>
            <input value={profile.height} onChange={e=>{setProfile(p=>({...p,height:e.target.value.replace(/\D/g,"").slice(0,3)}));setOnboardingError("")}} onBlur={()=>{if(profile.height)validateProfile()}} placeholder={t.heightHint} inputMode="numeric" maxLength={3}/>
            <small>{t.heightRange}</small>
          </label>
        </div>
        <div className="onboarding-note"><Icon name="spark" size={16}/><span>{t.detailsHint}</span></div>
        <button className="primary-button wide" onClick={finishOnboarding}>{t.finish}<Icon name="arrow"/></button>
      </>}
    </div>
  </main>;

  const nav:[View,string,string][]=[["home",t.home,"home"],["history",t.history,"clock"],["progress",t.progress,"chart"],["settings",t.settings,"settings"]];

  return <div className="app-shell">
    <aside className="sidebar"><div className="sidebar-logo"><span>M</span><strong>Memo</strong></div><nav>{nav.map(([k,l,i])=><button key={k} className={"nav-item "+(view===k?"active":"")} onClick={()=>setView(k)}><Icon name={i} size={19}/><span>{l}</span></button>)}</nav>
      <div className="sidebar-memory"><Icon name="spark" size={17}/><b>{t.memory}</b><p>{t.memoryText}</p></div><button className="profile-mini profile-mini-button" onClick={()=>setView("settings")} aria-label={t.settings}><div className="avatar">{avatarLetter}</div><div><b>{profile.name || "Memo"}</b><span>{t.freePlan} · {t.upgrade}</span></div><Icon name="arrow" size={15}/></button>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="mobile-brand"><span>M</span><b>Memo</b></div><div className="topbar-actions">
        <button className="icon-button" onClick={()=>setTheme(theme==="light"?"dark":"light")} aria-label={t.themeAria}><Icon name={theme==="light"?"moon":"sun"} size={19}/></button>
        <button className="language-button" onClick={()=>setLocale(locale==="en"?"pt":"en")}><Icon name="globe" size={17}/>{locale.toUpperCase()}</button><button className="avatar avatar-button" onClick={()=>setView("settings")} aria-label={t.settings}>{avatarLetter}</button>
      </div></header>

      {view==="home" && <div className="page-wrap">
        <section className="welcome-row"><div><span className="muted-label">{t.today} · {todayDateLabel}</span><h1>{t.hello}, {profile.name || "Memo"}.</h1><p>{t.subtitle}</p></div><div className="home-actions"><button className="primary-button desktop-add" onClick={()=>openLogger()}><Icon name="plus" size={19}/>{t.addMeal}</button></div></section>
        <section className="dashboard-grid"><div className="card calorie-card"><div className="card-heading"><div><span className="muted-label">{t.calories}</span><h2>{formatNumber(todayCalories)} <small>/ {formatNumber(target)}</small></h2><span className="calorie-remaining">{formatNumber(remainingCalories)} kcal {t.remaining}</span></div><ProgressRing value={todayCalories} max={target}/></div>
          <div className="macro-row"><div><span className="macro-dot"/><span>{t.protein}</span><b>{todayProtein}g</b></div><div><span className="macro-dot carbs"/><span>{t.carbs}</span><b>{todayCarbs}g</b></div><div><span className="macro-dot fat"/><span>{t.fat}</span><b>{todayFat}g</b></div></div></div>
          <div className="card memory-card"><div className="memory-icon"><Icon name="spark" size={21}/></div><span className="muted-label">{t.memory}</span><h3>{t.landingMemoryTitle}</h3><p>{t.memoryText}</p><button className="text-button" onClick={()=>setView("history")}>{t.seeAll}<Icon name="arrow" size={15}/></button></div>
        </section>
        <section className="section"><div className="section-heading"><div><span className="muted-label">{t.usual}</span><h2>{t.oneTapMeals}</h2></div><button className="text-button" onClick={()=>setView("history")}>{t.seeAll}<Icon name="chevron" size={15}/></button></div>
          <div className="usual-grid">{learned.map(m=><button className="usual-card" key={m.id} onClick={()=>startUsual(m)}><div className="meal-symbol">{m.type==="Breakfast"?"☀":m.type==="Lunch"?"◒":"◉"}</div><div><b>{locale==="pt"?(m.id==="1"?"Frango com arroz":m.id==="2"?"Iogurte grego e banana":m.id==="3"?"Maçã e pasta de amendoim":m.name):m.name}</b><span>{m.calories} kcal · {m.protein}g {locale==="pt"?"proteína":"protein"}</span></div><Icon name="plus" size={17}/></button>)}</div>
        </section>
        <section className="section"><div className="section-heading"><div><span className="muted-label">{t.recent}</span><h2>{t.today}</h2></div><button className="text-button" onClick={()=>setView("history")}>{t.seeAll}<Icon name="arrow" size={15}/></button></div>
          <div className="meal-list">{todayMeals.length?todayMeals.slice(0,4).map(m=><div className="meal-row" key={m.id}><div className="meal-symbol soft">{m.type==="Breakfast"?"☀":m.type==="Lunch"?"◒":m.type==="Snack"?"◉":"◍"}</div><div className="meal-main"><b>{m.name}</b><span>{m.time} · {m.note}</span></div><div className="meal-kcal"><b>{m.calories}</b><span>kcal</span></div></div>):<div className="empty-inline"><b>{t.noMeals}</b><span>{t.noMealsText}</span></div>}</div>
        </section>
      </div>}

      {view==="history" && <div className="page-wrap"><section className="welcome-row compact"><div><span className="muted-label">{t.historyEyebrow}</span><h1>{t.history}</h1><p>{t.historySubtitle}</p></div><button className="primary-button" onClick={()=>openLogger()}><Icon name="plus" size={19}/>{t.addMeal}</button></section>
        <div className="history-summary"><div className="card"><span className="muted-label">{t.mealsLabel}</span><strong>{todayMeals.length}</strong><span>{t.today}</span></div><div className="card"><span className="muted-label">{t.calories}</span><strong>{formatNumber(todayCalories)}</strong><span>kcal</span></div><div className="card"><span className="muted-label">{t.protein}</span><strong>{todayProtein}g</strong><span>{t.today}</span></div></div>{meals.length?Array.from(new Set(meals.map(m=>mealDate(m).toDateString()))).map(day=>{const dayMeals=meals.filter(m=>mealDate(m).toDateString()===day);const date=new Date(day);return <div className="history-day" key={day}><div className="day-label">{date.toLocaleDateString(locale==="pt"?"pt-PT":"en-US",{weekday:"long",day:"numeric",month:"short"})} <span>{dayMeals.length} {t.mealsLabel}</span></div>{dayMeals.map(m=><div className="meal-row large" key={m.id}><div className="meal-symbol soft">{m.type==="Breakfast"?"☀":m.type==="Lunch"?"◒":m.type==="Snack"?"◉":"◍"}</div><div className="meal-main"><b>{m.name}</b><span>{m.time} · {m.note}</span></div><div className="confidence">{m.confidence==="High"?t.high:t.medium}<i/></div><div className="meal-kcal"><b>{m.calories}</b><span>kcal</span></div></div>)}</div>}):<div className="card empty-state"><h3>{t.noMeals}</h3><p>{t.noMealsText}</p><button className="primary-button" onClick={()=>openLogger()}><Icon name="plus" size={18}/>{t.addMeal}</button></div>}</div>}

      {view==="progress" && <div className="page-wrap"><section className="welcome-row compact"><div><span className="muted-label">{t.progressEyebrow}</span><h1>{t.progress}</h1><p>{t.progressSubtitle}</p></div></section>
        <div className="progress-grid"><div className="card progress-main"><div className="progress-header"><div><span className="muted-label">{t.intakeLabel}</span><h2>{formatNumber(todayCalories)} <small>/ {formatNumber(target)} kcal</small></h2></div><div className="progress-percent">{Math.min(100,Math.round(todayCalories/Math.max(1,target)*100))}%</div></div><div className="progress-track"><i style={{width:Math.min(100,Math.round(todayCalories/Math.max(1,target)*100))+"%"}}/></div><div className="progress-metrics"><div><span>{t.mealsLabel}</span><b>{todayMeals.length}</b></div><div><span>{t.protein}</span><b>{todayProtein}g</b></div><div><span>{t.fat}</span><b>{todayFat}g</b></div></div></div><div className="card progress-pattern"><span className="muted-label">{t.last7}</span><div className="progress-stat-grid"><div><strong>{averageCalories||"—"}</strong><span>{t.avgDaily}</span></div><div><strong>{activeDays}</strong><span>{t.daysActive}</span></div></div><h3>{t.topMeals}</h3>{repeated.length?<div className="repeat-list">{repeated.map(([name,count])=><div key={name}><span>{name}</span><b>{count}×</b></div>)}</div>:<p className="card-note">{t.noPattern}</p>}<button className="text-button" onClick={()=>openLogger()}>{t.addMeal}<Icon name="arrow" size={15}/></button></div></div></div>}

      {view==="settings" && <div className="page-wrap"><section className="welcome-row compact"><div><span className="muted-label">{t.settingsEyebrow}</span><h1>{t.settings}</h1><p>{t.settingsSubtitle}</p></div></section>
        <div className="settings-profile card"><div className="avatar large">{avatarLetter}</div><div><span className="muted-label">{t.profile}</span><h3>{profile.name||"Memo"}</h3><p>{t.goal}: {goal==="lose"?t.lose:goal==="gain"?t.gain:t.maintain}</p></div><button className="secondary-button settings-edit-button" onClick={()=>{setEditingProfile(v=>!v);setOnboardingError("")}}>{editingProfile?t.cancel:t.editProfile}</button></div>
        {profileNotice&&<div className="settings-notice"><Icon name="check" size={15}/><span>{profileNotice}</span></div>}
        {editingProfile&&<div className="card settings-editor">
          <div className="settings-editor-header"><div><span className="muted-label">{t.profile}</span><h3>{t.editProfile}</h3><p>{t.editProfileText}</p></div></div>
          <div className="input-grid-rich">
            <label><span>{t.name}<em>{t.required}</em></span><input value={profile.name} onChange={e=>{setProfile(p=>({...p,name:e.target.value}));setOnboardingError("")}} placeholder={t.namePlaceholder} autoComplete="name"/><small>{t.nameHint}</small></label>
            <label><span>{t.age}<em>{t.optional}</em></span><input value={profile.age} onChange={e=>setProfile(p=>({...p,age:e.target.value.replace(/\D/g,"").slice(0,3)}))} placeholder={t.ageHint} inputMode="numeric" maxLength={3}/><small>{t.ageRange}</small></label>
            <label><span>{t.weight}<em>{t.optional}</em></span><input value={profile.weight} onChange={e=>setProfile(p=>({...p,weight:e.target.value.replace(/[^0-9.]/g,"").slice(0,6)}))} placeholder={t.weightHint} inputMode="decimal"/><small>{t.weightRange}</small></label>
            <label><span>{t.height}<em>{t.optional}</em></span><input value={profile.height} onChange={e=>setProfile(p=>({...p,height:e.target.value.replace(/\D/g,"").slice(0,3)}))} placeholder={t.heightHint} inputMode="numeric" maxLength={3}/><small>{t.heightRange}</small></label>
          </div>
          {onboardingError&&<div className="form-error"><Icon name="info" size={14}/><span>{onboardingError}</span></div>}
          <button className="primary-button wide" onClick={saveProfileSettings}>{t.saveChanges}<Icon name="check" size={16}/></button>
        </div>}
        <div className="card settings-goal-editor"><div><span className="muted-label">{t.goal}</span><h3>{t.goalSettingsTitle}</h3></div><div className="goal-options-settings"><button className={goal==="lose"?"active":""} onClick={()=>setSettingsGoal("lose")}>{t.lose}</button><button className={goal==="maintain"?"active":""} onClick={()=>setSettingsGoal("maintain")}>{t.maintain}</button><button className={goal==="gain"?"active":""} onClick={()=>setSettingsGoal("gain")}>{t.gain}</button></div></div>
        <button className="plan-card" onClick={openUpgrade}><div><span className="muted-label">{t.freePlan}</span><strong>{t.upgrade}</strong><p>{t.upgradeText}</p></div><Icon name="arrow" size={19}/></button><div className="settings-list"><div className="settings-section"><span className="muted-label">{t.appearance}</span><div className="theme-options"><button className={theme==="light"?"active":""} onClick={()=>setTheme("light")}><Icon name="sun" size={16}/><span>{t.light}</span></button><button className={theme==="dark"?"active":""} onClick={()=>setTheme("dark")}><Icon name="moon" size={16}/><span>{t.dark}</span></button><button className={theme==="system"?"active":""} onClick={()=>setTheme("system")}><Icon name="monitor" size={16}/><span>{t.themeSystem}</span></button></div></div>
          <div className="settings-section"><span className="muted-label">{t.language}</span><div className="theme-options language-options"><button className={locale==="pt"?"active":""} onClick={()=>setLocale("pt")}><span>PT</span><b>Português</b></button><button className={locale==="en"?"active":""} onClick={()=>setLocale("en")}><span>EN</span><b>English</b></button></div></div>

        </div>
      </div>}
    </main>

    <nav className="bottom-nav">{nav.map(([k,l,i])=><button key={k} className={view===k?"active":""} onClick={()=>setView(k)}><Icon name={i} size={20}/><span>{l}</span></button>)}</nav>
    <button className="floating-add" onClick={()=>openLogger()}><Icon name="plus" size={23}/></button>

    {showUpgrade && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowUpgrade(false)}}><div className="upgrade-modal card"><div className="modal-header"><div><span className="muted-label">{t.freePlan}</span><h2>{t.upgradeTitle}</h2></div><button className="icon-button" onClick={()=>setShowUpgrade(false)}><Icon name="close"/></button></div><p className="modal-copy">{t.upgradeText}</p><div className="upgrade-price">{t.upgradePrice}</div><div className="upgrade-benefits">{[t.upgradeBenefit1,t.upgradeBenefit2,t.upgradeBenefit3,t.upgradeBenefit4,t.upgradeBenefit5].map(item=><div key={item}><Icon name="check" size={16}/><span>{item}</span></div>)}</div>{upgradeNotice?<div className="upgrade-notice"><Icon name="check" size={16}/><span>{upgradeNotice}</span></div>:<><label className="upgrade-email"><span>{t.email}</span><input type="email" value={upgradeEmail} onChange={e=>setUpgradeEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/><small>{t.upgradeEmailHint}</small></label><button className="primary-button wide" disabled={upgradeLoading} onClick={submitUpgrade}>{upgradeLoading?t.authLoading:t.upgradeAction}<Icon name="arrow" size={17}/></button></>}<button className="account-secondary" onClick={()=>setShowUpgrade(false)}>{t.upgradeClose}</button></div></div>}

    {showLogger && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowLogger(false)}}><div className="meal-modal meal-modal-rich" role="dialog" aria-modal="true" aria-labelledby="meal-modal-title">
      <div className="modal-header"><div><span className="muted-label">{editingMealId?(locale==="pt"?"MEMO / EDITAR REFEIÇÃO":"MEMO / EDIT MEAL"):t.logEyebrow}</span><h2 id="meal-modal-title">{editingMealId?(locale==="pt"?"Editar refeição":"Edit meal"):(result?t.reviewMealTitle:t.addMealTitle)}</h2></div><button className="icon-button" onClick={closeLogger}><Icon name="close"/></button></div>
      {!result ? <>
        <div className="logger-tabs" role="tablist"><button role="tab" aria-selected={loggerMode==="describe"} className={loggerMode==="describe"?"active":""} onClick={()=>{setLoggerMode("describe");setEditNotice("");setResult(false);setSelectedUsualId("");setSelectedFoodIds([]);setMealText(editingMealId?(meals.find(item=>item.id===editingMealId)?.name||""):"");setPhotoName("")}}><Icon name="pen" size={14}/><span>{t.describe}</span></button><button role="tab" aria-selected={loggerMode==="search"} className={loggerMode==="search"?"active":""} onClick={()=>{setLoggerMode("search");setEditNotice("");setResult(false);setSelectedUsualId("");setPhotoName("");if(editingMealId){const m=meals.find(item=>item.id===editingMealId);setSelectedFoodIds(m?findFoodIdsForMeal(m.name):[]);setMealText(m?.name||"")}else{setSelectedFoodIds([]);setMealText("")}}}><Icon name="search" size={14}/><span>{t.databaseTitle}</span></button><button role="tab" aria-selected={loggerMode==="photo"} className={loggerMode==="photo"?"active":""} onClick={()=>{setLoggerMode("photo");setEditNotice("");setResult(false);setSelectedUsualId("");setSelectedFoodIds([]);if(editingMealId){const m=meals.find(item=>item.id===editingMealId);setMealText(m?.name||"");setPhotoName(m?.photoName||"")}else{setMealText("");setPhotoName("")}}}><Icon name="camera" size={14}/><span>{t.photo}</span></button><button role="tab" aria-selected={loggerMode==="usual"} className={loggerMode==="usual"?"active":""} onClick={()=>{setLoggerMode("usual");setEditNotice("");setResult(false);setSelectedFoodIds([]);setPhotoName("");if(editingMealId){const m=meals.find(item=>item.id===editingMealId);setMealText(m?.name||"");setSelectedUsualId(editingMealId)}else{setMealText("")}}}><Icon name="bolt" size={14}/><span>{t.usualMeal}</span></button></div>
        {loggerMode==="describe" && <><p className="modal-copy">{t.describeHint}</p><textarea value={mealText} onChange={e=>setMealText(e.target.value)} placeholder={t.describePlaceholder} autoFocus/><div className="quick-examples"><button onClick={()=>{setSelectedUsualId("");setSelectedFoodIds(["chicken","rice"]);setMealText(locale==="pt"?"Frango grelhado e arroz cozido":"Grilled chicken and cooked rice")}}>{t.quickChicken}</button><button onClick={()=>{setSelectedUsualId("");setSelectedFoodIds(["oats","banana"]);setMealText(locale==="pt"?"Aveia e banana":"Oatmeal and banana")}}>{t.quickOatmeal}</button><button onClick={()=>{setSelectedUsualId("");setSelectedFoodIds(["yogurt","banana"]);setMealText(locale==="pt"?"Iogurte grego e banana":"Greek yogurt and banana")}}>{t.quickYogurt}</button></div></>}
        {loggerMode==="search" && <><p className="modal-copy">{t.databaseHint}</p><input className="food-search" value={foodSearch} onChange={e=>setFoodSearch(e.target.value)} placeholder={t.databasePlaceholder}/><div className="food-results">{filteredFoods.length?filteredFoods.map(food=><button key={food.id} className={selectedFoodIds.includes(food.id)?"selected":""} aria-pressed={selectedFoodIds.includes(food.id)} onClick={()=>selectFood(food)}><span><b>{locale==="pt"?food.pt:food.en}</b><small>{food.calories} kcal / 100g</small></span>{selectedFoodIds.includes(food.id)?<Icon name="check" size={16}/>:<Icon name="plus" size={16}/>}</button>):<div className="empty-inline">{t.databaseEmpty}</div>}</div></>}
        {loggerMode==="photo" && <><p className="modal-copy">{t.photoDesc}</p><label className="photo-drop"><input type="file" accept="image/*" capture="environment" onChange={e=>setPhotoName(e.target.files?.[0]?.name||"")}/><span className="photo-icon"><Icon name="camera" size={30}/></span><b>{photoName||t.addPhoto}</b><small>{photoName?t.photoReady:t.photoHint}</small></label><div className="ai-prep-note"><Icon name="spark" size={16}/><div><b>{t.photoAiTitle}</b><span>{t.photoAiText}</span></div></div></>}
        {loggerMode==="usual" && <div className="usual-picker">{editingMealId?<div className="edit-usual-panel"><div className="edit-usual-heading"><div><span className="muted-label">{locale==="pt"?"REFEIÇÃO HABITUAL":"USUAL MEAL"}</span><b>{locale==="pt"?"Editar esta refeição":"Edit this meal"}</b><small>{locale==="pt"?"Altere o nome, os alimentos e a porção antes de guardar.":"Change the name, foods and portion before saving."}</small></div></div><label><span>{t.mealName}</span><input value={mealText} onChange={e=>setMealText(e.target.value.slice(0,120))} maxLength={120}/></label><div className="edit-usual-foods"><div className="edit-usual-section-title"><span>{locale==="pt"?"Alimentos":"Foods"}</span><small>{locale==="pt"?"Selecione os que fazem parte desta refeição.":"Select the foods included in this meal."}</small></div><div className="food-results edit-usual-food-results">{foodDatabase.map(food=><button type="button" key={food.id} className={selectedFoodIds.includes(food.id)?"selected":""} aria-pressed={selectedFoodIds.includes(food.id)} onClick={()=>toggleEditUsualFood(food)}><span><b>{locale==="pt"?food.pt:food.en}</b><small>{food.calories} kcal / 100g</small></span>{selectedFoodIds.includes(food.id)?<Icon name="check" size={16}/>:<Icon name="plus" size={16}/>}</button>)}</div></div><label><span>{t.portion}</span><select value={portion} onChange={e=>{const next=e.target.value;setPortion(next);if(selectedFoodIds.length)setEstimate(adjustEstimate(editBaseEstimate,next))}}><option value="small">{t.small}</option><option value="normal">{t.normal}</option><option value="large">{t.large}</option></select></label><div className="edit-usual-summary"><div><b>{locale==="pt"?"Nova estimativa":"New estimate"}</b><span>{estimate.min}–{estimate.max} kcal · {estimate.protein}g {t.proteinShort.toLowerCase()}</span></div><small>{locale==="pt"?"A refeição original não é alterada até você guardar.":"The original meal is unchanged until you save."}</small></div></div>:learned.length?learned.map(m=><button key={m.id} className={selectedUsualId===m.id?"selected":""} onClick={()=>startUsual(m)}><span className="meal-symbol">{m.type==="Breakfast"?"☀":m.type==="Lunch"?"◒":"◉"}</span><span><b>{m.name}</b><small>{m.calories} kcal · {t.usedBefore}</small></span>{selectedUsualId===m.id?<Icon name="check" size={16}/>:<Icon name="chevron" size={16}/>}</button>):<div className="usual-empty"><Icon name="bolt" size={18}/><div><b>{locale==="pt"?"Ainda não há refeições habituais":"No usual meals yet"}</b><span>{locale==="pt"?"Registre algumas refeições e o Memo começará a guardá-las aqui.":"Log a few meals and Memo will start saving them here."}</span></div></div>}</div>}
        <div className="logger-details">{loggerMode!=="usual" && loggerMode!=="photo" && <><label><span>{t.meal}</span><select value={mealType} onChange={e=>setMealType(e.target.value as Meal["type"])}><option value="Breakfast">{t.breakfast}</option><option value="Lunch">{t.lunch}</option><option value="Snack">{t.snack}</option><option value="Dinner">{t.dinner}</option></select></label><label><span>{t.portion}</span><select value={portion} onChange={e=>setPortion(e.target.value)}><option value="small">{t.small}</option><option value="normal">{t.normal}</option><option value="large">{t.large}</option></select></label></>}</div>
        <div className="modal-tip"><Icon name="spark" size={17}/><span>{t.mealTip}</span></div>
        <button className="primary-button wide" disabled={analyzing||(!editingMealId&&(loggerMode==="photo"||loggerMode==="usual"))||(!mealText.trim()&&!photoName)||(loggerMode==="search"&&!selectedFoodIds.length)} onClick={analyze}>{editingMealId?(locale==="pt"?"Revisar alterações":"Review changes"):(loggerMode==="photo"?t.photoAiAction:analyzing?t.analyzing:t.analyze)}<Icon name="arrow"/></button>
      </> : <>
        <div className="review-source"><span className="source-pill">{loggerMode==="photo"?t.sourcePhoto:loggerMode==="usual"?t.sourceUsual:loggerMode==="search"?t.databaseTitle:t.sourceDescription}</span><span className="confidence-pill">{t.confidenceMedium}</span></div>{editNotice&&<div className="form-error" role="alert"><Icon name="info" size={14}/><span>{editNotice}</span></div>}
        <div className="meal-preview-card"><div className="meal-symbol">{mealType==="Breakfast"?"☀":mealType==="Lunch"?"◒":mealType==="Snack"?"◉":"◍"}</div><div><b>{mealText||photoName||t.yourMeal}</b><span>{mealType==="Breakfast"?t.breakfast:mealType==="Lunch"?t.lunch:mealType==="Snack"?t.snack:t.dinner} · {t.portionLabel}: {portion==="small"?t.small.toLowerCase():portion==="large"?t.large.toLowerCase():t.normal.toLowerCase()}</span></div><button className="text-button" onClick={()=>setResult(false)}>{t.edit}</button></div>
        <div className="estimate estimate-rich"><div><span className="muted-label">{t.estimatedEnergy}</span><strong>{estimate.min}–{estimate.max}</strong><span>kcal</span></div><div className="estimate-badge">{t.approximate}</div></div>
        <div className="estimate-grid"><div><span>{t.proteinShort}</span><b>{estimate.protein}g</b></div><div><span>{t.carbsShort}</span><b>{estimate.carbs}g</b></div><div><span>{t.fatShort}</span><b>{estimate.fat}g</b></div></div>
        <div className="uncertainty"><Icon name="info" size={17}/><div><b>{t.uncertaintyTitle}</b><p>{t.uncertaintyText}</p></div></div>
        <div className="correction-box"><b>{t.quickCorrection}</b><div><button className={portion==="small"?"selected":""} onClick={()=>{setPortion("small");setEstimate(editingMealId?adjustEstimate(editBaseEstimate,"small"):estimateMealText(mealText,"small"))}}>{t.smaller}</button><button className={portion==="normal"?"selected":""} onClick={()=>{setPortion("normal");setEstimate(editingMealId?adjustEstimate(editBaseEstimate,"normal"):estimateMealText(mealText,"normal"))}}>{t.aboutRight}</button><button className={portion==="large"?"selected":""} onClick={()=>{setPortion("large");setEstimate(editingMealId?adjustEstimate(editBaseEstimate,"large"):estimateMealText(mealText,"large"))}}>{t.larger}</button></div></div>
        <div className="modal-actions"><button className="secondary-button" onClick={()=>editingMealId?closeLogger():setResult(false)}>{editingMealId?t.cancel:t.back}</button><button className="primary-button" onClick={confirm} disabled={editingMealId?(!mealText.trim()&&!photoName):(!mealText.trim()&&!photoName)}>{editingMealId?(locale==="pt"?"Guardar alterações":"Save changes"):t.confirmRemember} <Icon name="check" size={18}/></button></div>
        <div className="learned-banner"><Icon name="spark" size={17}/><div><b>{t.learnedBannerTitle}</b><span>{t.learnedBannerText}</span></div></div>
      </>}
    </div></div>}
  </div>;
}
