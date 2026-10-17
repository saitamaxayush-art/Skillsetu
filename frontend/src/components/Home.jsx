import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { TradeIcon } from './TradeIcons.jsx'
import { DashIcon } from './DashboardIcons.jsx'

const TRADES = [
  { id: 'tailoring', en: 'Stitching & Tailoring', hi: 'सिलाई व बुटीक कार्य', desc_en: 'Garments, alterations, suits & home work', desc_hi: 'ब्लाउज, सूट, अल्टरिंग व घर से काम' },
  { id: 'electrician', en: 'Electrician & Solar', hi: 'इलेक्ट्रीशियन व सोलर', desc_en: 'House wiring, motors, solar & repairs', desc_hi: 'घरेलू वायरिंग, मोटर, सोलर व रिपेयर' },
  { id: 'plumbing', en: 'Plumbing & Piping', hi: 'प्लंबिंग व नल-फिटिंग', desc_en: 'Pipes, leaks, tanks & drip irrigation', desc_hi: 'नल, टंकी लीकेज व ड्रिप सिंचाई' },
  { id: 'carpentry', en: 'Carpentry & Woodwork', hi: 'बढ़ई व लकड़ी का काम', desc_en: 'Furniture, doors, kitchen & woodcraft', desc_hi: 'फर्नीचर, दरवाजे, किचन व लकड़ी काम' },
  { id: 'cooking', en: 'Cooking & Tiffin', hi: 'रसोई व टिफिन सेवा', desc_en: 'Home tiffin, catering & snack kiosks', desc_hi: 'घर से टिफिन, कैटरिंग व नाश्ता स्टॉल' },
  { id: 'beauty', en: 'Beauty & Salon', hi: 'ब्यूटी पार्लर व मेकअप', desc_en: 'Threading, facial, bridal & hair styling', desc_hi: 'थ्रेडिंग, फेशियल, मेहंदी व मेकअप' },
  { id: 'driving', en: 'Driving & Transport', hi: 'ड्राइविंग व ट्रांसपोर्ट', desc_en: 'E-rickshaw, delivery loader, cab & tractor', desc_hi: 'ई-रिक्शा, लोडर, कैब व ट्रैक्टर' },
  { id: 'webdev', en: 'Web Development', hi: 'वेबसाइट व कोडिंग', desc_en: 'HTML, CSS, React & digital freelancing', desc_hi: 'HTML, CSS, रिएक्ट व वेब फ्रीलांसिंग' },
  { id: 'data_entry', en: 'Data Entry & Computer', hi: 'डेटा एंट्री व कंप्यूटर', desc_en: 'Excel, billing, typing & Seva Kendra', desc_hi: 'एक्सेल, बिलिंग, टाइपिंग व सेवा केंद्र' },
  { id: 'mobile_repair', en: 'Mobile & Phone Repair', hi: 'स्मार्टफोन रिपेयरिंग', desc_en: 'Screen replacement, battery & software', desc_hi: 'स्क्रीन, बैटरी, चार्जिंग व सॉफ्टवेयर' },
]

