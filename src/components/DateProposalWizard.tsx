import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Coffee, Gamepad2, UtensilsCrossed, CheckCircle2, Heart, Sparkles, Send, PartyPopper, CalendarHeart, MessageCircleHeart, Map, ArrowRight, ArrowLeft, Shirt, ChevronLeft, ChevronRight, Film, Brush, PencilLine, Sofa, Crown, Dices, Sunrise, Moon } from 'lucide-react';

type Step = 'INTRO' | 'Q1_ACTIVITY' | 'Q2_DATETIME' | 'Q3_DRESSCODE' | 'Q4_NOTES' | 'LOADING' | 'SUCCESS';

interface Activity {
  id: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const ACTIVITIES: Activity[] = [
  { id: 'coffee', title: 'Coffee & Walk', Icon: Coffee, description: 'Low pressure, high vibes.' },
  { id: 'tacos', title: 'Tacos & Margs', Icon: UtensilsCrossed, description: 'The fastest way to my heart.' },
  { id: 'arcade', title: 'Arcade Bar', Icon: Gamepad2, description: 'A little friendly competition.' },
  { id: 'movie', title: 'Movie Night', Icon: Film, description: 'Popcorn, dim lights, and arguing over what to watch.' },
  { id: 'museum', title: 'Museum / Art', Icon: Brush, description: 'Pretending we understand modern art.' },
  { id: 'custom', title: 'Your Idea!', Icon: PencilLine, description: 'Got a better plan? Let me hear it.' },
];

const TIME_SLOTS = [
  '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
];

interface DressCode {
  id: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const DRESS_CODES: DressCode[] = [
  { id: 'casual', title: 'Comfy & Casual', Icon: Sofa, description: 'Sweatpants welcome. No judgment here.' },
  { id: 'smart', title: 'Smart Casual', Icon: Shirt, description: 'Looking good but not trying too hard.' },
  { id: 'fancy', title: 'Fancy', Icon: Crown, description: 'Dress to impress. Let\'s go all out.' },
  { id: 'surprise', title: 'Surprise Me', Icon: Dices, description: 'I\'ll match whatever energy you bring.' },
];

// Per-activity theming for the success screen — colors, icons, ambient glyphs, copy.
interface ActivityTheme {
  pageBg: string;            // outer page wash (gradient)
  cardBg: string;            // success card surface
  cardBorder: string;        // card border tint
  accent: string;            // primary accent (bg) for icon badge / CTA
  accentHover: string;       // primary hover
  accentText: string;        // text color matching accent
  accentSoft: string;        // soft accent surface (chip/secondary CTA bg)
  accentSoftBorder: string;  // border for the soft surface
  ring: string;              // ring/shadow tint
  glowA: string;             // top-right blob color
  glowB: string;             // bottom-left blob color
  headline: string;          // hero copy
  subhead: string;           // secondary copy
  ambientIcon: React.ComponentType<{ className?: string }>; // floating background motif
  badgeIcon: React.ComponentType<{ className?: string }>;   // big icon in hero badge
  planIcon: React.ComponentType<{ className?: string }>;    // icon next to "The Plan"
}

const ACTIVITY_THEMES: Record<string, ActivityTheme> = {
  coffee: {
    pageBg: 'from-amber-50 via-orange-50 to-rose-50',
    cardBg: 'bg-amber-50/85',
    cardBorder: 'border-amber-100',
    accent: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700',
    accentText: 'text-amber-700',
    accentSoft: 'bg-amber-100/80',
    accentSoftBorder: 'border-amber-200',
    ring: 'shadow-amber-300/50',
    glowA: 'bg-amber-200',
    glowB: 'bg-orange-200',
    headline: 'Brewed to perfection.',
    subhead: "Two cups, one walk, zero awkward silences. I'll bring the small talk.",
    ambientIcon: Coffee,
    badgeIcon: Coffee,
    planIcon: Coffee,
  },
  tacos: {
    pageBg: 'from-orange-50 via-red-50 to-yellow-50',
    cardBg: 'bg-orange-50/85',
    cardBorder: 'border-orange-100',
    accent: 'bg-red-500',
    accentHover: 'hover:bg-red-600',
    accentText: 'text-red-600',
    accentSoft: 'bg-orange-100/80',
    accentSoftBorder: 'border-orange-200',
    ring: 'shadow-red-300/50',
    glowA: 'bg-orange-200',
    glowB: 'bg-yellow-200',
    headline: "Tacos. Margs. You. Me.",
    subhead: "It's basically a four-course love story. Salt rims included.",
    ambientIcon: UtensilsCrossed,
    badgeIcon: UtensilsCrossed,
    planIcon: UtensilsCrossed,
  },
  arcade: {
    pageBg: 'from-violet-50 via-fuchsia-50 to-indigo-50',
    cardBg: 'bg-violet-50/85',
    cardBorder: 'border-violet-100',
    accent: 'bg-violet-600',
    accentHover: 'hover:bg-violet-700',
    accentText: 'text-violet-700',
    accentSoft: 'bg-violet-100/80',
    accentSoftBorder: 'border-violet-200',
    ring: 'shadow-violet-400/50',
    glowA: 'bg-fuchsia-200',
    glowB: 'bg-indigo-200',
    headline: 'Game on. Loser buys drinks.',
    subhead: "Fair warning: I take Mario Kart very, very seriously.",
    ambientIcon: Gamepad2,
    badgeIcon: Gamepad2,
    planIcon: Gamepad2,
  },
  movie: {
    pageBg: 'from-slate-100 via-indigo-50 to-slate-50',
    cardBg: 'bg-slate-50/85',
    cardBorder: 'border-slate-200',
    accent: 'bg-indigo-700',
    accentHover: 'hover:bg-indigo-800',
    accentText: 'text-indigo-700',
    accentSoft: 'bg-indigo-50',
    accentSoftBorder: 'border-indigo-200',
    ring: 'shadow-indigo-400/50',
    glowA: 'bg-indigo-200',
    glowB: 'bg-slate-200',
    headline: 'Roll the credits — it\'s a date.',
    subhead: "I'll bring the popcorn. You bring the strong opinions about the ending.",
    ambientIcon: Film,
    badgeIcon: Film,
    planIcon: Film,
  },
  museum: {
    pageBg: 'from-stone-50 via-emerald-50 to-amber-50',
    cardBg: 'bg-stone-50/85',
    cardBorder: 'border-stone-200',
    accent: 'bg-emerald-700',
    accentHover: 'hover:bg-emerald-800',
    accentText: 'text-emerald-700',
    accentSoft: 'bg-emerald-50',
    accentSoftBorder: 'border-emerald-200',
    ring: 'shadow-emerald-400/40',
    glowA: 'bg-emerald-200',
    glowB: 'bg-amber-100',
    headline: 'A masterpiece in the making.',
    subhead: "We'll nod thoughtfully at paintings and pretend we know what they mean.",
    ambientIcon: Brush,
    badgeIcon: Brush,
    planIcon: Brush,
  },
  custom: {
    pageBg: 'from-rose-50 via-pink-50 to-orange-50',
    cardBg: 'bg-white/85',
    cardBorder: 'border-rose-100',
    accent: 'bg-rose-500',
    accentHover: 'hover:bg-rose-600',
    accentText: 'text-rose-600',
    accentSoft: 'bg-rose-50',
    accentSoftBorder: 'border-rose-200',
    ring: 'shadow-rose-300/50',
    glowA: 'bg-pink-200',
    glowB: 'bg-rose-200',
    headline: "Your idea. I'm sold.",
    subhead: "Honestly, the fact that you planned this already makes it the best date ever.",
    ambientIcon: Sparkles,
    badgeIcon: PencilLine,
    planIcon: PencilLine,
  },
};

const DEFAULT_THEME: ActivityTheme = ACTIVITY_THEMES.custom;

const bouncySpring = { type: 'spring', stiffness: 400, damping: 25 } as const;
const slowSpring = { type: 'spring', stiffness: 200, damping: 20 } as const;

const noMessages = [
  "No thanks",
  "Are you sure?",
  "Think again...",
  "Nice try!",
  "Give up now please",
  "Resistance is futile",
  "Just click Yes already",
  "Okay, you're stubborn",
  "I have all day"
];

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [breakpoint]);
  return isMobile;
}

