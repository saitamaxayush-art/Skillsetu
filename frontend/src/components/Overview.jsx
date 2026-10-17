import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { DashIcon } from './DashboardIcons.jsx'
import { TradeIcon } from './TradeIcons.jsx'

export default function Overview() {
  const { lang, t, speak, isSpeaking, stopSpeaking } = useLanguage()
  const [activeStepTab, setActiveStepTab] = useState(1)

  const steps = [
    {
      step: 1,
      badge: lang === 'hi' ? 'चरण 1 • हुनर चयन' : 'Step 1 • Trade Assessment',
      title_en: '1. Start Free & Voice-Assisted Trade Assessment',
      title_hi: '1. ' + (lang === 'hi' ? 'शुरू करें और बोलकर हुनर का मूल्यांकन दें' : 'Start Free & Voice-Assisted Trade Assessment'),
      summary_en:
        'New candidates begin by clicking "Start Now". Pick your craft from 10 verified trades (Tailoring, Electrician, Plumbing, Cooking, Data Entry, Mobile Repair, etc.). Answer 5 practical scenario questions with real-time audio voice assistance in Hindi or English.',
      summary_hi:
        'नए उम्मीदवार "Start Now / शुरू करें" बटन दबाकर शुरुआत करते हैं। 10 प्रमुख हुनर (सिलाई, इलेक्ट्रीशियन, प्लंबिंग, कुकिंग, डेटा एंट्री, मोबाइल रिपेयर आदि) में से अपना काम चुनें और बिना किसी डिग्री के 5 व्यावहारिक कार्य प्रश्नों के उत्तर दें।',
      methodology: [
        {
          label_en: 'Select Primary Craft:',
          label_hi: 'अपना मुख्य हुनर चुनें:',
          text_en: 'Tap on your trade card. No formal schooling or diplomas required.',
          text_hi: 'अपने काम का कार्ड चुनें। किसी स्कूल सर्टिफिकेट या डिग्री की आवश्यकता नहीं है।',
        },
        {
          label_en: 'Listen to Questions:',
          label_hi: 'प्रश्न बोलकर सुनें:',
          text_en: 'Click the speaker button at any step to hear the question read aloud in clear spoken Hindi or English.',
          text_hi: 'स्पष्ट हिंदी में प्रश्न सुनने के लिए स्पीकर बटन दबाएं।',
        },
        {
          label_en: 'Instant Skill Level:',
          label_hi: 'तत्काल कौशल स्कोर:',
          text_en: 'Get placed immediately at Beginner, Intermediate, or Skilled level based on practical job logic.',
          text_hi: 'व्यावहारिक ज्ञान के आधार पर तुरंत बिगिनर, इंटरमीडिएट या स्किल्ड स्तर प्राप्त करें।',
        },
      ],
      proTip_en:
        'Pro Tip: You do not need written english or diplomas. Practical know-how is what unlocks high contractor scores!',
      proTip_hi:
        'विशेष सुझाव: लिखित अंग्रेजी या प्रमाण पत्र की आवश्यकता नहीं है; आपकी व्यावहारिक समझ ही आपको शीर्ष स्तर दिलाती है!',
      image: '/assets/overview/step1_assessment.jpg',
      imageAlt: 'SkillSetu Trade Assessment and Voice Assisted Quiz UI',
      actionText_en: 'Start Assessment Now',
      actionText_hi: 'अभी हुनर टेस्ट दें',
      actionLink: '/onboarding',
    },
    {
      step: 2,
      badge: lang === 'hi' ? 'चरण 2 • यात्रा सीमा' : 'Step 2 • Commute Limits',
      title_en: '2. Set Location & Real Physical Commute Limits',
      title_hi: '2. ' + (lang === 'hi' ? 'स्थान, यात्रा दूरी व घर से काम की सीमा तय करें' : 'Set Location & Commute Limits'),
      summary_en:
        'Enter your village or district. Adjust the commute slider to your realistic travel radius (e.g. 10-15 km). If you have childcare or family care obligations, toggle "Work From Home Only" so you are never matched with impossible physical commutes.',
      summary_hi:
        'अपना गाँव, कस्बा व जिला दर्ज करें। अपनी क्षमता के अनुसार यात्रा दूरी स्लाइडर (जैसे 10-15 किमी) सेट करें। यदि आपके पास बच्चों या बुजुर्गों की देखभाल की जिम्मेदारी है, तो "Work From Home Only" चुनें।',
      methodology: [
        {
          label_en: 'Set Travel Radius:',
          label_hi: 'अधिकतम यात्रा सीमा:',
          text_en: 'Move the slider to set max km you can realistically travel every day.',
          text_hi: 'स्लाइडर को घुमाकर तय करें कि आप रोज़ कितनी दूर तक जा सकते हैं।',
        },
        {
          label_en: 'Choose Transit Mode:',
          label_hi: 'यातायात का साधन:',
          text_en: 'Select whether you commute by public bus, bicycle, walking, or shared auto.',
          text_hi: 'चुनें कि आप बस, साइकिल, पैदल या ऑटो से सफर करते हैं।',
        },
        {
          label_en: 'Childcare & WFH:',
          label_hi: 'घर से काम (WFH):',
          text_en: 'Filter for home-based stitching orders, tiffin catering, or digital data entry work.',
          text_hi: 'घर बैठे सिलाई, टिफिन या डेटा एंट्री काम के लिए विशेष फ़िल्टर।',
        },
      ],
      proTip_en:
        'Pro Tip: Setting realistic travel limits prevents wasted bus fares and protects your daily take-home earnings!',
      proTip_hi:
        'विशेष सुझाव: वास्तविक यात्रा सीमा तय करने से अनावश्यक बस किराया बचता है और शुद्ध कमाई सुरक्षित रहती है!',
      image: '/assets/overview/step2_preferences.jpg',
      imageAlt: 'SkillSetu Commute Distance and Work from Home preferences UI',
      actionText_en: 'Set Your Preferences',
      actionText_hi: 'प्राथमिकताएं सेट करें',
      actionLink: '/onboarding',
    },
    {
      step: 3,
      badge: lang === 'hi' ? 'चरण 3 • सम्पूर्ण डैशबोर्ड' : 'Step 3 • Complete Dashboard',
      title_en: '3. Unlock Your Comprehensive Verified Dashboard',
      title_hi: '3. ' + (lang === 'hi' ? 'सम्पूर्ण डैशबोर्ड व सत्यापित प्रोफ़ाइल अनलॉक करें' : 'Unlock Your Verified Dashboard'),
      summary_en:
        'Once onboarding is complete, the website permanently remembers you. Visit "My Dashboard" anytime to view your complete profile details, 100% completeness chart, and access your 3 main hubs: Opportunities, Course Learning, and Career Path.',
      summary_hi:
        'ऑनबोर्डिंग पूरी होते ही वेबसाइट आपकी प्रोफ़ाइल को याद रखती है। कभी भी "मेरा डैशबोर्ड" खोलकर अपना सम्पूर्ण डेटा, 100% प्रोफाइल स्कोर, और तीनों मुख्य सेक्शन (अवसर, कोर्स, करियर रोडमैप) देखें।',
      methodology: [
        {
          label_en: '100% Profile Overview:',
          label_hi: 'सम्पूर्ण प्रोफ़ाइल विवरण:',
          text_en: 'View all saved data: Full Name, Location, Experience, Tools owned, and Accessibility preferences.',
          text_hi: 'अपना पूरा विवरण देखें: नाम, पता, अनुभव, पास में मौजूद औजार व कार्य सीमाएं।',
        },
        {
          label_en: 'No Repeated Logins:',
          label_hi: 'बार-बार लॉगिन का झंझट नहीं:',
          text_en: 'The Hero section directly provides "Go to Dashboard" with instant access.',
          text_hi: 'मुख्य पृष्ठ पर सीधे "डैशबोर्ड खोलें" का बटन मिलता है।',
        },
        {
          label_en: 'Edit Anytime:',
          label_hi: 'कभी भी अपडेट करें:',
          text_en: 'Update your commute km or village anytime without retaking the entire skill assessment.',
          text_hi: 'बिना दोबारा टेस्ट दिए कभी भी अपनी यात्रा दूरी या गाँव बदलें।',
        },
      ],
      proTip_en:
        'Pro Tip: Your dashboard updates your completion score automatically as you explore opportunities and courses.',
      proTip_hi:
        'विशेष सुझाव: जैसे-जैसे आप काम और कोर्स देखते हैं, आपका डैशबोर्ड स्कोर स्वतः अपडेट होता है।',
      image: '/assets/overview/step3_dashboard.jpg',
      imageAlt: 'SkillSetu User Profile and Comprehensive Dashboard UI',
      actionText_en: 'View Your Dashboard',
      actionText_hi: 'डैशबोर्ड देखें',
      actionLink: '/dashboard',
    },
    {
      step: 4,
      badge: lang === 'hi' ? 'चरण 4 • अवसर व संपर्क' : 'Step 4 • Verified Livelihoods',
      title_en: '4. Explore Matched Livelihoods & Direct Employer Contact',
      title_hi: '4. ' + (lang === 'hi' ? 'सत्यापित काम खोजें और सीधे व्हाट्सएप या कॉल करें' : 'Explore Livelihoods & Direct Contact'),
      summary_en:
        'Browse local jobs, apprenticeships, and independent contracts tailored to your exact skills and commute. Each card transparently shows monthly pay, commute minutes, and transit fare. Apply with 1 click to get direct employer WhatsApp and phone details.',
      summary_hi:
        'अपने हुनर और यात्रा सीमा के अनुसार छांटे गए वास्तविक काम देखें। हर कार्ड पर मासिक वेतन, आने-जाने का समय और बस किराया साफ़ दिखता है। बिना किसी बिचौलिए के सीधे व्हाट्सएप या कॉल से नियोक्ता से बात करें।',
      methodology: [
        {
          label_en: 'Fair Pay Transparency:',
          label_hi: 'पारदर्शी मासिक वेतन:',
          text_en: 'Clear salary in Rupees per month with commute travel fare clearly factored in.',
          text_hi: 'रुपयों में स्पष्ट मासिक वेतन और आने-जाने का बस किराया पहले से दर्शाया गया।',
        },
        {
          label_en: 'Commute Filtered:',
          label_hi: 'यात्रा सीमा में काम:',
          text_en: 'Opportunities strictly match within your chosen travel kilometers or home-work status.',
          text_hi: 'केवल वही काम दिखते हैं जो आपकी तय की गई दूरी या घर से काम के दायरे में हों।',
        },
        {
          label_en: 'Direct WhatsApp & Call:',
          label_hi: 'सीधा व्हाट्सएप व कॉल:',
          text_en: 'Zero contractor commission or middleman cuts — connect straight to workshop owners.',
          text_hi: 'कोई दलाल या कमीशन नहीं — सीधे दुकान या वर्कशॉप मालिक से बात करें।',
        },
      ],
      proTip_en:
        'Pro Tip: Look for the green "Home Work (WFH)" banner for tasks where you save 100% on travel fare!',
      proTip_hi:
        'विशेष सुझाव: हरे रंग का "Home Work (WFH)" बैज देखें जहां आपका आने-जाने का पूरा किराया बचता है!',
      image: '/assets/overview/step4_opportunities.jpg',
      imageAlt: 'SkillSetu Job Opportunities and Direct WhatsApp Contact UI',
      actionText_en: 'Browse Opportunities',
      actionText_hi: 'उपलब्ध अवसर देखें',
      actionLink: '/opportunities',
    },
    {
      step: 5,
      badge: lang === 'hi' ? 'चरण 5 • पूरक हुनर' : 'Step 5 • Synergistic Learning',
      title_en: '5. Learn Synergistic Skills to Boost Earnings by 30% - 60%',
      title_hi: '5. ' + (lang === 'hi' ? 'पूरक हुनर सीखें और अपनी आमदनी 30% से 60% तक बढ़ाएं' : 'Learn Synergistic Skills'),
      summary_en:
        'Access government ITI, PMKVY, and certified video courses sorted free-first (₹0). Check the "Recommended Skills & Complementary Trades" section on your dashboard: tailors learn bridal zari embroidery, electricians learn solar PV fitting, and cooks learn baking to double their income.',
      summary_hi:
        'निःशुल्क सरकारी ITI, PMKVY और ऑनलाइन वीडियो कोर्स देखें (शून्य खर्च पहले)। अपने डैशबोर्ड पर "अनुशंसित पूरक हुनर" देखें: सिलाई वाले ज़री व कढ़ाई सीखें, इलेक्ट्रीशियन सोलर पैनल सीखें, जिससे काम के दाम दोगुने हो जाते हैं।',
      methodology: [
        {
          label_en: 'Free First (₹0 Cost):',
          label_hi: 'शून्य खर्च (₹0):',
          text_en: 'Cost slider defaults to free courses to protect underprivileged candidates.',
          text_hi: 'लागत स्लाइडर सबसे पहले निःशुल्क सरकारी कोर्स दिखाता है।',
        },
        {
          label_en: 'Same Domain Synergies:',
          label_hi: 'समान कार्यक्षेत्र का लाभ:',
          text_en: 'Learn adjacent trade skills without starting from scratch — e.g. solar panel wiring for electricians.',
          text_hi: 'अपने मौजूदा हुनर से जुड़ा नया काम सीखें — जैसे इलेक्ट्रीशियन के लिए सोलर वायरिंग।',
        },
        {
          label_en: 'Higher Order Margins:',
          label_hi: 'अधिक मुनाफा:',
          text_en: 'Adding bridal embroidery to regular stitching raises suit order prices by +40%.',
          text_hi: 'सूट सिलाई के साथ ब्राइडल कढ़ाई जोड़ने पर आर्डर का मूल्य 40% बढ़ जाता है।',
        },
      ],
      proTip_en:
        'Pro Tip: Check for government ITI centers near you for free tools and PMKVY stipend support!',
      proTip_hi:
        'विशेष सुझाव: अपने पास के सरकारी आईटीआई सेंटर देखें जहां मुफ्त टूलकिट और सरकारी स्टाइपेंड मिलता है!',
      image: '/assets/overview/step3_dashboard.jpg',
      imageAlt: 'SkillSetu Course Learning and Synergistic Skills section',
      actionText_en: 'Explore Course Learning',
      actionText_hi: 'कोर्स लर्निंग देखें',
      actionLink: '/learn',
    },
    {
      step: 6,
      badge: lang === 'hi' ? 'चरण 6 • करियर मार्ग' : 'Step 6 • Career Roadmap',
      title_en: '6. Follow the 5-Stage Career Roadmap to Self-Reliance',
      title_hi: '6. ' + (lang === 'hi' ? '5-चरणीय करियर रोडमैप के साथ आत्मनिर्भर बनें' : 'Follow the 5-Stage Career Roadmap'),
      summary_en:
        'Follow a structured 5-stage roadmap: Trainee Helper → Independent Artisan → Senior Specialist → Master Craftsperson → Workshop Owner / Contractor. Track target incomes (₹8k to ₹40k+), required tools, weekly action targets, and government grants like PM Vishwakarma and Mudra loans.',
      summary_hi:
        '5 चरणों का स्पष्ट करियर मार्ग अपनाएं: प्रशिक्षु → स्वतंत्र कारीगर → वरिष्ठ विशेषज्ञ → मास्टर कारीगर → वर्कशॉप मालिक / ठेकेदार। मासिक आमदनी लक्ष्य (₹8,000 से ₹40,000+), जरूरी औजार, और पीएम विश्वकर्मा व मुद्रा लोन जैसी सरकारी योजनाओं का लाभ लें।',
      methodology: [
        {
          label_en: 'Step-by-Step Milestones:',
          label_hi: 'चरणबद्ध लक्ष्य:',
          text_en: 'Clear weekly practice targets and tools required for each career stage.',
          text_hi: 'हर चरण के लिए साप्ताहिक अभ्यास लक्ष्य और आवश्यक औजारों की सूची।',
        },
        {
          label_en: 'Government Toolkit Grants:',
          label_hi: 'सरकारी टूलकिट अनुदान:',
          text_en: 'Direct access to PM Vishwakarma toolkit subsidy worth ₹15,000 for artisans.',
          text_hi: 'कारीगरों के लिए ₹15,000 मूल्य की पीएम विश्वकर्मा टूलकिट सहायता।',
        },
        {
          label_en: 'Mark Milestones Complete:',
          label_hi: 'चरण पूरा मार्क करें:',
          text_en: 'Tap "Mark Complete" to save your progress permanently in your career roadmap.',
          text_hi: '"Mark Complete" दबाकर अपनी प्रगति को करियर रोडमैप में सुरक्षित करें।',
        },
      ],
      proTip_en:
        'Pro Tip: Apply for PM Vishwakarma scheme under Stage 3 to receive collateral-free business loans at 5% interest!',
      proTip_hi:
        'विशेष सुझाव: स्टेज 3 में पीएम विश्वकर्मा योजना के तहत 5% रियायती ब्याज दर पर बिना गारंटी व्यापार लोन पाएं!',
      image: '/assets/overview/step4_opportunities.jpg',
      imageAlt: 'SkillSetu Career Roadmap 5 Stages progression UI',
      actionText_en: 'View Career Roadmap',
      actionText_hi: 'करियर रोडमैप देखें',
      actionLink: '/career',
    },
  ]

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return Boolean(
        localStorage.getItem('skillsetu-user') ||
        localStorage.getItem('skillsetu-token') ||
        localStorage.getItem('skillsetu-completed')
      )
    } catch {
      return false
    }
  })

  useEffect(() => {
    const check = () => {
      try {
        const u = localStorage.getItem('skillsetu-user')
        const token = localStorage.getItem('skillsetu-token')
        const completed = localStorage.getItem('skillsetu-completed')
        setIsLoggedIn(Boolean(u || token || completed))
      } catch {
        setIsLoggedIn(false)
      }
    }
    window.addEventListener('storage', check)
    window.addEventListener('auth-change', check)
    return () => {
      window.removeEventListener('storage', check)
      window.removeEventListener('auth-change', check)
    }
  }, [])

  const handleSpeakOverview = () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }
    const currentStepData = steps.find((s) => s.step === activeStepTab) || steps[0]
    const text =
      lang === 'hi'
        ? `${currentStepData.title_hi}. ${currentStepData.summary_hi} ${currentStepData.proTip_hi}`
        : `${currentStepData.title_en}. ${currentStepData.summary_en} ${currentStepData.proTip_en}`
    speak(text)
  }

  return (
    <main id="main" className="overview-page-wrapper w">
      {/* Hero Guide Banner */}
      <section className="overview-hero-card container-interactive-card reveal-on-scroll">
        <div className="overview-hero-content">
          <div className="overview-hero-tag">
            <DashIcon name="book" size={14} className="inline-dash-icon" />
            <span>{lang === 'hi' ? 'वेबसाइट उपयोग मार्गदर्शिका • HOW TO USE' : 'WEBSITE USER GUIDE • HOW IT WORKS'}</span>
          </div>

          <h1 className="overview-main-heading">
            {lang === 'hi'
              ? 'स्किलसेतु का उपयोग कैसे करें: शुरुआती लोगों के लिए सरल चरण'
              : 'How to Use SkillSetu: Complete Step-by-Step Guide for Starting Candidates'}
          </h1>

          <p className="overview-hero-desc">
            {lang === 'hi'
              ? 'बिना किसी कॉलेज डिग्री या जटिल फॉर्म के, अपने व्यावहारिक हुनर के आधार पर स्थानीय काम, सरकारी अप्रेंटिसशिप और निःशुल्क ट्रेनिंग से जुड़ने की पूरी प्रक्रिया।'
              : 'The complete methodology for disadvantaged artisans and jobseekers to test their skills, set travel limits, and connect directly to verified livelihood opportunities with zero agency fees.'}
          </p>

          <div className="overview-hero-actions">
            {isLoggedIn ? (
              <Link to="/dashboard" className="action-btn-primary nav-start-btn">
                {lang === 'hi' ? 'डैशबोर्ड पर जाएं →' : 'Go to Dashboard →'}
              </Link>
            ) : (
              <Link to="/onboarding" className="action-btn-primary nav-start-btn">
                {lang === 'hi' ? 'अभी शुरू करें (Start Now) →' : 'Start Now (Get Matched) →'}
              </Link>
            )}

            <button
              type="button"
              className={`btn-icon-listen ${isSpeaking ? 'active' : ''}`}
              onClick={handleSpeakOverview}
              title={isSpeaking ? t('nav.stopListening') : t('nav.listen')}
            >
              {isSpeaking ? <DashIcon name="stop" size={16} /> : <DashIcon name="speaker" size={16} />}
              <span className="listen-btn-text">
                {isSpeaking
                  ? (lang === 'hi' ? 'आवाज रोकें' : 'Stop Audio')
                  : (lang === 'hi' ? 'मार्गदर्शिका सुनें' : 'Listen Guide')}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Stepper Jump Tabs */}
        <div className="overview-steps-nav-bar">
          {steps.map((st) => (
            <button
              key={st.step}
              type="button"
              className={`overview-step-tab-btn ${activeStepTab === st.step ? 'active' : ''}`}
              onClick={() => setActiveStepTab(st.step)}
            >
              <span className="tab-step-num">0{st.step}</span>
              <span className="tab-step-label">
                {lang === 'hi' ? st.badge : st.badge}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Step by Step Detailed Methodology Section */}
      <section className="overview-steps-display-list">
        {steps.map((st, idx) => (
          <article
            key={st.step}
            id={`step-${st.step}`}
            className={`overview-step-item-card container-interactive-card reveal-on-scroll ${
              activeStepTab === st.step ? 'highlighted-active' : ''
            }`}
          >
            {/* Step Content Left */}
            <div className="step-card-left-col">
              <div className="step-badge-row">
                <span className="step-num-pill">
                  {lang === 'hi' ? `चरण 0${st.step}` : `STEP 0${st.step}`}
                </span>
                <span className="step-domain-tag">{st.badge}</span>
              </div>

              <h2 className="step-card-title">
                {lang === 'hi' ? st.title_hi : st.title_en}
              </h2>

              <p className="step-card-summary">
                {lang === 'hi' ? st.summary_hi : st.summary_en}
              </p>

              {/* Methodology Checklist */}
              <div className="step-methodology-box">
                <h3 className="methodology-heading">
                  <DashIcon name="target" size={15} className="inline-dash-icon" />
                  {lang === 'hi' ? 'कार्यप्रणाली (क्या करना है):' : 'Step-by-Step Instructions:'}
                </h3>
                <ul className="methodology-list">
                  {st.methodology.map((m, mIdx) => (
                    <li key={mIdx}>
                      <strong>{lang === 'hi' ? m.label_hi : m.label_en}</strong>{' '}
                      <span>{lang === 'hi' ? m.text_hi : m.text_en}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tip Callout Box */}
              <div className="step-protip-box">
                <div className="protip-icon">
                  <DashIcon name="bulb" size={18} />
                </div>
                <p>{lang === 'hi' ? st.proTip_hi : st.proTip_en}</p>
              </div>

              <div className="step-card-cta-row">
                <Link to={st.actionLink} className="action-btn-primary">
                  {lang === 'hi' ? st.actionText_hi : st.actionText_en} →
                </Link>
                <span className="step-status-hint">
                  <DashIcon name="check" size={14} className="inline-dash-icon" />
                  {lang === 'hi' ? '100% निःशुल्क व सुरक्षित' : '100% Free & Transparent'}
                </span>
              </div>
            </div>

            {/* Step Mockup Image Reference Right */}
            <div className="step-card-right-col">
              <div className="browser-window-frame">
                {/* Simulated window header bar */}
                <div className="browser-frame-header">
                  <div className="window-dots-row">
                    <span className="window-dot red" />
                    <span className="window-dot yellow" />
                    <span className="window-dot green" />
                  </div>
                  <div className="window-url-bar">
                    <DashIcon name="globe" size={11} className="inline-dash-icon" />
                    <span>skillsetu.in{st.actionLink}</span>
                  </div>
                  <span className="window-preview-tag">
                    {lang === 'hi' ? 'वेबसाइट स्क्रीन' : 'Live UI'}
                  </span>
                </div>

                {/* Reference Website Image */}
                <div className="browser-frame-body">
                  <img
                    src={st.image}
                    alt={st.imageAlt}
                    className="browser-preview-img"
                    loading="lazy"
                  />
                  <div className="browser-frame-caption">
                    <DashIcon name="tag" size={13} className="inline-dash-icon" />
                    <span>
                      {lang === 'hi'
                        ? `संदर्भ चित्र: स्किलसेतु ${st.badge} इंटरफ़ेस`
                        : `Reference Screenshot: SkillSetu ${st.badge} Interface`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Bottom Interactive CTA Banner */}
      <section className="overview-bottom-cta-banner container-interactive-card reveal-on-scroll">
        <div className="cta-banner-content">
          <div className="cta-badge-pill">
            <DashIcon name="lightning" size={14} className="inline-dash-icon" />
            {lang === 'hi' ? 'तुरंत शुरुआत करें' : 'Get Started in 3 Minutes'}
          </div>
          <h2>
            {lang === 'hi'
              ? 'क्या आप अपना हुनर परखकर रोजगार से जुड़ने के लिए तैयार हैं?'
              : 'Ready to Put Your Skills to Work and Find Verified Local Opportunities?'}
          </h2>
          <p>
            {lang === 'hi'
              ? 'बिना किसी परेशानी के केवल 3 मिनट में अपना मूल्यांकन पूरा करें और अपने क्षेत्र के काम से सीधे जुड़ें।'
              : 'Complete your 3-minute trade assessment now. Your profile is automatically saved, connecting you directly to local livelihoods.'}
          </p>
          <div className="cta-banner-buttons">
            {isLoggedIn ? (
              <Link to="/dashboard" className="action-btn-primary cta-btn-large">
                {lang === 'hi' ? 'डैशबोर्ड पर जाएं →' : 'Go to My Dashboard →'}
              </Link>
            ) : (
              <Link to="/onboarding" className="action-btn-primary cta-btn-large">
                {lang === 'hi' ? 'अभी शुरू करें (Start Now) →' : 'Start Assessment Now →'}
              </Link>
            )}
            <Link to="/opportunities" className="btn-secondary cta-btn-large">
              {lang === 'hi' ? 'पहले अवसर देखें' : 'Preview Opportunities'} →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