const DEMO_PREVIEWS = {
  tailoring: {
    title_en: 'Tailoring & Boutique Business Path',
    title_hi: 'सिलाई व बुटीक स्वरोजगार मार्ग',
    stage1: {
      name_en: 'Stage 1: Foundation',
      name_hi: 'चरण 1: बुनियादी हुनर व मशीन संभाल',
      time_en: '2 to 4 Weeks',
      time_hi: '2 से 4 हफ्ते',
      income_en: '₹3,000 - ₹5,000 / month',
      income_hi: '₹3,000 - ₹5,000 / महीना',
      action_en: 'Offer free alterations to 5 neighbours this week to announce your service.',
      action_hi: 'इस हफ्ते 5 पड़ोसियों के कपड़ों की निःशुल्क फिटिंग या तुरपाई करें ताकि लोगों को आपके काम का पता चले।',
      scheme_en: 'PM Vishwakarma Scheme (₹15,000 tool voucher + low interest loan)',
      scheme_hi: 'पीएम विश्वकर्मा योजना (₹15,000 टूलकिट वाउचर + 5% ब्याज पर ऋण)',
    },
    stage2: {
      name_en: 'Stage 2: Practice & Custom Cuts',
      name_hi: 'चरण 2: पैटर्न कटिंग और फिटिंग में निपुणता',
      time_en: '4 to 8 Weeks',
      time_hi: '4 से 8 हफ्ते',
      income_en: '₹7,000 - ₹12,000 / month',
      income_hi: '₹7,000 - ₹12,000 / महीना',
    },
    stage3: {
      name_en: 'Stage 3: Earn & Regular Clients',
      name_hi: 'चरण 3: पहले 20 नियमित ग्राहक और थोक काम',
      time_en: '2 to 3 Months',
      time_hi: '2 से 3 महीने',
      income_en: '₹14,000 - ₹22,000 / month',
      income_hi: '₹14,000 - ₹22,000 / महीना',
    },
  },
  electrician: {
    title_en: 'Electrician & Contractor Path',
    title_hi: 'इलेक्ट्रीशियन व ठेकेदार करियर मार्ग',
    stage1: {
      name_en: 'Stage 1: Foundation & Safety',
      name_hi: 'चरण 1: बुनियादी सुरक्षा व घरेलू वायरिंग',
      time_en: '3 to 6 Weeks',
      time_hi: '3 से 6 हफ्ते',
      income_en: '₹4,000 - ₹7,000 / month',
      income_hi: '₹4,000 - ₹7,000 / महीना',
      action_en: 'Inspect and replace damaged switchboards in 3 houses with a senior technician.',
      action_hi: 'सीनियर कारीगर के साथ 3 घरों में पुराने स्विचबोर्ड और अर्थिंग चेक करें।',
      scheme_en: 'PM Surya Ghar Muft Bijli Yojana (Rooftop solar installation training)',
      scheme_hi: 'पीएम सूर्य घर मुफ्त बिजली योजना (सोलर रूफटॉप इंस्टॉलेशन ट्रेनिंग)',
    },
    stage2: {
      name_en: 'Stage 2: Appliance & Inverter Repair',
      name_hi: 'चरण 2: इन्वर्टर, पंखा व मोटर रिपेयर',
      time_en: '2 Months',
      time_hi: '2 महीने',
      income_en: '₹12,000 - ₹18,000 / month',
      income_hi: '₹12,000 - ₹18,000 / महीना',
    },
    stage3: {
      name_en: 'Stage 3: Full Society Wiring Contractor',
      name_hi: 'चरण 3: सोसाइटी वायरिंग ठेकेदार',
      time_en: '6 Months',
      time_hi: '6 महीने',
      income_en: '₹22,000 - ₹35,000 / month',
      income_hi: '₹22,000 - ₹35,000 / महीना',
    },
  },
  webdev: {
    title_en: 'Frontend Developer & Freelance Path',
    title_hi: 'वेब डेवलपर व डिजिटल फ्रीलांसिंग मार्ग',
    stage1: {
      name_en: 'Stage 1: Foundation (HTML & CSS)',
      name_hi: 'चरण 1: बुनियादी वेब भाषा व लेआउट',
      time_en: '4 to 6 Weeks',
      time_hi: '4 से 6 हफ्ते',
      income_en: 'Practice stage (First paid project ₹2,000)',
      income_hi: 'अभ्यास चरण (पहला प्रोजेक्ट ₹2,000)',
      action_en: 'Build a 1-page mobile-friendly website for a local shopkeeper.',
      action_hi: 'स्थानीय किराना या कपड़े की दुकान के लिए 1 पेज की मोबाइल वेबसाइट बनाएं।',
      scheme_en: 'Skill India Digital & SWAYAM Free Computer Certifications',
      scheme_hi: 'स्किल इंडिया डिजिटल व स्वयं निःशुल्क कंप्यूटर प्रमाणन',
    },
    stage2: {
      name_en: 'Stage 2: JavaScript & React Basics',
      name_hi: 'चरण 2: जावास्क्रिप्ट व रिएक्ट बेसिक्स',
      time_en: '2 to 3 Months',
      time_hi: '2 से 3 महीने',
      income_en: '₹15,000 - ₹25,000 / month',
      income_hi: '₹15,000 - ₹25,000 / महीना',
    },
    stage3: {
      name_en: 'Stage 3: Full Junior Developer & Remote Jobs',
      name_hi: 'चरण 3: जूनियर वेब डेवलपर व रिमोट काम',
      time_en: '6 Months',
      time_hi: '6 महीने',
      income_en: '₹30,000 - ₹50,000 / month',
      income_hi: '₹30,000 - ₹50,000 / महीना',
    },
  },
  cooking: {
    title_en: 'Home Tiffin & Food Business Path',
    title_hi: 'घरेलू टिफिन व खानपान स्वरोजगार मार्ग',
    stage1: {
      name_en: 'Stage 1: Standard Recipes & Packaging',
      name_hi: 'चरण 1: शुद्ध स्वाद, नाप व सुरक्षित पैकेजिंग',
      time_en: '2 Weeks',
      time_hi: '2 हफ्ते',
      income_en: '₹5,000 - ₹8,000 / month',
      income_hi: '₹5,000 - ₹8,000 / महीना',
      action_en: 'Prepare 5 sample lunch boxes for office workers in your locality.',
      action_hi: 'अपने नजदीकी 5 ऑफिस कर्मचारियों को चखने के लिए सैंपल टिफिन दें।',
      scheme_en: 'PM FME (PM Formalisation of Micro food processing Enterprises scheme: 35% subsidy)',
      scheme_hi: 'पीएम फॉर्मलाइजेशन ऑफ माइक्रो फूड प्रोसेसिंग एंटरप्राइजेज (35% सरकारी सब्सिडी)',
    },
    stage2: {
      name_en: 'Stage 2: 25 Daily Office Subscriptions',
      name_hi: 'चरण 2: 25 नियमित मासिक टिफिन ग्राहक',
      time_en: '2 Months',
      time_hi: '2 महीने',
      income_en: '₹18,000 - ₹28,000 / month',
      income_hi: '₹18,000 - ₹28,000 / महीना',
    },
    stage3: {
      name_en: 'Stage 3: Commercial Cloud Kitchen & Catering',
      name_hi: 'चरण 3: क्लाउड किचन व छोटे आयोजनों की कैटरिंग',
      time_en: '6 Months',
      time_hi: '6 महीने',
      income_en: '₹35,000 - ₹60,000 / month',
      income_hi: '₹35,000 - ₹60,000 / महीना',
    },
  },
}