const pickupLines = [
  "I promise I'm at least 20% funnier in person. Want to grab a drink (or tacos) and find out?",
  "Are you a 404 error? Because I can't seem to find anyone else like you.",
  "Do you believe in love at first sight, or should I refresh this page?",
  "I must be a keyboard, because you're exactly my type.",
  "Is your Wi-Fi down? Because I'm definitely feeling a connection.",
  "I was going to use a cheesy pickup line, but my API limit was reached.",
  "You must be a high-order function, because you're elevating my state.",
  "If we were variables, I'd want us to be in the same scope.",
  "Are you an exception? Because I want to catch you.",
  "My love for you is like a while(true) loop—it has no end."
];

export default function DateProposalWizard() {
  const [step, setStep] = useState<Step>('INTRO');
  const isMobile = useIsMobile();

  // Random Pickup Line
  const [pickupLine] = useState(() => pickupLines[Math.floor(Math.random() * pickupLines.length)]);
  
  // Form State
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [customActivityText, setCustomActivityText] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDressCode, setSelectedDressCode] = useState<string>('');
  const [dietary, setDietary] = useState<string>('');
  
  // Scroller Ref
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  const getActivityTitle = () => {
    if (selectedActivity === 'custom') return customActivityText || 'Custom Plan';
    return ACTIVITIES.find(a => a.id === selectedActivity)?.title || '';
  };

  // Loading State
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const getLoadingMessages = () => {
    const tail = [
      "Practicing my best jokes (the bar is low)...",
      "Reminding myself: be charming, not weird...",
      "Almost ready..."
    ];
    const byActivity: Record<string, string[]> = {
      coffee: [
        "Bribing the barista for the good table...",
        "Memorizing your order so I look thoughtful...",
      ],
      tacos: [
        "Calling dibs on the corner booth...",
        "Practicing 'no cilantro, please' in three accents...",
      ],
      arcade: [
        "Stockpiling tokens like it's the apocalypse...",
        "Pretending I'll let you win at air hockey...",
      ],
      movie: [
        "Scanning showtimes for something we'll both pretend to like...",
        "Pre-negotiating the popcorn split...",
      ],
      museum: [
        "Googling 'how to sound smart about modern art'...",
        "Picking the painting I'll fake-cry in front of...",
      ],
      custom: [
        "Reviewing your brilliant idea (genuinely impressed)...",
        "Adjusting my plans accordingly...",
      ],
    };
    const intro = byActivity[selectedActivity] ?? ["Locking in the perfect spot..."];
    return [...intro, ...tail];
  };

  const loadingMessages = getLoadingMessages();

  // Success State
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // No Button State
  const [noStyle, setNoStyle] = useState<React.CSSProperties>({});
  const [noClicks, setNoClicks] = useState(0);

  // Generate next 14 days
  const availableDates = React.useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0); // Normalize time
      d.setDate(d.getDate() + i + 1);
      return d;
    });
  }, []);

  useEffect(() => {
    if (step === 'LOADING') {
      // Fire notification asynchronously
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: getActivityTitle(),
          date: selectedDate ? new Date(selectedDate).toLocaleDateString() : '',
          time: selectedTime,
          dressCode: DRESS_CODES.find(d => d.id === selectedDressCode)?.title,
          dietary: dietary
        })
      }).catch(console.error);

      const interval = setInterval(() => {
        setLoadingMsgIdx(prev => {
          if (prev >= loadingMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => setStep('SUCCESS'), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Mobile-only: gently auto-advance after a selection. Skips Q1 'custom' (needs text input).
  useEffect(() => {
    if (!isMobile) return;
    if (step === 'Q1_ACTIVITY' && selectedActivity && selectedActivity !== 'custom') {
      const t = setTimeout(() => setStep('Q2_DATETIME'), 650);
      return () => clearTimeout(t);
    }
    if (step === 'Q2_DATETIME' && selectedDate && selectedTime) {
      const t = setTimeout(() => setStep('Q3_DRESSCODE'), 650);
      return () => clearTimeout(t);
    }
    if (step === 'Q3_DRESSCODE' && selectedDressCode) {
      const t = setTimeout(() => setStep('Q4_NOTES'), 650);
      return () => clearTimeout(t);
    }
  }, [isMobile, step, selectedActivity, selectedDate, selectedTime, selectedDressCode]);

  const handleNoHover = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const top = Math.random() * 70 + 10;
    const left = Math.random() * 70 + 10;
    
    setNoStyle({
      position: 'fixed',
      top: `${top}%`,
      left: `${left}%`,
      transform: 'translate(-50%, -50%)',
      zIndex: 50,
    });
    setNoClicks(prev => prev + 1);
  };

  const renderIntro = () => (
    <motion.div
      key="intro"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
      transition={slowSpring}
      className="flex flex-col items-center justify-center text-center space-y-8 max-w-lg mx-auto p-6 relative"
    >
      <motion.div 
        animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }} 
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute -top-10 -left-10 text-rose-300 opacity-50"
      >
        <Sparkles className="w-12 h-12" />
      </motion.div>
      <motion.div 
        animate={{ y: [10, -10, 10], rotate: [5, -5, 5] }} 
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute -bottom-10 -right-10 text-pink-300 opacity-50"
      >
        <Heart className="w-10 h-10 fill-pink-300" />
      </motion.div>

      <div className="relative">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="bg-white p-5 rounded-full mb-4 shadow-xl shadow-rose-200/50 inline-block relative z-10"
        >
          <Heart className="w-14 h-14 text-rose-500 fill-rose-500" />
        </motion.div>
      </div>

      <div className="space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...bouncySpring }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 font-sans"
        >
          Hey, I think you're pretty cute.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...bouncySpring }}
          className="text-slate-500 text-lg max-w-md mx-auto font-medium"
        >
          {pickupLine}
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, ...bouncySpring }}
        className="flex items-center justify-center gap-6 mt-8 w-full relative"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('Q1_ACTIVITY')}
          className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 transition-colors text-lg"
        >
          Yes, I'd love to!
        </motion.button>
        
        <motion.button
          style={{ ...noStyle, transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
          onMouseEnter={handleNoHover}
          onTouchStart={handleNoHover}
          className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-2xl transition-colors text-lg shadow-sm whitespace-nowrap"
        >
          {noMessages[Math.min(noClicks, noMessages.length - 1)]}
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.1, ...slowSpring }
    },
    exit: { opacity: 0, x: -30, filter: 'blur(5px)', transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: bouncySpring }
  };

  const renderQ1Activity = () => (
    <motion.div
      key="q1"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="w-full max-w-xl mx-auto space-y-8 p-4 md:p-6 pb-28 sm:pb-6"
    >
      <div className="text-center space-y-2 mb-8">
        <span className="inline-block py-1 px-3 bg-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wider uppercase mb-2">Step 1 of 4</span>
        <motion.h2 variants={itemVariants} className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-100" /> What's the vibe?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-500 font-medium">Pick your favorite date activity.</motion.p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
        {ACTIVITIES.map((act, i) => {
          const isSelected = selectedActivity === act.id;
          const hasSelection = selectedActivity !== '';
          // Mobile-only selection emphasis: selected card scales up, others shrink + dim.
          const mobileScale = isMobile
            ? (isSelected ? 1.2 : hasSelection ? 0.9 : 1)
            : 1;
          const mobileOpacity = isMobile && hasSelection && !isSelected ? 0.55 : 1;
          // Selected pops first, others ripple back with a small per-tile delay.
          const animDelay = isMobile && hasSelection && !isSelected ? 0.05 + i * 0.025 : 0;
          const ActIcon = act.Icon;
          return (
            <motion.button
              variants={itemVariants}
              key={act.id}
              animate={{ scale: mobileScale, opacity: mobileOpacity }}
              transition={{ type: 'spring', stiffness: 320, damping: 22, delay: animDelay }}
              whileHover={{ scale: mobileScale * 1.02 }}
              whileTap={{ scale: mobileScale * 0.97 }}
              onClick={() => setSelectedActivity(act.id)}
              style={{ transformOrigin: 'center' }}
              className={`flex flex-col items-start p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-colors text-left group
                ${isSelected
                  ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-100'
                  : 'border-white bg-white/60 backdrop-blur-md hover:border-rose-200 hover:bg-white'}`}
            >
              <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl mb-2 sm:mb-4 transition-colors ${isSelected ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-500'}`}>
                <ActIcon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-sm sm:text-xl font-bold text-slate-800 mb-0.5 sm:mb-1 leading-tight">{act.title}</h4>
              <p className="text-[11px] sm:text-sm text-slate-500 font-medium leading-snug">{act.description}</p>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedActivity === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              value={customActivityText}
              onChange={(e) => setCustomActivityText(e.target.value)}
              placeholder="What did you have in mind?"
              className="w-full bg-white/60 backdrop-blur-md border-2 border-rose-200 rounded-2xl p-4 text-slate-800 placeholder:text-slate-400 font-medium text-lg focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all shadow-inner"
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="flex justify-end pt-4 fixed inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-rose-50 via-rose-50/95 to-transparent z-30 sm:static sm:p-0 sm:bg-none">
        <motion.button
          whileHover={(selectedActivity && (selectedActivity !== 'custom' || customActivityText.trim().length > 0)) ? { scale: 1.05 } : {}}
          whileTap={(selectedActivity && (selectedActivity !== 'custom' || customActivityText.trim().length > 0)) ? { scale: 0.95 } : {}}
          disabled={!(selectedActivity && (selectedActivity !== 'custom' || customActivityText.trim().length > 0))}
          onClick={() => setStep('Q2_DATETIME')}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-2 transition-all w-full sm:w-auto justify-center
            ${(selectedActivity && (selectedActivity !== 'custom' || customActivityText.trim().length > 0)) 
              ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-300' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          Next Step <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderQ2DateTime = () => (
    <motion.div
      key="q2"
      variants={containerVariants}
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      animate="show"
      exit="exit"
      className="w-full max-w-xl mx-auto space-y-8 p-4 md:p-6 pb-28 sm:pb-6"
    >
      <div className="text-center space-y-2 mb-8">
        <span className="inline-block py-1 px-3 bg-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wider uppercase mb-2">Step 2 of 4</span>
        <motion.h2 variants={itemVariants} className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
          <CalendarHeart className="w-8 h-8 text-rose-500 fill-rose-100" /> When are we doing this?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-500 font-medium">Select a day and time that works for you.</motion.p>
      </div>

      <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-white shadow-xl shadow-rose-100/50 space-y-6">
        {/* Horizontal Date Scroller */}
        <div className="space-y-3 relative group">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">Select Day</h3>
          
          <button 
            onClick={() => scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
            className="absolute left-0 top-[45%] z-10 p-1.5 bg-white/90 shadow-md rounded-full text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block -ml-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div ref={scrollContainerRef} className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar items-center" style={{ scrollbarWidth: 'none' }}>
            {availableDates.map((date, i) => {
              const time = date.getTime();
              const isSelected = selectedDate === time;
              const hasSelection = selectedDate !== null;
              const mobileScale = isMobile
                ? (isSelected ? 1.2 : hasSelection ? 0.9 : 1)
                : 1;
              const mobileOpacity = isMobile && hasSelection && !isSelected ? 0.55 : 1;
              const animDelay = isMobile && hasSelection && !isSelected ? 0.05 + i * 0.02 : 0;
              return (
                <motion.button
                  animate={{ scale: mobileScale, opacity: mobileOpacity }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22, delay: animDelay }}
                  whileHover={{ scale: mobileScale * 1.04 }}
                  whileTap={{ scale: mobileScale * 0.96 }}
                  key={time}
                  onClick={() => setSelectedDate(time)}
                  style={{ transformOrigin: 'center' }}
                  className={`flex flex-col items-center min-w-[4rem] sm:min-w-[5.5rem] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-colors snap-start
                    ${isSelected ? 'border-rose-400 bg-rose-50 text-rose-500 shadow-md shadow-rose-100' : 'border-slate-100 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50/50'}`}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className={`text-lg sm:text-2xl font-black ${isSelected ? 'text-rose-600' : 'text-slate-800'}`}>
                    {date.getDate()}
                  </span>
                  <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <button 
            onClick={() => scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            className="absolute right-0 top-[45%] z-10 p-1.5 bg-white/90 shadow-md rounded-full text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block -mr-4"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Time Slots — grouped by daypart so the eye scans faster */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">Select Time</h3>

          {(['daytime', 'evening'] as const).map((group) => {
            const isDay = group === 'daytime';
            const groupSlots = isDay
              ? TIME_SLOTS.filter(s => ['11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'].includes(s))
              : TIME_SLOTS.filter(s => ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'].includes(s));
            const GroupIcon = isDay ? Sunrise : Moon;
            const groupLabel = isDay ? 'Daytime' : 'Evening';
            return (
              <div key={group} className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                  <GroupIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{groupLabel}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 items-center">
                  {groupSlots.map((slot, i) => {
                    const isSelected = selectedTime === slot;
                    const hasSelection = selectedTime !== '';
                    const mobileScale = isMobile
                      ? (isSelected ? 1.2 : hasSelection ? 0.9 : 1)
                      : 1;
                    const mobileOpacity = isMobile && hasSelection && !isSelected ? 0.55 : 1;
                    const animDelay = isMobile && hasSelection && !isSelected ? 0.05 + i * 0.025 : 0;
                    return (
                      <motion.button
                        animate={{ scale: mobileScale, opacity: mobileOpacity }}
                        transition={{ type: 'spring', stiffness: 320, damping: 22, delay: animDelay }}
                        whileHover={{ scale: mobileScale * 1.04 }}
                        whileTap={{ scale: mobileScale * 0.96 }}
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        style={{ transformOrigin: 'center' }}
                        className={`flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 font-bold transition-colors
                          ${isSelected ? 'border-rose-400 bg-rose-400 text-white shadow-md shadow-rose-200' : 'border-slate-100 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-500'}`}
                      >
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-[11px] sm:text-sm whitespace-nowrap">{slot}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between items-center gap-3 pt-4 fixed inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-rose-50 via-rose-50/95 to-transparent z-30 sm:static sm:p-0 sm:bg-none">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('Q1_ACTIVITY')}
          className="px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold text-slate-500 flex items-center gap-2 hover:bg-white/50 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back</span>
        </motion.button>

        <motion.button
          whileHover={(selectedDate && selectedTime) ? { scale: 1.05 } : {}}
          whileTap={(selectedDate && selectedTime) ? { scale: 0.95 } : {}}
          disabled={!(selectedDate && selectedTime)}
          onClick={() => setStep('Q3_DRESSCODE')}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-2 transition-all flex-1 sm:flex-none justify-center
            ${(selectedDate && selectedTime) 
              ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-300' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          Next Step <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderQ3DressCode = () => (
    <motion.div
      key="q3"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="w-full max-w-xl mx-auto space-y-8 p-4 md:p-6 pb-28 sm:pb-6"
    >
      <div className="text-center space-y-2 mb-8">
        <span className="inline-block py-1 px-3 bg-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wider uppercase mb-2">Step 3 of 4</span>
        <motion.h2 variants={itemVariants} className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
          <Shirt className="w-8 h-8 text-rose-500 fill-rose-100" /> What's the dress code?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-500 font-medium">How should we coordinate our outfits?</motion.p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
        {DRESS_CODES.map((act, i) => {
          const isSelected = selectedDressCode === act.id;
          const hasSelection = selectedDressCode !== '';
          const mobileScale = isMobile
            ? (isSelected ? 1.2 : hasSelection ? 0.9 : 1)
            : 1;
          const mobileOpacity = isMobile && hasSelection && !isSelected ? 0.55 : 1;
          const animDelay = isMobile && hasSelection && !isSelected ? 0.05 + i * 0.025 : 0;
          const ActIcon = act.Icon;
          return (
            <motion.button
              variants={itemVariants}
              key={act.id}
              animate={{ scale: mobileScale, opacity: mobileOpacity }}
              transition={{ type: 'spring', stiffness: 320, damping: 22, delay: animDelay }}
              whileHover={{ scale: mobileScale * 1.02 }}
              whileTap={{ scale: mobileScale * 0.97 }}
              onClick={() => setSelectedDressCode(act.id)}
              style={{ transformOrigin: 'center' }}
              className={`flex flex-col items-start p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-colors text-left group
                ${isSelected
                  ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-100'
                  : 'border-white bg-white/60 backdrop-blur-md hover:border-rose-200 hover:bg-white'}`}
            >
              <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl mb-2 sm:mb-4 transition-colors ${isSelected ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-500'}`}>
                <ActIcon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-sm sm:text-xl font-bold text-slate-800 mb-0.5 sm:mb-1 leading-tight">{act.title}</h4>
              <p className="text-[11px] sm:text-sm text-slate-500 font-medium leading-snug">{act.description}</p>
            </motion.button>
          );
        })}
      </div>

      <motion.div variants={itemVariants} className="flex justify-between items-center gap-3 pt-4 fixed inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-rose-50 via-rose-50/95 to-transparent z-30 sm:static sm:p-0 sm:bg-none">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('Q2_DATETIME')}
          className="px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold text-slate-500 flex items-center gap-2 hover:bg-white/50 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back</span>
        </motion.button>

        <motion.button
          whileHover={selectedDressCode ? { scale: 1.05 } : {}}
          whileTap={selectedDressCode ? { scale: 0.95 } : {}}
          disabled={!selectedDressCode}
          onClick={() => setStep('Q4_NOTES')}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-2 transition-all flex-1 sm:flex-none justify-center
            ${selectedDressCode 
              ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-300' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          Next Step <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderQ4Notes = () => (
    <motion.div
      key="q4"
      variants={containerVariants}
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      animate="show"
      exit="exit"
      className="w-full max-w-xl mx-auto space-y-8 p-4 md:p-6 pb-28 sm:pb-6"
    >
      <div className="text-center space-y-2 mb-8">
        <span className="inline-block py-1 px-3 bg-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wider uppercase mb-2">Step 4 of 4</span>
        <motion.h2 variants={itemVariants} className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
          <MessageCircleHeart className="w-8 h-8 text-rose-500 fill-rose-100" /> Any dealbreakers?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-500 font-medium">Food allergies, preferences, or topics to avoid.</motion.p>
      </div>

      <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-xl shadow-rose-100/50">
         <textarea
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            placeholder="Tell me if you hate cilantro, or if you're secretly a dog person..."
            className="w-full h-28 sm:h-40 bg-transparent rounded-2xl p-4 sm:p-6 text-slate-800 placeholder:text-slate-400 font-medium text-base sm:text-lg focus:outline-none resize-none"
          />
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between items-center gap-3 pt-4 fixed inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-rose-50 via-rose-50/95 to-transparent z-30 sm:static sm:p-0 sm:bg-none">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('Q3_DRESSCODE')}
          className="px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold text-slate-500 flex items-center gap-2 hover:bg-white/50 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('LOADING')}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 transition-colors text-base sm:text-lg flex items-center gap-2 flex-1 sm:flex-none justify-center"
        >
          Send Invite ✨
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderLoading = () => (
    <motion.div
      key="loading"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={slowSpring}
      className="flex flex-col items-center justify-center space-y-10 max-w-md mx-auto w-full p-6"
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-rose-200 rounded-full"
          animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 bg-pink-200 rounded-full"
          animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0, 0] }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
        />
        
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="relative bg-white p-6 rounded-full shadow-2xl shadow-rose-200 z-10"
        >
          <Heart className="w-16 h-16 text-rose-500 fill-rose-500" />
        </motion.div>
      </div>
      
      <div className="w-full space-y-6">
        <div className="h-8 overflow-hidden relative text-center">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={loadingMsgIdx}
              initial={{ y: 30, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: -30, opacity: 0, rotateX: 90 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-rose-500 font-bold text-lg absolute w-full"
            >
              {loadingMessages[loadingMsgIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
        
        <div className="w-full bg-white/50 border border-white h-3 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((loadingMsgIdx + 1) / loadingMessages.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
        </div>
      </div>
    </motion.div>
  );

  const getEventDate = () => {
    if (!selectedDate || !selectedTime) return new Date();
    const dateObj = new Date(selectedDate);
    const timeMatch = selectedTime.match(/(\d+):(\d+)\s+(AM|PM)/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const modifier = timeMatch[3];
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      dateObj.setHours(hours, minutes, 0, 0);
    }
    return dateObj;
  };

  const generateCalendarLink = () => {
    const startDate = getEventDate();
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours long

    const pad = (n: number) => n < 10 ? '0' + n : n;
    // Format: YYYYMMDDTHHMMSS (local time, removing the Z so it defaults to user's timezone)
    const fmt = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const title = encodeURIComponent(`Date: ${getActivityTitle()}`);
    const details = encodeURIComponent(`We're going on a date!\n\nActivity: ${getActivityTitle()}\nNotes: ${dietary}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(startDate)}/${fmt(endDate)}&details=${details}`;
  };

  const generateMailtoLink = () => {
    const subject = encodeURIComponent("It's a Date! 🎉");
    const activityName = getActivityTitle();
    const dateStr = selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
    const body = encodeURIComponent(`Hey! I've accepted your date proposal.\n\nHere are the details we locked in:\n- Activity: ${activityName}\n- When: ${dateStr} @ ${selectedTime}\n- Notes: ${dietary || 'None'}\n\nSee you then!`);
    
    // Replace 'your.email@example.com' with the creator's actual email in a real app
    return `mailto:your.email@example.com?subject=${subject}&body=${body}`;
  };

  const renderSuccess = () => {
    const theme = ACTIVITY_THEMES[selectedActivity] ?? DEFAULT_THEME;
    const BadgeIcon = theme.badgeIcon;
    const PlanIcon = theme.planIcon;
    const AmbientIcon = theme.ambientIcon;

    // Floating ambient motifs (e.g., film reels for movie night, coffee cups for coffee).
    const ambientPositions = [
      { top: '8%', left: '6%', size: 'w-10 h-10', delay: 0, rotate: -15 },
      { top: '14%', right: '8%', size: 'w-8 h-8', delay: 0.4, rotate: 20 },
      { bottom: '18%', left: '10%', size: 'w-9 h-9', delay: 0.8, rotate: 12 },
      { bottom: '10%', right: '6%', size: 'w-11 h-11', delay: 1.2, rotate: -10 },
      { top: '46%', left: '4%', size: 'w-7 h-7', delay: 1.6, rotate: 25 },
      { top: '42%', right: '4%', size: 'w-7 h-7', delay: 2.0, rotate: -25 },
    ];

    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={bouncySpring}
        className={`w-full max-w-lg mx-auto p-6 md:p-10 ${theme.cardBg} backdrop-blur-xl border ${theme.cardBorder} rounded-[2.5rem] shadow-2xl ${theme.ring} text-center space-y-8 relative overflow-hidden`}
      >
        {/* Themed ambient glows */}
        <div className={`absolute -top-24 -right-24 w-56 h-56 ${theme.glowA} rounded-full blur-3xl opacity-70 pointer-events-none`} />
        <div className={`absolute -bottom-24 -left-24 w-56 h-56 ${theme.glowB} rounded-full blur-3xl opacity-70 pointer-events-none`} />

        {/* Floating activity motifs */}
        {ambientPositions.map((pos, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 0.18,
              scale: 1,
              y: [0, -10, 0],
              rotate: [pos.rotate, pos.rotate + 8, pos.rotate],
            }}
            transition={{
              opacity: { delay: pos.delay, duration: 0.6 },
              scale: { delay: pos.delay, duration: 0.6 },
              y: { repeat: Infinity, duration: 4 + i * 0.3, ease: 'easeInOut', delay: pos.delay },
              rotate: { repeat: Infinity, duration: 5 + i * 0.4, ease: 'easeInOut', delay: pos.delay },
            }}
            className={`absolute ${theme.accentText} pointer-events-none`}
            style={{
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              right: pos.right,
            }}
          >
            <AmbientIcon className={pos.size} />
          </motion.div>
        ))}

        {/* Hero badge */}
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className={`w-24 h-24 ${theme.accent} text-white rounded-[2rem] rotate-3 flex items-center justify-center mx-auto mb-6 shadow-xl ${theme.ring} relative z-10`}
        >
          <BadgeIcon className="w-12 h-12" />
        </motion.div>

        <div className="space-y-3 relative z-10">
          <h2 className="text-4xl font-extrabold text-slate-800">{theme.headline}</h2>
          <p className="text-slate-600 font-medium text-lg">
            {theme.subhead}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...bouncySpring }}
          className={`${theme.accentSoft} p-6 rounded-3xl text-left space-y-5 border ${theme.accentSoftBorder} relative z-10`}
        >
          <div className="flex items-center gap-4">
            <div className={`bg-white p-3 rounded-xl shadow-sm ${theme.accentText}`}><PlanIcon className="w-6 h-6" /></div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">The Plan</div>
              <div className="text-slate-900 font-bold text-lg">{getActivityTitle()}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`bg-white p-3 rounded-xl shadow-sm ${theme.accentText}`}><CalendarIcon className="w-6 h-6" /></div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">When</div>
              <div className="text-slate-900 font-bold">
                {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} @ {selectedTime}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`bg-white p-3 rounded-xl shadow-sm ${theme.accentText}`}><Shirt className="w-6 h-6" /></div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Dress Code</div>
              <div className="text-slate-900 font-bold">
                {DRESS_CODES.find(d => d.id === selectedDressCode)?.title}
              </div>
            </div>
          </div>
          {dietary && (
            <div className="flex items-start gap-4">
              <div className={`bg-white p-3 rounded-xl shadow-sm ${theme.accentText} mt-1`}><MessageCircleHeart className="w-6 h-6" /></div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Your Notes</div>
                <div className="text-slate-800 font-medium italic line-clamp-3">"{dietary}"</div>
              </div>
            </div>
          )}
        </motion.div>

        {!hasSubmitted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ...bouncySpring }}
            onClick={() => setHasSubmitted(true)}
            className={`w-full py-4 ${theme.accent} ${theme.accentHover} text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xl ${theme.ring} relative z-10`}
          >
            Can't Wait!
            <Heart className="w-5 h-5 fill-white text-white" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 relative z-10"
          >
            <a
              href={generateCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-4 ${theme.accentSoft} ${theme.accentText} font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:brightness-95 transition border-2 ${theme.accentSoftBorder}`}
            >
              <CalendarIcon className="w-5 h-5" /> Add to Google Calendar
            </a>
            <a
              href={generateMailtoLink()}
              className={`w-full py-4 ${theme.accent} ${theme.accentHover} text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xl ${theme.ring}`}
            >
              <Send className="w-5 h-5" /> Send Me The Details
            </a>
            <p className="text-xs font-medium text-slate-500 mt-2 px-4">
              (The email button opens a pre-written message in your mail app!)
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'INTRO' && renderIntro()}
        {step === 'Q1_ACTIVITY' && renderQ1Activity()}
        {step === 'Q2_DATETIME' && renderQ2DateTime()}
        {step === 'Q3_DRESSCODE' && renderQ3DressCode()}
        {step === 'Q4_NOTES' && renderQ4Notes()}
        {step === 'LOADING' && renderLoading()}
        {step === 'SUCCESS' && renderSuccess()}
      </AnimatePresence>
    </div>
  );
}

