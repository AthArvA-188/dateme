import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Coffee, Gamepad2, UtensilsCrossed, CheckCircle2, Heart, Sparkles, Send, PartyPopper, CalendarHeart, MessageCircleHeart, Map, ArrowRight, ArrowLeft, Shirt, ChevronLeft, ChevronRight, Film, Brush, PencilLine } from 'lucide-react';

type Step = 'INTRO' | 'Q1_ACTIVITY' | 'Q2_DATETIME' | 'Q3_DRESSCODE' | 'Q4_NOTES' | 'LOADING' | 'SUCCESS';

interface Activity {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const ACTIVITIES: Activity[] = [
  { id: 'coffee', title: 'Coffee & Walk', icon: <Coffee className="w-6 h-6" />, description: 'Low pressure, high vibes.' },
  { id: 'tacos', title: 'Tacos & Margs', icon: <UtensilsCrossed className="w-6 h-6" />, description: 'The fastest way to my heart.' },
  { id: 'arcade', title: 'Arcade Bar', icon: <Gamepad2 className="w-6 h-6" />, description: 'A little friendly competition.' },
  { id: 'movie', title: 'Movie Night', icon: <Film className="w-6 h-6" />, description: 'Popcorn, dim lights, and arguing over what to watch.' },
  { id: 'museum', title: 'Museum / Art', icon: <Brush className="w-6 h-6" />, description: 'Pretending we understand modern art.' },
  { id: 'custom', title: 'Your Idea!', icon: <PencilLine className="w-6 h-6" />, description: 'Got a better plan? Let me hear it.' },
];

const TIME_SLOTS = [
  '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
];

const DRESS_CODES = [
  { id: 'casual', title: 'Comfy & Casual', icon: <Shirt className="w-6 h-6" />, description: 'Sweatpants welcome. No judgment here.' },
  { id: 'smart', title: 'Smart Casual', icon: <Shirt className="w-6 h-6" />, description: 'Looking good but not trying too hard.' },
  { id: 'fancy', title: 'Fancy', icon: <Shirt className="w-6 h-6" />, description: 'Dress to impress. Let\'s go all out.' },
  { id: 'surprise', title: 'Surprise Me', icon: <Shirt className="w-6 h-6" />, description: 'I\'ll match whatever energy you bring.' },
];

const bouncySpring = { type: 'spring', stiffness: 400, damping: 25 };
const slowSpring = { type: 'spring', stiffness: 200, damping: 20 };

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
    const base = [
      "Consulting my dog for outfit advice...",
      "Practicing my best jokes...",
      "Almost ready..."
    ];
    let first = "Checking local spots...";
    if (selectedActivity === 'tacos') first = "Checking local taco spots...";
    if (selectedActivity === 'coffee') first = "Locating the best coffee beans...";
    if (selectedActivity === 'arcade') first = "Stockpiling digital tokens...";
    if (selectedActivity === 'movie') first = "Checking showtimes...";
    if (selectedActivity === 'museum') first = "Reading up on modern art...";
    if (selectedActivity === 'surprise') first = "Formulating a master plan...";
    if (selectedActivity === 'custom') first = "Reviewing your brilliant idea...";
    return [first, ...base];
  };

  const loadingMessages = getLoadingMessages();

  // Success State
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // No Button State
  const [noStyle, setNoStyle] = useState<React.CSSProperties>({});
  const [noClicks, setNoClicks] = useState(0);

  // Generate next 14 days
  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

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
      className="w-full max-w-xl mx-auto space-y-8 p-4 md:p-6"
    >
      <div className="text-center space-y-2 mb-8">
        <span className="inline-block py-1 px-3 bg-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wider uppercase mb-2">Step 1 of 3</span>
        <motion.h2 variants={itemVariants} className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-100" /> What's the vibe?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-500 font-medium">Pick your favorite date activity.</motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACTIVITIES.map(act => (
          <motion.button
            variants={itemVariants}
            key={act.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedActivity(act.id)}
            className={`flex flex-col items-start p-5 rounded-3xl border-2 transition-all text-left group
              ${selectedActivity === act.id 
                ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-100' 
                : 'border-white bg-white/60 backdrop-blur-md hover:border-rose-200 hover:bg-white'}`}
          >
            <div className={`p-3 rounded-2xl mb-4 transition-colors ${selectedActivity === act.id ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-500'}`}>
              {act.icon}
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-1">{act.title}</h4>
            <p className="text-sm text-slate-500 font-medium">{act.description}</p>
          </motion.button>
        ))}
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

      <motion.div variants={itemVariants} className="flex justify-end pt-4">
        <motion.button
          whileHover={(selectedActivity && (selectedActivity !== 'custom' || customActivityText.trim().length > 0)) ? { scale: 1.05 } : {}}
          whileTap={(selectedActivity && (selectedActivity !== 'custom' || customActivityText.trim().length > 0)) ? { scale: 0.95 } : {}}
          disabled={!(selectedActivity && (selectedActivity !== 'custom' || customActivityText.trim().length > 0))}
          onClick={() => setStep('Q2_DATETIME')}
          className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all
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
      className="w-full max-w-xl mx-auto space-y-8 p-4 md:p-6"
    >
      <div className="text-center space-y-2 mb-8">
        <span className="inline-block py-1 px-3 bg-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wider uppercase mb-2">Step 2 of 3</span>
        <motion.h2 variants={itemVariants} className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
          <CalendarHeart className="w-8 h-8 text-rose-500 fill-rose-100" /> When are we doing this?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-500 font-medium">Select a day and time that works for you.</motion.p>
      </div>

      <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl shadow-rose-100/50 space-y-6">
        {/* Horizontal Date Scroller */}
        <div className="space-y-3 relative group">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">Select Day</h3>
          
          <button 
            onClick={() => scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
            className="absolute left-0 top-[45%] z-10 p-1.5 bg-white/90 shadow-md rounded-full text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block -ml-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {availableDates.map((date) => {
              const time = date.getTime();
              const isSelected = selectedDate === time;
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={time}
                  onClick={() => setSelectedDate(time)}
                  className={`flex flex-col items-center min-w-[5.5rem] p-4 rounded-2xl border-2 transition-all snap-start
                    ${isSelected ? 'border-rose-400 bg-rose-50 text-rose-500 shadow-md shadow-rose-100' : 'border-slate-100 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50/50'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider mb-1">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className={`text-2xl font-black ${isSelected ? 'text-rose-600' : 'text-slate-800'}`}>
                    {date.getDate()}
                  </span>
                  <span className="text-xs mt-1 font-medium">
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

        {/* Time Slots */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">Select Time</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TIME_SLOTS.map(slot => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 font-bold transition-all
                  ${selectedTime === slot ? 'border-rose-400 bg-rose-400 text-white shadow-md shadow-rose-200' : 'border-slate-100 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-500'}`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm">{slot}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('Q1_ACTIVITY')}
          className="px-6 py-4 rounded-2xl font-bold text-slate-500 flex items-center gap-2 hover:bg-white/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </motion.button>

        <motion.button
          whileHover={(selectedDate && selectedTime) ? { scale: 1.05 } : {}}
          whileTap={(selectedDate && selectedTime) ? { scale: 0.95 } : {}}
          disabled={!(selectedDate && selectedTime)}
          onClick={() => setStep('Q3_DRESSCODE')}
          className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all
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
      className="w-full max-w-xl mx-auto space-y-8 p-4 md:p-6"
    >
      <div className="text-center space-y-2 mb-8">
        <span className="inline-block py-1 px-3 bg-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wider uppercase mb-2">Step 3 of 4</span>
        <motion.h2 variants={itemVariants} className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
          <Shirt className="w-8 h-8 text-rose-500 fill-rose-100" /> What's the dress code?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-500 font-medium">How should we coordinate our outfits?</motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DRESS_CODES.map(act => (
          <motion.button
            variants={itemVariants}
            key={act.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedDressCode(act.id)}
            className={`flex flex-col items-start p-5 rounded-3xl border-2 transition-all text-left group
              ${selectedDressCode === act.id 
                ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-100' 
                : 'border-white bg-white/60 backdrop-blur-md hover:border-rose-200 hover:bg-white'}`}
          >
            <div className={`p-3 rounded-2xl mb-4 transition-colors ${selectedDressCode === act.id ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-500'}`}>
              {act.icon}
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-1">{act.title}</h4>
            <p className="text-sm text-slate-500 font-medium">{act.description}</p>
          </motion.button>
        ))}
      </div>

      <motion.div variants={itemVariants} className="flex justify-between pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('Q2_DATETIME')}
          className="px-6 py-4 rounded-2xl font-bold text-slate-500 flex items-center gap-2 hover:bg-white/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </motion.button>

        <motion.button
          whileHover={selectedDressCode ? { scale: 1.05 } : {}}
          whileTap={selectedDressCode ? { scale: 0.95 } : {}}
          disabled={!selectedDressCode}
          onClick={() => setStep('Q4_NOTES')}
          className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all
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
      className="w-full max-w-xl mx-auto space-y-8 p-4 md:p-6"
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
            className="w-full h-40 bg-transparent rounded-2xl p-6 text-slate-800 placeholder:text-slate-400 font-medium text-lg focus:outline-none resize-none"
          />
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('Q3_DRESSCODE')}
          className="px-6 py-4 rounded-2xl font-bold text-slate-500 flex items-center gap-2 hover:bg-white/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('LOADING')}
          className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 transition-colors text-lg flex items-center gap-2"
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

  const renderSuccess = () => (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={bouncySpring}
      className="w-full max-w-lg mx-auto p-6 md:p-10 bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-rose-200/50 text-center space-y-8 relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-100 rounded-full blur-2xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-rose-100 rounded-full blur-2xl" />

      <motion.div 
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-24 h-24 bg-gradient-to-tr from-rose-400 to-pink-500 text-white rounded-[2rem] rotate-3 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-300/50 relative z-10"
      >
        <PartyPopper className="w-12 h-12" />
      </motion.div>
      
      <div className="space-y-3 relative z-10">
        <h2 className="text-4xl font-extrabold text-slate-800">It's a Date! 🎉</h2>
        <p className="text-slate-500 font-medium text-lg">
          I've locked it in. I'll reach out to confirm the details. I'm looking forward to it!
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...bouncySpring }}
        className="bg-slate-50/80 p-6 rounded-3xl text-left space-y-5 border border-slate-100 relative z-10"
      >
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-sm text-rose-500"><Coffee className="w-6 h-6" /></div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">The Plan</div>
            <div className="text-slate-800 font-bold text-lg">{getActivityTitle()}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-sm text-rose-500"><CalendarIcon className="w-6 h-6" /></div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">When</div>
            <div className="text-slate-800 font-bold">
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} @ {selectedTime}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-sm text-rose-500"><Shirt className="w-6 h-6" /></div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Dress Code</div>
            <div className="text-slate-800 font-bold">
              {DRESS_CODES.find(d => d.id === selectedDressCode)?.title}
            </div>
          </div>
        </div>
        {dietary && (
          <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-xl shadow-sm text-rose-500 mt-1"><MessageCircleHeart className="w-6 h-6" /></div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Your Notes</div>
              <div className="text-slate-700 font-medium italic line-clamp-3">"{dietary}"</div>
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
          className="w-full py-4 bg-slate-800 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-xl shadow-slate-200 relative z-10"
        >
          Can't Wait!
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
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
            className="w-full py-4 bg-rose-50 text-rose-600 font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors border-2 border-rose-200"
          >
            <CalendarIcon className="w-5 h-5" /> Add to Google Calendar
          </a>
          <a
            href={generateMailtoLink()}
            className="w-full py-4 bg-rose-500 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors shadow-xl shadow-rose-200"
          >
            <Send className="w-5 h-5" /> Send Me The Details
          </a>
          <p className="text-xs font-medium text-slate-400 mt-2 px-4">
            (The email button opens a pre-written message in your mail app!)
          </p>
        </motion.div>
      )}
    </motion.div>
  );

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