export default function Home() {
  const { lang, t, speak, stopSpeaking, isSpeaking } = useLanguage()
  const [selectedDemoSkill, setSelectedDemoSkill] = useState('tailoring')

  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      return Boolean(
        localStorage.getItem('skillsetu-completed') ||
        localStorage.getItem('skillsetu-token') ||
        localStorage.getItem('skillsetu-user')
      )
    } catch {
      return false
    }
  })

  const [userName, setUserName] = useState(() => {
    try {
      const u = localStorage.getItem('skillsetu-user')
      if (u) return JSON.parse(u).name
      const ob = localStorage.getItem('skillsetu-onboarding')
      if (ob) return JSON.parse(ob).user?.name
    } catch (_) {}
    return ''
  })

  useEffect(() => {
    const checkAuth = () => {
      try {
        const u = localStorage.getItem('skillsetu-user')
        const token = localStorage.getItem('skillsetu-token')
        const completed = localStorage.getItem('skillsetu-completed')
        if (u || token || completed) {
          setIsOnboarded(true)
          if (u) setUserName(JSON.parse(u).name || '')
        } else {
          setIsOnboarded(false)
          setUserName('')
        }
      } catch (_) {}
    }
    checkAuth()
    window.addEventListener('storage', checkAuth)
    window.addEventListener('auth-change', checkAuth)
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('auth-change', checkAuth)
    }
  }, [])

  const activeDemo = DEMO_PREVIEWS[selectedDemoSkill] || DEMO_PREVIEWS.tailoring

  const handleListenHero = () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }
    const text =
      lang === 'hi'
        ? 'स्किलसेतु मुख्य पृष्ठ: ग्रामीण और निम्न-आय कारीगरों के लिए हुनर, स्थान और यात्रा सीमा के आधार पर रोजगार, अप्रेंटिसशिप और कोर्स लर्निंग का मंच। चाहे आप सिलाई करते हों, बिजली का काम, बढ़ई, प्लंबिंग, ड्राइविंग, खाना बनाना या कोडिंग सीखना चाहते हों, स्किलसेतु आपके वास्तविक कौशल को बिना किसी रिजेक्शन के सीधे नजदीकी काम और निःशुल्क ट्रेनिंग से जोड़ता है।'
        : 'Welcome to SkillSetu. Opportunity and skill matching for manual trades and technical work considering your skills, location, and travel limits. Get matched to jobs, apprenticeships, and zero-cost training with zero resume required.'
    speak(text)
  }

  return (
    <main id="main" className="home-page-v2">
      {/* 1. HERO SECTION */}
      <section className="hero-clean-section reveal-on-scroll">
        <div className="w hero-clean-grid">
          <div className="hero-clean-content">
            <h1 className="hero-clean-h1">
              {lang === 'hi'
                ? 'हुनर, स्थान और सुविधा के अनुसार सही काम और सीख'
                : 'Opportunity and skill matching for manual trades and technical work'}
            </h1>

            <p className="hero-clean-sub">
              {lang === 'hi'
                ? 'ग्रामीण और निम्न-आय समुदायों के हुनरमंद लोगों को उनके गांव-कस्बे, यात्रा सीमा और वास्तविक कौशल के आधार पर रोजगार, अप्रेंटिसशिप और कोर्स लर्निंग से जोड़ने का विश्वसनीय माध्यम।'
                : 'Connecting individuals from rural and low-income communities with jobs, apprenticeships, and course learning considering their location, travel mode, and real skills.'}
            </p>

            <div className="hero-clean-actions">
              {isOnboarded ? (
                <>
                  <Link to="/dashboard" className="action-btn-primary">
                    {lang === 'hi'
                      ? `${userName ? userName + ' का ' : ''}डैशबोर्ड खोलें →`
                      : `Go to Dashboard ${userName ? `(${userName})` : ''} →`}
                  </Link>
                  <Link to="/opportunities" className="action-btn-secondary">
                    {lang === 'hi' ? 'अवसर देखें' : 'View Opportunities'}
                  </Link>
                </>
              ) : (
                <Link to="/onboarding" className="action-btn-primary hero-compulsory-start">
                  {lang === 'hi' ? 'शुरू करें (Start Now) →' : 'Start Now →'}
                </Link>
              )}

              <button
                type="button"
                className={`listen-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleListenHero}
                aria-label={lang === 'hi' ? 'सुनकर समझें' : 'Listen to overview'}
              >
                <DashIcon name={isSpeaking ? 'stop' : 'speaker'} size={18} />
                <span>
                  {isSpeaking
                    ? (lang === 'hi' ? 'रोकें' : 'Stop')
                    : (lang === 'hi' ? 'सुनकर समझें' : 'Listen')}
                </span>
              </button>
            </div>
          </div>

          {/* Visual Showcase (Empowering Indian Trades & Bridge to Opportunities) */}
          <div className="hero-illustration-box hero-image-showcase container-interactive-card">
            <div className="hero-image-wrapper">
              <img
                src="/assets/hero_skillsetu.jpg"
                alt="SkillSetu artisan craftswoman and technician connected to livelihood opportunities"
                className="hero-showcase-img"
                loading="eager"
              />
              <div className="hero-image-overlay-badge top-right">
                <span className="badge-glow-dot" />
                <span>{lang === 'hi' ? 'सत्यापित हुनर • नजदीकी काम' : 'Verified Skills • Local Jobs'}</span>
              </div>
              <div className="hero-image-overlay-badge bottom-left">
                <DashIcon name="briefcase" size={14} className="inline-dash-icon" />
                <span>{lang === 'hi' ? 'बिना बायोडाटा सीधा संपर्क' : 'Zero Resume Required'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW / BEGINNER GUIDE CALLOUT */}
      <section className="w">
        <div className="home-overview-callout-banner reveal-on-scroll container-interactive-card">
          <div className="overview-callout-content">
            <span className="overview-callout-tag">
              {lang === 'hi' ? 'शुरुआती मार्गदर्शिका' : 'Beginner Guide'}
            </span>
            <h3>
              {lang === 'hi'
                ? 'स्किलसेतु का उपयोग कैसे करें? सचित्र चरणबद्ध गाइड देखें'
                : 'How to use SkillSetu? Explore our step-by-step methodology guide with screenshots'}
            </h3>
            <p>
              {lang === 'hi'
                ? 'हुनर चुनने से लेकर, नजदीकी काम खोजने, पूरक कौशल और 5-चरणीय करियर रोडमैप तक सब कुछ आसान भाषा में।'
                : 'Step-by-step instructions from trade assessment to commute limits, dashboard metrics, and WhatsApp direct hire.'}
            </p>
          </div>
          <Link to="/overview" className="action-btn-primary overview-callout-btn">
            {lang === 'hi' ? 'मार्गदर्शिका खोलें →' : 'Read Overview Guide →'}
          </Link>
        </div>
      </section>

      {/* 2. HOW IT WORKS (4 STEPS) */}
      <section className="how-clean-section reveal-on-scroll">
        <div className="w">
          <div className="clean-section-header">
            <h2 className="clean-h2">{lang === 'hi' ? 'यह कैसे काम करता है' : 'How It Works in 4 Steps'}</h2>
            <p className="clean-lead">
              {lang === 'hi'
                ? 'बिना किसी अंग्रेजी बायोडाटा के, 4 आसान चरणों में अपने हुनर को सही काम से जोड़ें।'
                : 'No resume required. Four practical steps to connect your abilities to real work.'}
            </p>
          </div>

          <div className="how-clean-grid">
            <div className="how-clean-card reveal-on-scroll container-interactive-card reveal-delay-1">
              <span className="clean-step-num">1</span>
              <h3 className="clean-step-title">
                {lang === 'hi' ? 'अपने हुनर बताएं' : 'Tell us your skills'}
              </h3>
              <p className="clean-step-desc">
                {lang === 'hi'
                  ? 'सिलाई, बिजली, बढ़ई, खाना बनाना, ड्राइविंग या कोडिंग - अपना काम चुनें या बोलकर दर्ज करें।'
                  : 'Stitching, electrical, carpentry, cooking, driving or coding - select your trade or speak.'}
              </p>
            </div>

            <div className="how-clean-card reveal-on-scroll container-interactive-card reveal-delay-2">
              <span className="clean-step-num">2</span>
              <h3 className="clean-step-title">
                {lang === 'hi' ? 'कुछ आसान सवालों के जवाब दें' : 'Answer a few simple questions'}
              </h3>
              <p className="clean-step-desc">
                {lang === 'hi'
                  ? '5 व्यावहारिक सवाल आपके काम के स्तर को समझने के लिए पूछे जाते हैं। कोई फेल नहीं होता।'
                  : 'Five practical scenario questions place your current level with zero rejection.'}
              </p>
            </div>

            <div className="how-clean-card reveal-on-scroll container-interactive-card reveal-delay-3">
              <span className="clean-step-num">3</span>
              <h3 className="clean-step-title">
                {lang === 'hi' ? 'अपने नजदीकी काम से जुड़ें' : 'Get matched near you'}
              </h3>
              <p className="clean-step-desc">
                {lang === 'hi'
                  ? 'आपके गांव या कस्बे की दूरी, बस किराया और घर से काम की सुविधा देखकर सीधे संपर्क करें।'
                  : 'Filtered by your commute limits, travel cost, and work-from-home preference.'}
              </p>
            </div>

            <div className="how-clean-card reveal-on-scroll container-interactive-card reveal-delay-4">
              <span className="clean-step-num">4</span>
              <h3 className="clean-step-title">
                {lang === 'hi' ? 'सीखें और कमाई बढ़ाएं' : 'Learn and grow'}
              </h3>
              <p className="clean-step-desc">
                {lang === 'hi'
                  ? 'सरकारी केंद्र, यूट्यूब और आईटीआई के कोर्स से नए गुर सीखकर आय बढ़ाएं।'
                  : 'Step-by-step roadmap with course learning and government scheme support.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHO IT IS FOR (CLEAN ICON CARDS, NO EMOJI) */}
      <section className="who-clean-section w reveal-on-scroll">
        <div className="clean-section-header">
          <h2 className="clean-h2">{lang === 'hi' ? 'यह मंच किसके लिए है' : 'Who It Is For'}</h2>
          <p className="clean-lead">
            {lang === 'hi'
              ? 'हाथ के हुनरमंद कारीगरों से लेकर डिजिटल कंप्यूटर ऑपरेटर और वेब कोडर तक।'
              : 'From traditional craftspersons and home workers to digital coders and operators.'}
          </p>
        </div>

        <div className="who-clean-grid">
          {TRADES.map((t) => (
            <Link
              key={t.id}
              to={`/dashboard?tab=opportunities&skill=${t.id}`}
              className="who-clean-card reveal-on-scroll container-interactive-card"
            >
              <div className="who-icon-wrapper">
                <TradeIcon id={t.id} size={28} />
              </div>
              <h3 className="who-trade-title">{lang === 'hi' ? t.hi : t.en}</h3>
              <p className="who-trade-sub">{lang === 'hi' ? t.desc_hi : t.desc_en}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURE HIGHLIGHTS */}
      <section className="features-clean-section reveal-on-scroll">
        <div className="w">
          <div className="clean-section-header">
            <h2 className="clean-h2">{lang === 'hi' ? 'मंच की मुख्य विशेषताएं' : 'Platform Highlights'}</h2>
            <p className="clean-lead">
              {lang === 'hi'
                ? 'जरूरतमंद लोगों की वास्तविक परिस्थितियों को ध्यान में रखकर तैयार की गई तकनीक।'
                : 'Designed for accessibility, low internet, and honest livelihood growth.'}
            </p>
          </div>

          <div className="features-clean-grid">
            <div className="feature-clean-box reveal-on-scroll container-interactive-card">
              <div className="feature-icon-bar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path d="m5 8 6 6" />
                  <path d="m4 14 6-6 2-3" />
                  <path d="M2 5h12" />
                  <path d="M7 2h1" />
                  <path d="m22 22-5-10-5 10" />
                  <path d="M14 18h6" />
                </svg>
              </div>
              <h3>{lang === 'hi' ? 'हिन्दी और अंग्रेजी दोनों में' : 'Works in Hindi & English'}</h3>
              <p>
                {lang === 'hi'
                  ? 'हर सवाल, नौकरी और करियर कदम दोनों भाषाओं में उपलब्ध है। एक क्लिक में भाषा बदलें।'
                  : 'Every recommendation, question, and career step is fully bilingual.'}
              </p>
            </div>

            <div className="feature-clean-box reveal-on-scroll container-interactive-card">
              <div className="feature-icon-bar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
              <h3>{lang === 'hi' ? 'कम इंटरनेट पर भी तेज़' : 'Works on Low Internet'}</h3>
              <p>
                {lang === 'hi'
                  ? 'हल्का ढांचा जो 2G या 3G नेटवर्क पर भी बिना रुकावट तुरंत खुलता है।'
                  : 'Lightweight architecture optimized for 2G/3G speeds and offline caching.'}
              </p>
            </div>

            <div className="feature-clean-box reveal-on-scroll container-interactive-card">
              <div className="feature-icon-bar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3>{lang === 'hi' ? 'नजदीकी रोजगार व ठेके' : 'Nearby Opportunities'}</h3>
              <p>
                {lang === 'hi'
                  ? 'दूरी, बस समय और यात्रा खर्च के साथ सीधे नियोक्ता या बचत गट से जुड़ें।'
                  : 'Filter by travel time, bus fare, and direct WhatsApp contact.'}
              </p>
            </div>

            <div className="feature-clean-box reveal-on-scroll container-interactive-card">
              <div className="feature-icon-bar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
              </div>
              <h3>{lang === 'hi' ? 'निःशुल्क ट्रेनिंग पहले' : 'Free-First Learning'}</h3>
              <p>
                {lang === 'hi'
                  ? 'सरकारी आईटीआई, पीएमकेवीवाई और यूट्यूब के 100% मुफ्त कोर्स सबसे ऊपर दिखाए जाते हैं।'
                  : 'Sorted strictly lowest cost to highest. Zero-cost resources always appear first.'}
              </p>
            </div>

            <div className="feature-clean-box reveal-on-scroll container-interactive-card">
              <div className="feature-icon-bar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3>{lang === 'hi' ? 'कदम-दर-कदम करियर मार्ग' : 'Step-by-Step Career Path'}</h3>
              <p>
                {lang === 'hi'
                  ? 'बुनियादी हुनर से लेकर मास्टर कारीगर या अपनी दुकान शुरू करने का पूरा 5-चरणीय रोडमैप।'
                  : '5-stage interactive vertical timeline with income targets and weekly tasks.'}
              </p>
            </div>

            <div className="feature-clean-box reveal-on-scroll container-interactive-card">
              <div className="feature-icon-bar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </div>
              <h3>{lang === 'hi' ? 'बोलकर बताएं और सुनकर समझें' : 'Voice & Speech Support'}</h3>
              <p>
                {lang === 'hi'
                  ? 'कम पढ़े-लिखे उपयोगकर्ता स्क्रीन पर लिखे शब्दों को सुनकर समझ सकते हैं।'
                  : 'Text-to-speech narration and voice input for low-literacy participants.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LIVE MINI DEMO (PICK A SKILL AND SEE CAREER PATH PREVIEW) */}
      <section className="demo-clean-section w reveal-on-scroll">
        <div className="clean-section-header">
          <h2 className="clean-h2">{lang === 'hi' ? 'लाइव डेमो: करियर मार्ग देखें' : 'Live Demo: Preview Career Path'}</h2>
          <p className="clean-lead">
            {lang === 'hi'
              ? 'नीचे दिए गए हुनर पर क्लिक करके देखें कि कैसे कोई भी व्यक्ति बुनियादी काम से मास्टर बन सकता है।'
              : 'Select a skill below to see the deterministic 5-stage roadmap.'}
          </p>
        </div>

        {/* Trade Selector Tabs */}
        <div className="demo-tabs-row" role="tablist">
          {Object.keys(DEMO_PREVIEWS).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={selectedDemoSkill === k}
              className={`demo-tab-btn ${selectedDemoSkill === k ? 'active' : ''}`}
              onClick={() => setSelectedDemoSkill(k)}
            >
              <TradeIcon id={k} size={18} />
              <span>{lang === 'hi' ? TRADES.find((t) => t.id === k)?.hi : TRADES.find((t) => t.id === k)?.en}</span>
            </button>
          ))}
        </div>

        {/* Roadmap Preview Display */}
        <div className="demo-preview-card container-interactive-card">
          <div className="demo-preview-header">
            <h3>{lang === 'hi' ? activeDemo.title_hi : activeDemo.title_en}</h3>
            <Link to={isOnboarded ? "/career" : "/onboarding"} className="demo-link-btn">
              {isOnboarded
                ? (lang === 'hi' ? 'मेरा करियर रोडमैप देखें →' : 'View My Career Roadmap →')
                : (lang === 'hi' ? 'अपना व्यक्तिगत रोडमैप बनाएं →' : 'Create My Custom Roadmap →')}
            </Link>
          </div>

          <div className="demo-stages-timeline">
            {/* Stage 1 */}
            <div className="demo-stage-item active-stage-demo">
              <div className="demo-stage-badge">1</div>
              <div className="demo-stage-body">
                <h4>{lang === 'hi' ? activeDemo.stage1.name_hi : activeDemo.stage1.name_en}</h4>
                <div className="demo-stage-meta">
                  <span>{lang === 'hi' ? activeDemo.stage1.time_hi : activeDemo.stage1.time_en}</span>
                  <span className="demo-income-tag">{lang === 'hi' ? activeDemo.stage1.income_hi : activeDemo.stage1.income_en}</span>
                </div>
                <div className="demo-action-callout">
                  <strong>{lang === 'hi' ? 'इस हफ्ते का मुफ्त कदम: ' : 'Free Action for this week: '}</strong>
                  {lang === 'hi' ? activeDemo.stage1.action_hi : activeDemo.stage1.action_en}
                </div>
                {activeDemo.stage1.scheme_hi && (
                  <div className="demo-scheme-callout">
                    {lang === 'hi' ? activeDemo.stage1.scheme_hi : activeDemo.stage1.scheme_en}
                  </div>
                )}
              </div>
            </div>

            {/* Stage 2 */}
            <div className="demo-stage-item">
              <div className="demo-stage-badge">2</div>
              <div className="demo-stage-body">
                <h4>{lang === 'hi' ? activeDemo.stage2.name_hi : activeDemo.stage2.name_en}</h4>
                <div className="demo-stage-meta">
                  <span>{lang === 'hi' ? activeDemo.stage2.time_hi : activeDemo.stage2.time_en}</span>
                  <span className="demo-income-tag">{lang === 'hi' ? activeDemo.stage2.income_hi : activeDemo.stage2.income_en}</span>
                </div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="demo-stage-item">
              <div className="demo-stage-badge">3</div>
              <div className="demo-stage-body">
                <h4>{lang === 'hi' ? activeDemo.stage3.name_hi : activeDemo.stage3.name_en}</h4>
                <div className="demo-stage-meta">
                  <span>{lang === 'hi' ? activeDemo.stage3.time_hi : activeDemo.stage3.time_en}</span>
                  <span className="demo-income-tag">{lang === 'hi' ? activeDemo.stage3.income_hi : activeDemo.stage3.income_en}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
