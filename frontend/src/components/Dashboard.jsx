import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  apiApplyOpportunity,
  apiGetApplied,
  apiGetCareerRoadmap,
  apiGetLearningResources,
  apiGetOpportunities,
  apiGetProfile,
  apiSaveProfile,
  apiToggleRoadmapStep,
  apiGetVerifications,
  apiSubmitVerification,
  apiDeleteVerification,
} from '../api.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { DashIcon } from './DashboardIcons.jsx'
import { TradeIcon } from './TradeIcons.jsx'

function SkeletonCards({ count = 3 }) {
  return (
    <div className="skeleton-grid" aria-label="Loading content" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-tag" />
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-sub" />
          <div className="skeleton-metrics-row">
            <div className="skeleton-line skeleton-metric-box" />
            <div className="skeleton-line skeleton-metric-box" />
          </div>
          <div className="skeleton-line skeleton-btn" />
        </div>
      ))}
    </div>
  )
}

export const AVAILABLE_TRADES = [
  { id: 'tailoring', en: 'Stitching & Tailoring', hi: 'सिलाई व बुटीक कार्य', desc_en: 'Garments, alteration, embroidery & boutique craft', desc_hi: 'सूट, ब्लाउज, कटिंग व बुटीक कार्य' },
  { id: 'electrician', en: 'Electrician & Solar PV', hi: 'इलेक्ट्रीशियन व सोलर', desc_en: 'House wiring, appliances & rooftop solar panels', desc_hi: 'घरेलू वायरिंग, उपकरण व सोलर पैनल' },
  { id: 'cooking', en: 'Cooking & Food Business', hi: 'रसोई व खानपान सेवा', desc_en: 'Tiffin service, commercial cooking & catering', desc_hi: 'टिफिन सेवा, रेस्टोरेंट व कैटरिंग' },
  { id: 'plumbing', en: 'Plumbing & Piping', hi: 'प्लंबिंग व पाइप-फिटिंग', desc_en: 'Sanitary installation, motors & pipe fittings', desc_hi: 'नल-फिटिंग, मोटर व पानी पाइपलाइन' },
  { id: 'carpentry', en: 'Carpentry & Woodwork', hi: 'बढ़ई व लकड़ी का काम', desc_en: 'Furniture design, modular kitchen & woodwork', desc_hi: 'फर्नीचर निर्माण व मॉड्यूलर इंटीरियर' },
  { id: 'mobile_repair', en: 'Mobile & Electronics Repair', hi: 'मोबाइल रिपेयरिंग', desc_en: 'Display screen, motherboard & micro-soldering', desc_hi: 'स्क्रीन, चार्जिंग व सर्किट रिपेयर' },
  { id: 'beauty', en: 'Beauty Parlour & Salon', hi: 'ब्यूटी पार्लर व मेकअप', desc_en: 'Bridal styling, skin treatments & haircut', desc_hi: 'ब्राइडल मेकअप, हेयर स्टाइलिंग व पार्लर' },
  { id: 'driving', en: 'Driving & Logistics', hi: 'ड्राइविंग व ट्रांसपोर्ट', desc_en: 'Commercial & private vehicle driving', desc_hi: 'प्राइवेट व कमर्शियल वाहन ड्राइविंग' },
  { id: 'webdev', en: 'Web & Digital Skills', hi: 'वेबसाइट व कंप्यूटर', desc_en: 'Website design, coding & digital tools', desc_hi: 'वेबसाइट निर्माण व डिजिटल स्किल्स' },
  { id: 'data_entry', en: 'Data Entry & Office Admin', hi: 'डेटा एंट्री व ऑफिस', desc_en: 'Excel, billing, typing & office computer', desc_hi: 'कंप्यूटर टाइपिंग, बिलिंग व ऑफिस कार्य' },
]

const RECOMMENDED_SKILLS_MAP = {
  tailoring: [
    {
      id: 'embroidery_zari',
      title_en: 'Embroidery, Zari & Maggam Work',
      title_hi: 'कढ़ाई, ज़री व मग्गम वर्क',
      domain_en: 'Textiles & Fashion',
      domain_hi: 'टेक्सटाइल व फैशन',
      boost_en: '+40% order value on bridal wear',
      boost_hi: 'शादी व त्योहारों के कपड़ों पर 40% अधिक आय',
      synergy_en: 'Complements blouse and suit stitching; clients pay high premium for hand-embroidered work.',
      synergy_hi: 'सूट व ब्लाउज सिलाई के साथ जुड़कर शादी के ऑर्डर में दोगुनी कमाई दिलाता है।',
      duration_en: '2 weeks • Free Govt ITI',
      duration_hi: '2 हफ्ते • निःशुल्क सरकारी ITI',
    },
    {
      id: 'pattern_cutting',
      title_en: 'Master Pattern Cutting & Grading',
      title_hi: 'मास्टर कटिंग व पैटर्न मेकिंग',
      domain_en: 'Garment Manufacturing',
      domain_hi: 'गारमेंट मैन्युफैक्चरिंग',
      boost_en: 'Qualify for Master Cutter roles (₹22k-₹32k/mo)',
      boost_hi: 'मास्टर कटर पद के लिए योग्य (₹22,000-₹32,000/माह)',
      synergy_en: 'Prevents fabric waste and enables boutique-fit garments for high-paying retail clients.',
      synergy_hi: 'कपड़े की बर्बादी रोककर परफेक्ट फिटिंग देता है जिससे बुटीक में ऊंचे पद मिलते हैं।',
      duration_en: '3 weeks • Free Course',
      duration_hi: '3 हफ्ते • निःशुल्क कोर्स',
    },
    {
      id: 'boutique_business',
      title_en: 'Boutique Management & WhatsApp Selling',
      title_hi: 'बुटीक बिज़नेस व ऑनलाइन सेलिंग',
      domain_en: 'Retail & Business',
      domain_hi: 'रिटेल व स्वरोजगार',
      boost_en: '2x profit margin over wage stitching',
      boost_hi: 'मजदूरी सिलाई से 2 गुना अधिक शुद्ध लाभ',
      synergy_en: 'Sell directly to local customers via WhatsApp catalogs instead of piece-rate subcontracting.',
      synergy_hi: 'बिचौलियों के बिना सीधे ग्राहकों को कपड़े बेचकर पूरा मुनाफा कमाएं।',
      duration_en: 'Self-paced • Video Guide',
      duration_hi: 'अपनी गति से • वीडियो गाइड',
    },
    {
      id: 'handicrafts_upcycling',
      title_en: 'Fabric Scraps Upcycling & Tote Bags',
      title_hi: 'थैले व बचे कपड़े से डिजाइनर हस्तशिल्प',
      domain_en: 'Sustainable Craft',
      domain_hi: 'सस्टेनेबल हैंडीक्राफ्ट',
      boost_en: '+₹5,000 - ₹8,000/mo zero-cost income',
      boost_hi: '+₹5,000 - ₹8,000/माह शून्य लागत की बचत',
      synergy_en: 'Converts leftover fabric cuttings into trendy cloth bags, cushion covers, and potli pouches.',
      synergy_hi: 'सिलाई के बचे कतरनों से डिजाइनर थैले व कुशन कवर बनाकर अतिरिक्त आमदनी।',
      duration_en: '1 week • Hands-on',
      duration_hi: '1 हफ्ता • प्रायोगिक',
    },
  ],
  electrician: [
    {
      id: 'solar_installation',
      title_en: 'Rooftop Solar PV Installation & Wiring',
      title_hi: 'रूफटॉप सोलर पैनल इंस्टॉलेशन',
      domain_en: 'Clean Energy & Power',
      domain_hi: 'सोलर ऊर्जा व बिजली',
      boost_en: '+₹12,000 - ₹20,000/mo contractor income',
      boost_hi: '+₹12,000 - ₹20,000/माह अतिरिक्त आय',
      synergy_en: 'High subsidy demand under PM Surya Ghar Muft Bijli Yojana requires certified electricians.',
      synergy_hi: 'पीएम सूर्य घर योजना के तहत सोलर इंस्टॉलेशन की भारी मांग है।',
      duration_en: '3 weeks • PMKVY Certified',
      duration_hi: '3 हफ्ते • पीएमकेवीवाई प्रमाणित',
    },
    {
      id: 'appliance_repair',
      title_en: 'Inverter, AC & Washing Machine Servicing',
      title_hi: 'घरेलू उपकरण व एसी/इन्वर्टर मरम्मत',
      domain_en: 'Home Appliances',
      domain_hi: 'होम अप्लायंसेज',
      boost_en: '₹800 - ₹1,500 service fee per visit',
      boost_hi: 'प्रति विज़िट ₹800 - ₹1,500 की सीधी सर्विस कमाई',
      synergy_en: 'Homeowners who call for wiring regularly require inverter and appliance troubleshooting.',
      synergy_hi: 'घरेलू वायरिंग के साथ-साथ इन्वर्टर व एसी ठीक करने पर तुरंत अतिरिक्त काम मिलता है।',
      duration_en: '1 month • NSDC Skill Lab',
      duration_hi: '1 महीना • एनएसडीसी लैब',
    },
    {
      id: 'industrial_wiring',
      title_en: '3-Phase Industrial Panel & Star-Delta Starters',
      title_hi: 'इंडस्ट्रियल 3-फेज वायरिंग व स्टार्टर',
      domain_en: 'Industrial Automation',
      domain_hi: 'इंडस्ट्रियल ऑटोमेशन',
      boost_en: '₹22,000 - ₹35,000/mo factory technician salary',
      boost_hi: '₹22,000 - ₹35,000/माह निश्चित फैक्ट्री वेतन',
      synergy_en: 'Elevates residential electricians into industrial plant and commercial site technicians.',
      synergy_hi: 'घरेलू इलेक्ट्रीशियन से फैक्ट्रियों में 3-फेज मोटर ऑपरेटर बनने का सीधा रास्ता।',
      duration_en: '1.5 months • Govt ITI',
      duration_hi: '1.5 महीने • सरकारी ITI',
    },
    {
      id: 'motor_rewinding',
      title_en: 'Submersible Pump & Fan Motor Rewinding',
      title_hi: 'सबमर्सिबल पंप व मोटर वाइंडिंग',
      domain_en: 'Agri-Electrical Trade',
      domain_hi: 'कृषि व मोटर मरम्मत',
      boost_en: 'Steady seasonal demand in agri & rural belts',
      boost_hi: 'ग्रामीण व कृषि क्षेत्रों में वर्षभर निश्चित काम',
      synergy_en: 'Borewell pump burnout occurs every agricultural season, giving continuous local repair orders.',
      synergy_hi: 'किसानों के खेतों में मोटर जलने पर तुरंत रिपेयर का काम मिलता है।',
      duration_en: '2 weeks • Workshop Practical',
      duration_hi: '2 हफ्ते • वर्कशॉप',
    },
  ],
  cooking: [
    {
      id: 'baking_confectionery',
      title_en: 'Eggless Bakery & Cake Decorating',
      title_hi: 'होम बेकरी व केक डेकोरेशन',
      domain_en: 'Food Processing',
      domain_hi: 'खाद्य निर्माण',
      boost_en: '₹400 - ₹800 margin per custom cake',
      boost_hi: 'प्रति केक ₹400 - ₹800 का शुद्ध मुनाफा',
      synergy_en: 'Home cooks can prepare celebration cakes using domestic ovens and sell to local neighborhoods.',
      synergy_hi: 'घर के चूल्हे/ओवन से जन्मदिन के केक बनाकर पड़ोस में आसानी से बेचें।',
      duration_en: '2 weeks • Free Online',
      duration_hi: '2 हफ्ते • ऑनलाइन निःशुल्क',
    },
    {
      id: 'fssai_hygiene',
      title_en: 'FSSAI Standards, Food Hygiene & Packaging',
      title_hi: 'एफएसएसएआई हाइजीन व फूड सेफ्टी',
      domain_en: 'Safety & Licensing',
      domain_hi: 'लाइसेंस व सुरक्षा',
      boost_en: 'Qualify for corporate lunch & cloud kitchen contracts',
      boost_hi: 'ऑफिस टिफिन और ऑनलाइन डिलीवरी के बड़े ऑर्डर',
      synergy_en: 'Certification turns an informal kitchen into an authorized commercial catering supplier.',
      synergy_hi: 'सरकारी फूड सर्टिफिकेशन से कॉरपोरेट ऑफिसों में टिफिन सप्लाई संभव होती है।',
      duration_en: '1 week • Govt Portal',
      duration_hi: '1 हफ्ता • सरकारी पोर्टल',
    },
    {
      id: 'bulk_catering',
      title_en: 'Event Catering & Bulk Meal Logistics',
      title_hi: 'पार्टी व शादी कैटरिंग प्रबंधन',
      domain_en: 'Hospitality',
      domain_hi: 'हॉस्पिटैलिटी',
      boost_en: 'Earn ₹15,000 - ₹40,000 per wedding order',
      boost_hi: 'प्रति शादी ऑर्डर पर ₹15,000 - ₹40,000 की बचत',
      synergy_en: 'Scale up daily tiffin recipes into 200-500 person event buffet contracts.',
      synergy_hi: 'रोज़ाना टिफिन के हुनर को शादी और पारिवारिक आयोजनों के बल्क कॉन्ट्रैक्ट में बदलें।',
      duration_en: '3 weeks • Masterclass',
      duration_hi: '3 हफ्ते • मास्टरक्लास',
    },
  ],
  data_entry: [
    {
      id: 'tally_gst',
      title_en: 'Tally Prime, e-Way Bill & GST Billing',
      title_hi: 'टैली प्राइम व जीएसटी बिलिंग',
      domain_en: 'Accounting & Finance',
      domain_hi: 'लेखा व व्यापारिक बिलिंग',
      boost_en: '₹18,000 - ₹28,000/mo in local retail & MSMEs',
      boost_hi: '₹18,000 - ₹28,000/माह खुदरा व थोक व्यापार में',
      synergy_en: 'Basic typists upgrade into accounts executives capable of filing invoices and monthly GST summaries.',
      synergy_hi: 'सामान्य टाइपिंग से आगे बढ़कर दुकानों और कंपनियों के जीएसटी बिल बनाएं।',
      duration_en: '3 weeks • Free Course',
      duration_hi: '3 हफ्ते • निःशुल्क कोर्स',
    },
    {
      id: 'advanced_excel',
      title_en: 'Advanced Excel, VLOOKUP & MIS Dashboards',
      title_hi: 'एडवांस्ड एक्सेल व एमआईएस रिपोर्टिंग',
      domain_en: 'Data Analytics',
      domain_hi: 'डेटा विश्लेषण',
      boost_en: '+35% salary on remote operations roles',
      boost_hi: 'रिमोट और वर्क-फ्रॉम-होम नौकरियों में 35% अधिक वेतन',
      synergy_en: 'Automates manual spreadsheets, opening high-paying remote reporting coordinator jobs.',
      synergy_hi: 'मैनुअल डेटा एंट्री के बजाय ऑटोमेटेड शीट्स बनाकर सुपरवाइजर पद पाएं।',
      duration_en: '2 weeks • Hands-on',
      duration_hi: '2 हफ्ते • प्रायोगिक',
    },
    {
      id: 'canva_social',
      title_en: 'Canva Design & WhatsApp Marketing',
      title_hi: 'कैनवा डिजिटल पोस्टर व सोशल मीडिया',
      domain_en: 'Digital Media',
      domain_hi: 'डिजिटल मीडिया',
      boost_en: 'Earn ₹3,000 - ₹6,000/mo retainer per local shop',
      boost_hi: 'प्रति दुकान ₹3,000 - ₹6,000/माह का सोशल मीडिया काम',
      synergy_en: 'Create digital festival posters, offer banners, and WhatsApp promotional catalogs for neighborhood stores.',
      synergy_hi: 'आस-पास के व्यापारियों के लिए फेस्टिवल ऑफर और सोशल मीडिया बैनर बनाएं।',
      duration_en: '1 week • Video Guide',
      duration_hi: '1 हफ्ता • वीडियो गाइड',
    },
  ],
  carpentry: [
    {
      id: 'modular_kitchen',
      title_en: 'Modular Kitchen Fitting & Hardware Alignment',
      title_hi: 'मॉड्यूलर किचन इंस्टॉलेशन',
      domain_en: 'Modern Interior Woodwork',
      domain_hi: 'मॉडर्न इंटीरियर वुडवर्क',
      boost_en: '₹15,000 - ₹35,000 contractor fee per flat',
      boost_hi: 'प्रति फ्लैट ₹15,000 - ₹35,000 का फिटिंग कॉन्ट्रैक्ट',
      synergy_en: 'Modern apartments demand modular hydraulic hinges and pull-out baskets instead of plain shelves.',
      synergy_hi: 'नए फ्लैटों में हाइड्रॉलिक कब्जों और मॉड्यूलर बास्केट फिटिंग की भारी मांग है।',
      duration_en: '3 weeks • Skill Center',
      duration_hi: '3 हफ्ते • स्किल सेंटर',
    },
    {
      id: 'spray_finishing',
      title_en: 'PU & Melamine Spray Polish Finishing',
      title_hi: 'पीयू व मेलामाइन स्प्रे पॉलिशिंग',
      domain_en: 'Furniture Finishing',
      domain_hi: 'फर्नीचर फिनिशिंग',
      boost_en: 'Doubles standard furniture sale value',
      boost_hi: 'साधारण फर्नीचर के दाम को दोगुना करें',
      synergy_en: 'High-gloss spray polish turns raw wood furniture into luxury showroom pieces.',
      synergy_hi: 'लकड़ी के सादे फर्नीचर को लग्जरी शोरूम जैसा चमकदार और टिकाऊ बनाएं।',
      duration_en: '2 weeks • Workshop',
      duration_hi: '2 हफ्ते • वर्कशॉप',
    },
  ],
  plumbing: [
    {
      id: 'modern_fixtures',
      title_en: 'Concealed Diverters & Luxury Sanitary Fitting',
      title_hi: 'कंसील्ड डाइवर्टर व मॉडर्न बाथरूम फिटिंग',
      domain_en: 'Sanitary Engineering',
      domain_hi: 'सैनिटरी इंजीनियरिंग',
      boost_en: '₹12,000 - ₹25,000 per luxury bathroom setup',
      boost_hi: 'प्रति लग्जरी बाथरूम ₹12,000 - ₹25,000 का ठेका',
      synergy_en: 'Wall-hung closets and sensor taps carry 3x higher installation labor rates than basic pipe repairs.',
      synergy_hi: 'वॉल-हंग कमोड और आधुनिक सेंसर नल लगाने पर सामान्य प्लंबिंग से 3 गुना अधिक मजदूरी।',
      duration_en: '2 weeks • Practical ITI',
      duration_hi: '2 हफ्ते • प्रायोगिक ITI',
    },
    {
      id: 'agri_pumps',
      title_en: 'Drip Irrigation & Solar Agricultural Pumps',
      title_hi: 'ड्रिप सिंचाई व सोलर कृषि पंप फिटिंग',
      domain_en: 'Agri-Infrastructure',
      domain_hi: 'कृषि इंफ्रास्ट्रक्चर',
      boost_en: 'Subsidized farm irrigation contractor projects',
      boost_hi: 'सरकारी अनुदान वाले कृषि प्रोजेक्ट्स',
      synergy_en: 'Combines pipe layout with water conservation schemes for steady rural contractor income.',
      synergy_hi: 'खेतों में बूंद-बूंद सिंचाई पाइपलाइन बिछाकर सालभर का काम पाएं।',
      duration_en: '2 weeks • Field Training',
      duration_hi: '2 हफ्ते • फील्ड ट्रेनिंग',
    },
  ],
  driving: [
    {
      id: 'heavy_vehicle',
      title_en: 'Heavy Commercial Vehicle (HCV) & Highway Fleet',
      title_hi: 'कमर्शियल भारी वाहन व हाईवे फ्लीट',
      domain_en: 'Logistics Transport',
      domain_hi: 'लॉजिस्टिक्स ट्रांसपोर्ट',
      boost_en: '₹30,000 - ₹45,000/mo interstate truck driver',
      boost_hi: '₹30,000 - ₹45,000/माह अंतर्राज्यीय ट्रक चालक',
      synergy_en: 'Light vehicle drivers can clear HCV driving test to qualify for high-paying national transport lines.',
      synergy_hi: 'भारी वाहन लाइसेंस लेकर राष्ट्रीय राजमार्गों पर फ्लीट ड्राइविंग की ऊंची आय।',
      duration_en: '1 month • Driver Training Institute',
      duration_hi: '1 महीना • ड्राइविंग संस्थान',
    },
    {
      id: 'ev_fleet',
      title_en: 'EV Fleet Operation & Battery Swap Station Care',
      title_hi: 'इलेक्ट्रिक वाहन (EV) व बैटरी स्वैपिंग',
      domain_en: 'Green Mobility',
      domain_hi: 'हरित गतिशीलता',
      boost_en: 'Guaranteed daily incentives in green cab fleets',
      boost_hi: 'ग्रीन कैब फ्लीट में रोजाना निश्चित इंसेंटिव',
      synergy_en: 'Zero fuel cost for driver, higher take-home daily earnings across metro and delivery apps.',
      synergy_hi: 'पेट्रोल-डीजल का खर्च न होने से रोज की बचत में भारी इजाफा।',
      duration_en: '1 week • Fleet Certified',
      duration_hi: '1 हफ्ता • फ्लीट सर्टिफाइड',
    },
  ],
  beauty: [
    {
      id: 'bridal_makeup',
      title_en: 'HD Bridal Makeup & Traditional Saree Draping',
      title_hi: 'एचडी ब्राइडल मेकअप व साड़ी ड्रेपिंग',
      domain_en: 'Bridal Artistry',
      domain_hi: 'ब्राइडल ब्यूटी',
      boost_en: 'Earn ₹6,000 - ₹18,000 per wedding bride',
      boost_hi: 'प्रति दुल्हन ₹6,000 - ₹18,000 तक की सीधी कमाई',
      synergy_en: 'Basic parlor beauticians expand into seasonal high-ticket bridal contracts.',
      synergy_hi: 'थ्रेडिंग-वैक्सिंग से आगे बढ़कर शादी के सीजन में 10 गुना तक कमाई करें।',
      duration_en: '3 weeks • Parlor Hands-on',
      duration_hi: '3 हफ्ते • पार्लर ट्रेनिंग',
    },
    {
      id: 'skin_aesthetics',
      title_en: 'Hydra-Facials, Skin Peels & D-Tan Therapy',
      title_hi: 'स्किन केयर, हाइड्रा फेशियल व डी-टैन थेरेपी',
      domain_en: 'Cosmetology',
      domain_hi: 'कॉस्मेटोलॉजी',
      boost_en: 'Monthly recurring subscription packages',
      boost_hi: 'नियमित ग्राहकों के लिए मासिक पैकेज',
      synergy_en: 'Brings regular monthly salon footfall with high cosmetic product profit margins.',
      synergy_hi: 'पार्लर में नियमित ग्राहकों को जोड़कर हर महीने बंधी हुई आमदनी।',
      duration_en: '2 weeks • Aesthetic Lab',
      duration_hi: '2 हफ्ते • लैब ट्रेनिंग',
    },
  ],
  mobile_repair: [
    {
      id: 'smd_chip_repair',
      title_en: 'SMD Chip-Level Repair & Motherboard Tracing',
      title_hi: 'एसएमडी चिप-लेवल मदरबोर्ड रिपेयरिंग',
      domain_en: 'Electronics Micro-Soldering',
      domain_hi: 'माइक्रो-सोल्डरिंग',
      boost_en: 'Charge ₹1,200 - ₹3,000 per dead phone repaired',
      boost_hi: 'प्रति डेड फोन चालू करने पर ₹1,200 - ₹3,000 का चार्ज',
      synergy_en: 'Dead phones can be revived in-house rather than sending to third parties, retaining 100% margin.',
      synergy_hi: 'डेड फोन को दूसरी दुकान भेजने के बजाय खुद ठीक करके पूरी फीस अपने पास रखें।',
      duration_en: '1 month • Lab Practical',
      duration_hi: '1 महीना • लैब',
    },
    {
      id: 'laptop_servicing',
      title_en: 'Laptop Thermal Servicing & SSD Upgrades',
      title_hi: 'लैपटॉप सर्विसिंग व एसएसडी अपग्रेड',
      domain_en: 'IT Hardware',
      domain_hi: 'आईटी हार्डवेयर',
      boost_en: 'Tap into student & office computer repair market',
      boost_hi: 'छात्रों व स्थानीय ऑफिसों के कंप्यूटर रिपेयर का काम',
      synergy_en: 'Similar screwdriving and diagnostic principles as mobile phones, with higher bill sizes.',
      synergy_hi: 'स्मार्टफोन के साथ लैपटॉप ठीक करना शुरू कर अपनी दुकान की कुल आय बढ़ाएं।',
      duration_en: '3 weeks • Video + Lab',
      duration_hi: '3 हफ्ते • वीडियो + लैब',
    },
  ],
  webdev: [
    {
      id: 'react_fullstack',
      title_en: 'Full-Stack JavaScript & Express Backend',
      title_hi: 'फुल-स्टैक जावास्क्रिप्ट व बैकएंड',
      domain_en: 'Software Engineering',
      domain_hi: 'सॉफ्टवेयर इंजीनियरिंग',
      boost_en: '₹25,000 - ₹45,000/mo junior developer roles',
      boost_hi: '₹25,000 - ₹45,000/माह जूनियर डेवलपर नौकरियां',
      synergy_en: 'Connect frontend UI with databases and APIs to build complete end-to-end applications.',
      synergy_hi: 'वेबसाइट के साथ डेटाबेस जोड़कर पूरे वेब ऐप बनाएं।',
      duration_en: '1 month • Self-paced',
      duration_hi: '1 महीना • अपनी गति से',
    },
  ],
}

function UserProfileDataCard({ profile, lang, t, onEditClick }) {
  const user = profile?.user || {}
  const access = profile?.accessProfile || {}
  const primarySkill = profile?.skills?.[0] || {}
  const goal = profile?.goal || {}

  return (
    <div className="user-comprehensive-profile-card reveal-on-scroll container-interactive-card">
      <div className="profile-card-topbar">
        <div className="profile-card-topbar-left">
          <div className="profile-card-icon-bubble">
            <DashIcon name="user" size={24} />
          </div>
          <div>
            <h3>
              {lang === 'hi'
                ? 'मेरी प्रोफ़ाइल और प्राथमिकताएं (सम्पूर्ण विवरण)'
                : 'My Comprehensive Profile & Preferences'}
            </h3>
            <p>
              {lang === 'hi'
                ? 'आपका पंजीकृत हुनर, अनुभव, स्थान, यात्रा सीमा और कार्य प्राथमिकताएं'
                : 'Your registered trade skills, practical experience, location and availability constraints'}
            </p>
          </div>
        </div>
        <button type="button" className="btn-secondary btn-sm" onClick={onEditClick}>
          {lang === 'hi' ? 'विवरण बदलें' : 'Edit Details'} →
        </button>
      </div>

      <div className="profile-data-grid">
        {/* Column 1: Personal & Location Details */}
        <div className="profile-data-column">
          <div className="profile-column-heading">
            <DashIcon name="user" size={16} />
            <span>{lang === 'hi' ? 'व्यक्तिगत विवरण' : 'Personal & Location'}</span>
          </div>
          <div className="profile-data-item-list">
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'नाम' : 'Full Name'}</span>
              <span className="profile-data-val">{user.name || 'Candidate'}</span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'फ़ोन नंबर' : 'Phone'}</span>
              <span className="profile-data-val">
                {user.phone ? `+91 ${user.phone}` : '—'}
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'आयु वर्ग व लिंग' : 'Age & Gender'}</span>
              <span className="profile-data-val">
                {[user.age_range || '25-35', user.gender].filter(Boolean).join(' • ')}
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'गाँव / कस्बा' : 'Village / Town'}</span>
              <span className="profile-data-val">{user.village_town || '—'}</span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'जिला व राज्य' : 'District & State'}</span>
              <span className="profile-data-val">
                {[user.district, user.state || 'Maharashtra'].filter(Boolean).join(', ')}
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'पिनकोड' : 'Pincode'}</span>
              <span className="profile-data-val">{user.pincode || '—'}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Skills & Experience */}
        <div className="profile-data-column">
          <div className="profile-column-heading">
            <DashIcon name="skill" size={16} />
            <span>{lang === 'hi' ? 'हुनर व अनुभव' : 'Trade Skills & Experience'}</span>
          </div>
          <div className="profile-data-item-list">
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'मुख्य हुनर' : 'Primary Trade'}</span>
              <span className="profile-badge-val">
                <TradeIcon id={primarySkill.skill_id || 'tailoring'} size={14} />
                {primarySkill.skill_id ? primarySkill.skill_id.toUpperCase() : 'TAILORING'}
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'कौशल स्तर' : 'Proficiency Level'}</span>
              <span className="profile-data-val">{primarySkill.level || 'Intermediate'}</span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'कार्य अनुभव' : 'Experience'}</span>
              <span className="profile-data-val">
                {primarySkill.years_exp ? `${primarySkill.years_exp} ${lang === 'hi' ? 'वर्ष' : 'years'}` : '1-2 years'}
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'सीखने का माध्यम' : 'Learning Background'}</span>
              <span className="profile-data-val">{primarySkill.how_learned || 'Self-taught / Hands-on'}</span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'उपकरण / मशीन' : 'Tools Owned'}</span>
              <span className="profile-data-val">{primarySkill.tools_owned || 'Basic tools / Machine'}</span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'विशेष काम' : 'Specialization / Work Made'}</span>
              <span className="profile-data-val">{primarySkill.what_made || 'Custom work & alterations'}</span>
            </div>
          </div>
        </div>

        {/* Column 3: Work Preferences & Access Constraints */}
        <div className="profile-data-column">
          <div className="profile-column-heading">
            <DashIcon name="target" size={16} />
            <span>{lang === 'hi' ? 'कार्य प्राथमिकताएं' : 'Work Preferences & Limits'}</span>
          </div>
          <div className="profile-data-item-list">
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'अधिकतम यात्रा सीमा' : 'Max Commute'}</span>
              <span className="profile-data-val">
                <DashIcon name="location" size={13} className="inline-dash-icon" />{' '}
                {access.can_travel_km || 15} km ({access.travel_mode || 'bus'})
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'स्थान प्राथमिकता' : 'Location Mode'}</span>
              <span className="profile-data-val">
                <DashIcon name="home" size={13} className="inline-dash-icon" />{' '}
                {access.wfh_only
                  ? (lang === 'hi' ? 'केवल घर से काम (WFH Only)' : 'Home Work / WFH Only')
                  : (lang === 'hi' ? 'स्थानीय यात्रा व घर दोनों स्वीकार' : 'Open to Local Travel & WFH')}
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'कार्य समय व दिन' : 'Available Hours & Days'}</span>
              <span className="profile-data-val">
                {access.available_hours || 8} {lang === 'hi' ? 'घंटे/दिन' : 'hrs/day'} • {access.available_days || 'Mon-Sat'}
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'पारिवारिक देखभाल' : 'Caregiver Limits'}</span>
              <span className="profile-data-val">
                {access.childcare_limits
                  ? (lang === 'hi' ? 'हां (बच्चों/बुजुर्गों की जिम्मेदारी)' : 'Yes (Childcare/Family commitments)')
                  : (lang === 'hi' ? 'कोई नहीं' : 'None')}
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'शिक्षा व भाषा' : 'Education & Languages'}</span>
              <span className="profile-data-val">
                {[access.education_level || 'Middle School', access.literacy_level || 'Basic Hindi/English'].filter(Boolean).join(' • ')}
              </span>
            </div>
            <div className="profile-data-item">
              <span className="profile-data-label">{lang === 'hi' ? 'लक्ष्य' : 'Target Career Goal'}</span>
              <span className="profile-data-val">
                {goal.target_role || primarySkill.skill_id || 'Tailoring'} ({goal.goal_type || 'job'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecommendedSkillsSection({ primarySkillId, lang, t }) {
  const normalizedSkill = (primarySkillId || 'tailoring').toLowerCase()
  const recs = RECOMMENDED_SKILLS_MAP[normalizedSkill] || RECOMMENDED_SKILLS_MAP.tailoring

  return (
    <section className="dash-recommended-skills-section reveal-on-scroll">
      <div className="recommended-skills-header">
        <div className="recommended-skills-header-left">
          <div className="recommended-icon-bubble">
            <DashIcon name="bulb" size={24} />
          </div>
          <div>
            <h3>
              {lang === 'hi'
                ? 'अनुशंसित पूरक हुनर (समान कार्यक्षेत्र)'
                : 'Recommended Skills & Complementary Trades'}
            </h3>
            <p>
              {lang === 'hi'
                ? 'आपके हुनर के क्षेत्र से जुड़े अन्य कौशल जो आपकी आमदनी और काम के अवसरों को 30% से 60% तक बढ़ा सकते हैं।'
                : 'Related skills in your domain that increase your hiring demand and boost earning potential by 30% - 60%.'}
            </p>
          </div>
        </div>
        <Link to="/learn" className="btn-secondary btn-sm">
          {lang === 'hi' ? 'सभी कोर्स देखें' : 'Browse All Courses'} →
        </Link>
      </div>

      <div className="recommended-skills-grid">
        {recs.map((rec) => (
          <div key={rec.id} className="recommended-skill-card reveal-on-scroll container-interactive-card">
            <div>
              <span className="card-domain-badge">
                {lang === 'hi' ? rec.domain_hi : rec.domain_en}
              </span>
              <h4 className="rec-skill-title" style={{ marginTop: '10px' }}>
                {lang === 'hi' ? rec.title_hi : rec.title_en}
              </h4>
              <p className="rec-synergy-text" style={{ marginTop: '8px' }}>
                {lang === 'hi' ? rec.synergy_hi : rec.synergy_en}
              </p>
            </div>

            <div>
              <div className="rec-boost-pill">
                <DashIcon name="pay" size={13} className="inline-dash-icon" />
                {lang === 'hi' ? rec.boost_hi : rec.boost_en}
              </div>

              <div className="rec-card-footer" style={{ marginTop: '12px' }}>
                <span className="rec-duration">
                  <DashIcon name="clock" size={13} className="inline-dash-icon" />
                  {lang === 'hi' ? rec.duration_hi : rec.duration_en}
                </span>

                <Link to="/learn" className="btn-learn-skill">
                  {lang === 'hi' ? 'सीखें' : 'Learn'} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Dashboard() {
  const { lang, t, speak, stopSpeaking, isSpeaking } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Determine active view:
  // If route is /opportunities -> 'opportunities'
  // If route is /learn -> 'learn'
  // If route is /career -> 'career'
  // If route is /profile -> 'profile'
  // If route is /dashboard -> check searchParams.get('tab') or default to 'dashboard'
  const activeTab = (() => {
    if (location.pathname === '/opportunities') return 'opportunities'
    if (location.pathname === '/learn') return 'learn'
    if (location.pathname === '/career') return 'career'
    if (location.pathname === '/verification') return 'verification'
    if (location.pathname === '/profile') return 'profile'
    return searchParams.get('tab') || 'dashboard'
  })()

  const handleSpeakCurrentFeature = () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }

    let explanation = ''
    if (activeTab === 'dashboard') {
      explanation =
        lang === 'hi'
          ? 'डैशबोर्ड अवलोकन: यहाँ आपकी प्रोफ़ाइल, सत्यापित हुनर, स्थान, यात्रा सीमा और आपके कार्यक्षेत्र से जुड़े पूरक कौशल दिखाए गए हैं।'
          : 'Dashboard Overview: Here you can view your profile summary, verified skills, commute preferences, and recommended complementary skills in your trade domain.'
    } else if (activeTab === 'opportunities') {
      explanation =
        lang === 'hi'
          ? 'रोजगार व अवसर: यह स्क्रीन आपकी यात्रा सीमा, वाहन और घर से काम की सुविधा के अनुसार जाँचे गए स्थानीय रोजगार और अप्रेंटिसशिप दिखाती है। आप सीधे व्हाट्सएप पर नियोक्ता से संपर्क कर सकते हैं।'
          : 'Job Opportunities: Verified jobs and apprenticeships matched strictly to your trade, commute distance, and work-from-home preferences with direct WhatsApp employer contact.'
    } else if (activeTab === 'learn') {
      explanation =
        lang === 'hi'
          ? 'कोर्स लर्निंग: यहाँ सरकारी आईटीआई, पीएमकेवीवाई और यूट्यूब के 100% निःशुल्क और प्रमाणित कोर्स आपके हुनर के अनुसार दिखाए गए हैं ताकि आप नई तकनीक सीखकर अपनी कमाई बढ़ा सकें।'
          : 'Course Learning: Zero-cost and government certified courses from ITI, PMKVY, and skill academies sorted free-first to help you master new trade techniques and boost your income.'
    } else if (activeTab === 'career') {
      explanation =
        lang === 'hi'
          ? 'करियर मार्ग: यह 5-चरणीय रोडमैप है जो बुनियादी हुनर से लेकर मास्टर कारीगर या अपनी दुकान शुरू करने तक का रास्ता दिखाता है, जिसमें हर चरण का समय, आय लक्ष्य और साप्ताहिक कार्य शामिल हैं।'
          : 'Career Roadmap: An interactive 5-stage career progression pathway with milestone targets, estimated monthly income, and weekly actionable steps from foundation to enterprise.'
    } else if (activeTab === 'verification') {
      explanation =
        lang === 'hi'
          ? 'कार्य व कौशल वीडियो सत्यापन: यहाँ आप अपने पिछले काम का वीडियो अपलोड या रिकॉर्ड कर सकते हैं जिसमें आप अपने हुनर और औजारों के उपयोग को समझाते हैं। इससे आपको नियोक्ताओं द्वारा विश्वसनीय सत्यापित प्रमाण पत्र मिलता है।'
          : 'Work & Skill Video Verification: Here you can upload or record a video explaining your practical experience, tools used, and technical skill to earn a verified SkillSetu ProofPass Credential trusted by employers.'
    } else if (activeTab === 'profile') {
      explanation =
        lang === 'hi'
          ? 'प्रोफ़ाइल और प्राथमिकताएं: यहाँ आप अपना नाम, गांव या कस्बा, अधिकतम यात्रा दूरी और घर से काम करने की प्राथमिकता को आसानी से देख और बदल सकते हैं।'
          : 'Profile & Preferences: Review and update your personal details, village or town, maximum travel limits, and work-from-home preferences.'
    }

    speak(explanation)
  }

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Opportunities tab state
  const [oppsData, setOppsData] = useState({ bestMatch: [], relatedSkills: [], nearbyOpportunities: [] })
  const [oppFilterKind, setOppFilterKind] = useState('all')
  const [oppFilterWfh, setOppFilterWfh] = useState(false)
  const [contactModalOpp, setContactModalOpp] = useState(null)
  const [appliedIds, setAppliedIds] = useState(new Set())

  // Learn tab state
  const [learnData, setLearnData] = useState({ online: [], offline: [], all: [] })
  const [learnMode, setLearnMode] = useState('all')
  const [maxCostFilter, setMaxCostFilter] = useState(1000)

  // Career Roadmap tab state
  const [roadmap, setRoadmap] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

  // Verification tab state
  const [verifications, setVerifications] = useState([])
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyTitle, setVerifyTitle] = useState('')
  const [verifyTrade, setVerifyTrade] = useState('electrician')
  const [verifyExp, setVerifyExp] = useState(2)
  const [verifyDesc, setVerifyDesc] = useState('')
  const [verifyTools, setVerifyTools] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('')
  const [videoName, setVideoName] = useState('')
  const [videoDuration, setVideoDuration] = useState('01:30')
  const [verifySuccessMsg, setVerifySuccessMsg] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const mediaRecorderRef = useRef(null)
  const webcamVideoRef = useRef(null)
  const streamRef = useRef(null)
  const timerIntervalRef = useRef(null)

  // Profile edit state
  const [editName, setEditName] = useState('')
  const [editVillage, setEditVillage] = useState('')
  const [editTravelKm, setEditTravelKm] = useState(15)
  const [editWfhOnly, setEditWfhOnly] = useState(false)
  const [editTrade, setEditTrade] = useState('tailoring')
  const [editLevel, setEditLevel] = useState('Intermediate')
  const [editGoalType, setEditGoalType] = useState('job')
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => {
    loadAllData()
  }, [activeTab, oppFilterKind, oppFilterWfh, learnMode, maxCostFilter])

  const loadAllData = async (targetTradeOverride) => {
    setLoading(true)
    try {
      const localProf = (() => {
        try {
          const raw = localStorage.getItem('skillsetu-profile')
          return raw ? JSON.parse(raw) : null
        } catch (_) {
          return null
        }
      })()

      const localUser = (() => {
        try {
          const raw = localStorage.getItem('skillsetu-user')
          return raw ? JSON.parse(raw) : null
        } catch (_) {
          return null
        }
      })()

      const activeRole =
        targetTradeOverride ||
        localProf?.skills?.[0]?.skill_id ||
        localProf?.goal?.target_role ||
        editTrade ||
        'tailoring'

      const [profRes, oppsRes, appliedRes, learnRes, roadmapRes, verifyRes] = await Promise.allSettled([
        apiGetProfile(),
        apiGetOpportunities({
          role: activeRole,
          kind: oppFilterKind !== 'all' ? oppFilterKind : undefined,
          wfh: oppFilterWfh ? 1 : undefined,
        }),
        apiGetApplied(),
        apiGetLearningResources({
          role: activeRole,
          mode: learnMode !== 'all' ? learnMode : undefined,
          maxCost: maxCostFilter,
        }),
        apiGetCareerRoadmap(activeRole),
        apiGetVerifications(),
      ])

      if (profRes.status === 'fulfilled' && profRes.value) {
        const backendProf = profRes.value
        const combinedUser = {
          ...(localProf?.user || {}),
          ...(localUser || {}),
          ...(backendProf.user || {}),
        }
        if (
          localProf?.user?.name &&
          (!combinedUser.name || combinedUser.name === 'New User' || combinedUser.name === 'SkillSetu User')
        ) {
          combinedUser.name = localProf.user.name
        }
        if (localProf?.user?.village_town && !combinedUser.village_town) {
          combinedUser.village_town = localProf.user.village_town
        }
        if (localProf?.user?.district && !combinedUser.district) {
          combinedUser.district = localProf.user.district
        }
        if (localProf?.user?.state && !combinedUser.state) {
          combinedUser.state = localProf.user.state
        }
        if (localProf?.user?.pincode && !combinedUser.pincode) {
          combinedUser.pincode = localProf.user.pincode
        }
        if (localProf?.user?.gender && !combinedUser.gender) {
          combinedUser.gender = localProf.user.gender
        }
        if (localProf?.user?.age_range && !combinedUser.age_range) {
          combinedUser.age_range = localProf.user.age_range
        }

        const combinedAccess = {
          ...(localProf?.accessProfile || {}),
          ...(backendProf.accessProfile || {}),
        }

        const combinedSkills =
          backendProf.skills && backendProf.skills.length > 0
            ? backendProf.skills
            : localProf?.skills || []

        const combinedGoal = {
          ...(localProf?.goal || {}),
          ...(backendProf.goal || {}),
        }

        const completeProfile = {
          user: combinedUser,
          accessProfile: combinedAccess,
          skills: combinedSkills,
          goal: combinedGoal,
        }

        setProfile(completeProfile)
        setEditName(combinedUser.name || '')
        setEditVillage(combinedUser.village_town || '')
        setEditTravelKm(combinedAccess.can_travel_km || 15)
        setEditWfhOnly(Boolean(combinedAccess.wfh_only))

        const primarySkillId =
          targetTradeOverride ||
          combinedSkills?.[0]?.skill_id ||
          combinedGoal?.target_role ||
          'tailoring'
        setEditTrade(primarySkillId)
        setEditLevel(combinedSkills?.[0]?.level || 'Intermediate')
        setEditGoalType(combinedGoal?.goal_type || 'job')
      }

      if (appliedRes.status === 'fulfilled' && appliedRes.value?.applications) {
        setAppliedIds(new Set(appliedRes.value.applications.map((a) => a.opportunity_id)))
      }

      if (oppsRes.status === 'fulfilled' && oppsRes.value) {
        setOppsData(oppsRes.value)
      }

      if (learnRes.status === 'fulfilled' && learnRes.value) {
        setLearnData(learnRes.value)
      }

      if (roadmapRes.status === 'fulfilled' && roadmapRes.value?.roadmap) {
        setRoadmap(roadmapRes.value.roadmap)
        setCompletedSteps(roadmapRes.value.roadmap.completedSteps || [])
      }

      if (verifyRes.status === 'fulfilled' && verifyRes.value?.verifications) {
        setVerifications(verifyRes.value.verifications)
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName })
  }

  // Handle Apply & Contact modal
  const handleApply = async (opp) => {
    try {
      const res = await apiApplyOpportunity(opp.id)
      setAppliedIds((prev) => new Set([...prev, opp.id]))
      setContactModalOpp({ ...opp, contact: res.contact })
    } catch (err) {
      alert(err.message || 'Failed to submit application')
    }
  }

  // Handle ticking off roadmap step
  const handleToggleStep = async (stepNumber) => {
    if (!roadmap?.targetRole) return
    try {
      const res = await apiToggleRoadmapStep(roadmap.targetRole, stepNumber)
      if (res.completedSteps) {
        setCompletedSteps(res.completedSteps)
        setRoadmap((prev) => ({
          ...prev,
          currentStage: res.currentStage,
          completedSteps: res.completedSteps,
        }))
      }
    } catch (err) {
      console.error('Failed to toggle roadmap step', err)
    }
  }

  // Sample demonstration video loader
  const handleSelectSampleVideo = () => {
    setVerifyTitle(
      lang === 'hi'
        ? '3-फेज इंडस्ट्रियल डिस्ट्रीब्यूशन पैनल व एमसीबी वायरिंग कार्य'
        : '3-Phase Industrial Distribution Panel & Protection Wiring'
    )
    setVerifyTrade(editTrade || 'electrician')
    setVerifyExp(2.5)
    setVerifyDesc(
      lang === 'hi'
        ? 'इस वीडियो में मैंने 63A 4-पोल आइसोलेटर, आरसीसीबी और लोड बैलेंसिंग वायरिंग का प्रदर्शन किया है। सभी केबलों पर कॉपर लक्स लगाकर टॉर्क रिंच से कसा गया है और 0.8 ओम अर्थ लूप टेस्ट किया गया है।'
        : 'In this video demonstration, I explain the installation of a 63A 4-pole isolator, RCCB protection, and phase load balancing with proper copper crimped lugs, followed by an earth loop impedance verification of 0.8 ohms.'
    )
    setVerifyTools(
      lang === 'hi'
        ? 'मल्टीमीटर, 1000V इंसुलेटेड स्क्रूड्राइवर, हाइड्रोलिक क्रिम्पर, अर्थ टेस्टर'
        : 'Digital Multimeter, 1000V Insulated Screwdrivers, Hydraulic Crimper, Earth Resistance Tester'
    )
    setVideoPreviewUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')
    setVideoName('demo_panel_wiring_proof.mp4')
    setVideoDuration('01:42')
  }

  // File upload handler
  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoFile(file)
    setVideoName(file.name)
    const localUrl = URL.createObjectURL(file)
    setVideoPreviewUrl(localUrl)
  }

  // Camera recording handlers
  const handleStartCameraRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert(lang === 'hi' ? 'आपका ब्राउज़र कैमरा रिकॉर्डिंग का समर्थन नहीं करता।' : 'Browser does not support camera recording.')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream
        webcamVideoRef.current.play()
      }
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      const chunks = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setVideoPreviewUrl(url)
        setVideoFile(blob)
        setVideoName(`recorded_skill_proof_${Date.now()}.webm`)
        setVideoDuration('01:15')
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingSeconds(0)
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Camera access error:', err)
      alert(lang === 'hi' ? 'कैमरा या माइक्रोफोन का उपयोग करने की अनुमति दें।' : 'Please allow camera and microphone access.')
    }
  }

  const handleStopCameraRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }

  // Submit verification
  const handleSubmitVerification = async (e) => {
    e.preventDefault()
    if (!verifyTitle.trim() || !verifyDesc.trim()) {
      alert(lang === 'hi' ? 'कृपया कार्य का शीर्षक और विवरण भरें।' : 'Please enter project title and description.')
      return
    }
    setVerifyLoading(true)
    try {
      const payload = {
        title: verifyTitle,
        trade: verifyTrade,
        experience_years: Number(verifyExp) || 1,
        description: verifyDesc,
        tools_used: verifyTools,
        video_url: videoPreviewUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        video_name: videoName || 'candidate_proof_video.mp4',
        video_duration: videoDuration || '01:30',
      }
      const res = await apiSubmitVerification(payload)
      if (res.verification) {
        setVerifications((prev) => [res.verification, ...prev])
        setVerifySuccessMsg(
          lang === 'hi'
            ? `सफलतापूर्वक सत्यापित! प्रमाणपत्र आईडी: ${res.verification.certificate_id} (स्कोर: ${res.verification.verification_score}%)`
            : `Verified Successfully! Certificate ID: ${res.verification.certificate_id} (Score: ${res.verification.verification_score}%)`
        )
        // Reset form inputs
        setVerifyTitle('')
        setVerifyDesc('')
        setVerifyTools('')
        setVideoPreviewUrl('')
        setVideoFile(null)
      }
    } catch (err) {
      alert(err.message || 'Failed to submit verification')
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleDeleteVerification = async (id) => {
    if (!window.confirm(lang === 'hi' ? 'क्या आप इस वीडियो सत्यापन को हटाना चाहते हैं?' : 'Delete this verified work proof?')) return
    try {
      await apiDeleteVerification(id)
      setVerifications((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete')
    }
  }

  // Save profile changes with complete skills & goal synchronization
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault()
    setSaveStatus(lang === 'hi' ? 'सेव हो रहा है...' : 'Saving...')
    try {
      const updatedSkills = [{ skill_id: editTrade, level: editLevel }]
      const updatedGoal = { target_role: editTrade, goal_type: editGoalType }
      const updatedUser = { name: editName, village_town: editVillage }
      const updatedAccess = { can_travel_km: editTravelKm, wfh_only: editWfhOnly }

      await apiSaveProfile({
        user: updatedUser,
        accessProfile: updatedAccess,
        skills: updatedSkills,
        goal: updatedGoal,
      })

      // Synchronize client-side storage immediately
      try {
        const stored = JSON.parse(localStorage.getItem('skillsetu-profile') || '{}')
        localStorage.setItem(
          'skillsetu-profile',
          JSON.stringify({
            ...stored,
            user: { ...(stored.user || {}), ...updatedUser },
            accessProfile: { ...(stored.accessProfile || {}), ...updatedAccess },
            skills: updatedSkills,
            goal: updatedGoal,
          })
        )

        const storedUser = JSON.parse(localStorage.getItem('skillsetu-user') || '{}')
        localStorage.setItem(
          'skillsetu-user',
          JSON.stringify({
            ...storedUser,
            ...updatedUser,
            skills: updatedSkills,
            target_role: editTrade,
          })
        )
      } catch (_) {}

      setSaveStatus(
        lang === 'hi'
          ? 'सफलतापूर्वक सुरक्षित! आपके कोर्स, रोडमैप व नौकरियां अपडेट हो गए हैं।'
          : 'Saved! Your courses, roadmap, and opportunities are updated.'
      )
      setTimeout(() => setSaveStatus(''), 3500)
      await loadAllData(editTrade)
    } catch (err) {
      setSaveStatus(err.message || 'Error saving profile')
    }
  }

  const primarySkill = profile?.skills?.[0]
  const skillLevel = primarySkill?.level || 'Intermediate'

  // Calculate profile completeness
  const completenessScore = profile
    ? Math.min(
        100,
        (profile.user?.name ? 25 : 0) +
          (profile.accessProfile?.can_travel_km ? 25 : 0) +
          (profile.skills?.length > 0 ? 25 : 0) +
          (profile.goal?.target_role ? 25 : 0)
      )
    : 75

  return (
    <main id="main" className="dashboard-page w">
      {/* Top Profile Summary Bar */}
      <section className="dash-hero-card">
        <div className="dash-hero-left">
          <div className="user-avatar-circle">
            {profile?.user?.name ? profile.user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="user-info-text">
            <h2>{t('dashboard.welcome', { name: profile?.user?.name || 'Partner' })}</h2>
            <div className="user-meta-chips">
              <span className="meta-chip">
                <DashIcon name="location" size={14} className="inline-dash-icon" />
                {profile?.user?.village_town || 'Pune'}
              </span>
              <span className="meta-chip">
                <TradeIcon id={primarySkill?.skill_id || 'tailoring'} size={14} className="inline-dash-icon" />
                {lang === 'hi' ? 'हुनर: ' : 'Skill: '}
                <strong>{primarySkill?.skill_id || 'Tailoring'}</strong>
              </span>
              <span className={`level-badge-pill ${skillLevel.toLowerCase()}`}>
                <DashIcon name="star" size={12} className="inline-dash-icon" />
                {t('dashboard.level')}: {skillLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="dash-hero-right">
          <button
            type="button"
            className={`dash-feature-listen-btn ${isSpeaking ? 'speaking' : ''}`}
            onClick={handleSpeakCurrentFeature}
            title={lang === 'hi' ? 'वर्तमान स्क्रीन फीचर सुनकर समझें' : 'Listen to active screen feature'}
            aria-label={lang === 'hi' ? 'फीचर विवरण सुनें' : 'Listen to feature explanation'}
          >
            <DashIcon name={isSpeaking ? 'stop' : 'speaker'} size={18} />
            <div className="feature-listen-text-wrap">
              <span className="feature-listen-title">
                {isSpeaking
                  ? (lang === 'hi' ? 'रोकें' : 'Stop')
                  : (lang === 'hi' ? 'फीचर सुनें' : 'Listen to Feature')}
              </span>
              <span className="feature-listen-subtitle">
                {activeTab === 'learn'
                  ? (lang === 'hi' ? 'कोर्स लर्निंग' : 'Course Learning')
                  : activeTab === 'opportunities'
                  ? (lang === 'hi' ? 'रोजगार व अवसर' : 'Opportunities')
                  : activeTab === 'career'
                  ? (lang === 'hi' ? 'करियर मार्ग' : 'Career Path')
                  : activeTab === 'verification'
                  ? (lang === 'hi' ? 'हुनर वीडियो सत्यापन' : 'Work Video Verification')
                  : activeTab === 'profile'
                  ? (lang === 'hi' ? 'प्रोफ़ाइल व सेटिंग्स' : 'Profile & Settings')
                  : (lang === 'hi' ? 'डैशबोर्ड अवलोकन' : 'Dashboard Overview')}
              </span>
            </div>
          </button>

          <div className="completeness-box">
            <div className="completeness-circle-wrap">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle-fill"
                  strokeDasharray={`${completenessScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="circle-percentage">
                  {completenessScore}%
                </text>
              </svg>
            </div>
            <div className="completeness-label">
              <strong>{t('dashboard.completeness')}</strong>
              <span>{t('dashboard.completenessHelp')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive In-Page Navigation Bar */}
      <nav className="dash-subnav-bar" aria-label={lang === 'hi' ? 'डैशबोर्ड नेविगेशन' : 'Dashboard navigation'}>
        {[
          { id: 'dashboard', path: '/dashboard', label: lang === 'hi' ? 'डैशबोर्ड अवलोकन' : 'Dashboard Overview', icon: 'home' },
          {
            id: 'opportunities',
            path: '/opportunities',
            label: lang === 'hi' ? 'रोजगार व अवसर' : 'Opportunities',
            icon: 'briefcase',
            badge: (oppsData.bestMatch?.length || 0) + (oppsData.relatedSkills?.length || 0)
          },
          { id: 'learn', path: '/learn', label: lang === 'hi' ? 'कोर्स लर्निंग' : 'Course Learning', icon: 'book' },
          { id: 'career', path: '/career', label: lang === 'hi' ? 'करियर मार्ग' : 'Career Path', icon: 'target' },
          {
            id: 'verification',
            path: '/verification',
            label: lang === 'hi' ? 'हुनर सत्यापन' : 'Work Verification',
            icon: 'shield-check',
            badge: verifications.length > 0 ? verifications.length : 'New'
          },
          { id: 'profile', path: '/profile', label: lang === 'hi' ? 'प्रोफ़ाइल व सेटिंग्स' : 'Profile & Settings', icon: 'user' },
        ].map((tabItem) => {
          const isActive = activeTab === tabItem.id
          return (
            <Link
              key={tabItem.id}
              to={tabItem.path}
              className={`dash-subnav-btn ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <DashIcon name={tabItem.icon} size={17} />
              <span>{tabItem.label}</span>
              {typeof tabItem.badge === 'number' && tabItem.badge > 0 ? (
                <span className="dash-subnav-badge">{tabItem.badge}</span>
              ) : typeof tabItem.badge === 'string' ? (
                <span className="dash-subnav-badge-text">{tabItem.badge}</span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* ================= OVERVIEW (when on /dashboard) ================= */}
      {activeTab === 'dashboard' && (
        <section className="dash-overview-hub">
          <div className="overview-cards-grid">
            {/* Opportunities Card */}
            <div className="overview-feature-card reveal-on-scroll container-interactive-card">
              <div className="overview-card-header">
                <div className="overview-icon-badge">
                  <DashIcon name="briefcase" size={24} />
                </div>
                <div>
                  <h3>{t('nav.opportunities')}</h3>
                  <p>
                    {t('dashboard.tabs.opportunities', {
                      count: (oppsData.bestMatch?.length || 0) + (oppsData.relatedSkills?.length || 0),
                    })}
                  </p>
                </div>
              </div>
              <p className="overview-card-desc">
                {lang === 'hi'
                  ? 'आपके हुनर, स्थान और यात्रा सीमा के आधार पर छांटे गए वास्तविक काम।'
                  : 'Verified jobs and apprenticeships matched to your trade and commute limits.'}
              </p>
              <Link to="/opportunities" className="action-btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                {lang === 'hi' ? 'अवसर देखें →' : 'View Opportunities →'}
              </Link>
            </div>

            {/* Course Learning Card */}
            <div className="overview-feature-card reveal-on-scroll container-interactive-card">
              <div className="overview-card-header">
                <div className="overview-icon-badge">
                  <DashIcon name="book" size={24} />
                </div>
                <div>
                  <h3>{t('nav.learn')}</h3>
                  <p>{t('dashboard.tabs.learn', { count: learnData.all?.length || 0 })}</p>
                </div>
              </div>
              <p className="overview-card-desc">
                {lang === 'hi'
                  ? 'सरकारी आईटीआई, पीएमकेवीवाई और ऑनलाइन कौशल कोर्स (शून्य खर्च पहले)।'
                  : 'Government ITI, PMKVY, and certified online video courses sorted free-first.'}
              </p>
              <Link to="/learn" className="action-btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                {lang === 'hi' ? 'कोर्स देखें →' : 'Explore Course Learning →'}
              </Link>
            </div>

            {/* Career Path Card */}
            <div className="overview-feature-card reveal-on-scroll container-interactive-card">
              <div className="overview-card-header">
                <div className="overview-icon-badge">
                  <DashIcon name="career" size={24} />
                </div>
                <div>
                  <h3>{t('nav.career')}</h3>
                  <p>{roadmap ? `Stage ${roadmap.currentStage} / 5` : '5 Stages'}</p>
                </div>
              </div>
              <p className="overview-card-desc">
                {lang === 'hi'
                  ? 'बुनियादी काम से लेकर मास्टर कारीगर या स्वरोजगार का चरणबद्ध रोडमैप।'
                  : 'Step-by-step roadmap with income milestones and weekly action targets.'}
              </p>
              <Link to="/career" className="action-btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                {lang === 'hi' ? 'करियर मार्ग देखें →' : 'View Career Roadmap →'}
              </Link>
            </div>

            {/* Work & Skill Video Verification Card */}
            <div className="overview-feature-card reveal-on-scroll container-interactive-card">
              <div className="overview-card-header">
                <div className="overview-icon-badge" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                  <DashIcon name="shield-check" size={24} />
                </div>
                <div>
                  <h3>{lang === 'hi' ? 'हुनर वीडियो सत्यापन' : 'Work Verification'}</h3>
                  <p>{verifications.length > 0 ? (lang === 'hi' ? `${verifications.length} कार्य सत्यापित` : `${verifications.length} Proofs Verified`) : (lang === 'hi' ? 'ProofPass प्रमाण' : 'Get Verified')}</p>
                </div>
              </div>
              <p className="overview-card-desc">
                {lang === 'hi'
                  ? 'अपने पिछले काम का 1 मिनट का वीडियो अपलोड या रिकॉर्ड करें। नियोक्ताओं द्वारा मान्य ProofPass प्रमाण पत्र पाएं।'
                  : 'Record or upload a 1-min video explaining previous work done. Earn an employer-trusted ProofPass credential.'}
              </p>
              <Link to="/verification" className="action-btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                {lang === 'hi' ? 'वीडियो सत्यापन खोलें →' : 'View Video Verification →'}
              </Link>
            </div>
          </div>

          {/* Comprehensive User Profile & Preferences Overview */}
          <UserProfileDataCard
            profile={profile}
            lang={lang}
            t={t}
            onEditClick={() => setTab('profile')}
          />

          {/* Recommended Skills & Complementary Trades in Same Domain */}
          <RecommendedSkillsSection
            primarySkillId={primarySkill?.skill_id || 'tailoring'}
            lang={lang}
            t={t}
          />

          {/* Quick Profile Settings */}
          <div className="profile-editor-card" style={{ marginTop: '12px' }}>
            <form onSubmit={handleSaveProfile} className="profile-edit-card">
              <div className="modal-header" style={{ marginBottom: '16px' }}>
                <h3>{t('dashboard.profile.title')}</h3>
                {saveStatus && <span className="status-pill">{saveStatus}</span>}
              </div>

              <div className="form-grid-2">
                <label className="input-group">
                  <span>{t('dashboard.profile.name')}</span>
                  <input
                    type="text"
                    className="base-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </label>

                <label className="input-group">
                  <span>{t('dashboard.profile.village')}</span>
                  <input
                    type="text"
                    className="base-input"
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                  />
                </label>

                <label className="input-group">
                  <span>{t('dashboard.profile.travelKm', { km: editTravelKm })}</span>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="1"
                    value={editTravelKm}
                    onChange={(e) => setEditTravelKm(Number(e.target.value))}
                    className="range-input"
                  />
                </label>

                <label className="filter-toggle-wfh" style={{ alignSelf: 'center', marginTop: '14px' }}>
                  <input
                    type="checkbox"
                    checked={editWfhOnly}
                    onChange={(e) => setEditWfhOnly(e.target.checked)}
                  />
                  <span>
                    <DashIcon name="home" size={14} className="inline-dash-icon" />
                    {t('dashboard.profile.wfhOnly')}
                  </span>
                </label>
              </div>

              <button type="submit" className="action-btn-primary">
                {t('dashboard.profile.saveBtn')}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ================= TAB 1: OPPORTUNITIES ================= */}
      {activeTab === 'opportunities' && (
        <section className="dash-tab-content">
          {/* Filters Bar */}
          <div className="opp-filters-card">
            <div className="filter-pill-scroll">
              {[
                { id: 'all', label: t('dashboard.opps.filterAll') },
                { id: 'job', label: t('dashboard.opps.filterJob') },
                { id: 'apprenticeship', label: t('dashboard.opps.filterApprentice') },
                { id: 'self_employment', label: t('dashboard.opps.filterBusiness') },
                { id: 'gig', label: t('dashboard.opps.filterGig') },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`filter-pill ${oppFilterKind === f.id ? 'active' : ''}`}
                  onClick={() => setOppFilterKind(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <label className="filter-toggle-wfh">
              <input
                type="checkbox"
                checked={oppFilterWfh}
                onChange={(e) => setOppFilterWfh(e.target.checked)}
              />
              <span>
                <DashIcon name="home" size={14} className="inline-dash-icon" />
                {t('dashboard.opps.filterWfh')}
              </span>
            </label>
          </div>

          {loading ? (
            <SkeletonCards count={4} />
          ) : (
            <>
              {/* Bucket A: Best Matches in Skill */}
              {oppsData.bestMatch?.length > 0 && (
                <div className="opp-bucket-section">
                  <h3 className="bucket-title">
                    <DashIcon name="target" size={18} className="inline-dash-icon" />
                    {t('dashboard.opps.bucketBest')} ({oppsData.bestMatch.length})
                  </h3>
                  <div className="opp-cards-grid">
                    {oppsData.bestMatch.map((opp) => (
                      <OpportunityCard
                        key={opp.id}
                        opp={opp}
                        lang={lang}
                        t={t}
                        isApplied={appliedIds.has(opp.id)}
                        onApply={() => handleApply(opp)}
                        onSpeak={() =>
                          speak(
                            `${lang === 'hi' ? opp.title_hi : opp.title_en}. ${lang === 'hi' ? opp.posting_hi : opp.posting_en}`
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bucket B: Matches in Related Skills */}
              {oppsData.relatedSkills?.length > 0 && (
                <div className="opp-bucket-section">
                  <h3 className="bucket-title">
                    <DashIcon name="bulb" size={18} className="inline-dash-icon" />
                    {t('dashboard.opps.bucketRelated')} ({oppsData.relatedSkills.length})
                  </h3>
                  <div className="opp-cards-grid">
                    {oppsData.relatedSkills.map((opp) => (
                      <OpportunityCard
                        key={opp.id}
                        opp={opp}
                        lang={lang}
                        t={t}
                        isApplied={appliedIds.has(opp.id)}
                        onApply={() => handleApply(opp)}
                        onSpeak={() => speak(`${lang === 'hi' ? opp.title_hi : opp.title_en}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bucket C: Nearby Opportunities */}
              {oppsData.nearbyOpportunities?.length > 0 && (
                <div className="opp-bucket-section">
                  <h3 className="bucket-title">
                    <DashIcon name="location" size={18} className="inline-dash-icon" />
                    {t('dashboard.opps.bucketNearby')} ({oppsData.nearbyOpportunities.length})
                  </h3>
                  <div className="opp-cards-grid">
                    {oppsData.nearbyOpportunities.map((opp) => (
                      <OpportunityCard
                        key={opp.id}
                        opp={opp}
                        lang={lang}
                        t={t}
                        isApplied={appliedIds.has(opp.id)}
                        onApply={() => handleApply(opp)}
                        onSpeak={() => speak(`${lang === 'hi' ? opp.title_hi : opp.title_en}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {oppsData.bestMatch?.length === 0 &&
                oppsData.relatedSkills?.length === 0 &&
                oppsData.nearbyOpportunities?.length === 0 && (
                  <div className="empty-state-box">
                    <p>{t('dashboard.opps.noMatches')}</p>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setOppFilterKind('all')
                        setOppFilterWfh(false)
                      }}
                    >
                      {lang === 'hi' ? 'फ़िल्टर हटाएं' : 'Reset Filters'}
                    </button>
                  </div>
                )}
            </>
          )}
        </section>
      )}

      {/* ================= TAB 2: LEARN (Online & Offline, Free First!) ================= */}
      {activeTab === 'learn' && (
        <section className="dash-tab-content">
          <div className="learn-header-card">
            <div>
              <h3>{t('dashboard.learn.title')}</h3>
              <p className="subtext">{t('dashboard.learn.subtitle')}</p>
            </div>

            <div className="learn-controls-row">
              {/* Online / Offline / All Toggle */}
              <div className="learn-toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${learnMode === 'all' ? 'active' : ''}`}
                  onClick={() => setLearnMode('all')}
                >
                  {t('dashboard.learn.toggleAll')}
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${learnMode === 'online' ? 'active' : ''}`}
                  onClick={() => setLearnMode('online')}
                >
                  <DashIcon name="globe" size={13} className="inline-dash-icon" />
                  {t('dashboard.learn.toggleOnline')}
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${learnMode === 'offline' ? 'active' : ''}`}
                  onClick={() => setLearnMode('offline')}
                >
                  <DashIcon name="building" size={13} className="inline-dash-icon" />
                  {t('dashboard.learn.toggleOffline')}
                </button>
              </div>

              {/* Cost slider: free first */}
              <div className="cost-filter-wrap">
                <label>
                  <span>{t('dashboard.learn.costSlider', { cost: maxCostFilter })}</span>
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={100}
                    value={maxCostFilter}
                    onChange={(e) => setMaxCostFilter(Number(e.target.value))}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Active Connected Trade Pill */}
          <div className="learn-active-trade-pill">
            <div className="learn-trade-pill-left">
              <div className="trade-pill-icon-bubble">
                <TradeIcon id={editTrade} size={18} />
              </div>
              <div>
                <span className="pill-small-tag">
                  {lang === 'hi' ? 'सक्रिय कोर्स ट्रेड (Active Trade)' : 'Connected Course Trade'}
                </span>
                <strong className="pill-trade-title">
                  {lang === 'hi'
                    ? AVAILABLE_TRADES.find((t) => t.id === editTrade)?.hi || editTrade
                    : AVAILABLE_TRADES.find((t) => t.id === editTrade)?.en || editTrade}
                </strong>
              </div>
            </div>
            <button
              type="button"
              className="btn-change-trade-link"
              onClick={() => setTab('profile')}
              title={lang === 'hi' ? 'प्रोफ़ाइल में ट्रेड बदलें' : 'Change Trade in Profile'}
            >
              <DashIcon name="edit" size={13} className="inline-dash-icon" />
              {lang === 'hi' ? 'ट्रेड बदलें' : 'Change Trade'} →
            </button>
          </div>

          {loading ? (
            <SkeletonCards count={4} />
          ) : (
            <div className="resources-cards-grid">
              {learnData.all?.length === 0 ? (
                <div className="empty-state-box" style={{ gridColumn: '1 / -1' }}>
                  <p>{lang === 'hi' ? 'इस फ़िल्टर में कोई कोर्स नहीं मिला।' : 'No resources found in this price range.'}</p>
                  <button type="button" className="btn-secondary" onClick={() => setMaxCostFilter(1000)}>
                    {lang === 'hi' ? 'सभी कोर्स देखें' : 'Show All'}
                  </button>
                </div>
              ) : (
                learnData.all?.map((res) => (
                  <div key={res.id} className="resource-card">
                    <div className="res-top-badge-row">
                      <span className={`badge-cost ${res.cost === 0 ? 'free' : 'low-cost'}`}>
                        {res.cost === 0 ? t('dashboard.learn.freeBadge') : `₹${res.cost}`}
                      </span>
                      <span className="badge-mode">
                        {res.mode === 'online' ? (
                          <>
                            <DashIcon name="globe" size={12} className="inline-dash-icon" /> Online
                          </>
                        ) : (
                          <>
                            <DashIcon name="building" size={12} className="inline-dash-icon" /> In-person Center
                          </>
                        )}
                      </span>
                    </div>

                    <h4 className="res-title">{lang === 'hi' ? res.title_hi : res.title_en}</h4>
                    <p className="res-provider">
                      <DashIcon name="building" size={14} className="inline-dash-icon" />
                      {lang === 'hi' ? res.provider_hi : res.provider_en}
                    </p>

                    <div className="res-meta-row">
                      <span>
                        <DashIcon name="clock" size={13} className="inline-dash-icon" />
                        {lang === 'hi' ? res.duration_hi : res.duration_en}
                      </span>
                      {res.distance_km > 0 && (
                        <span>
                          <DashIcon name="location" size={13} className="inline-dash-icon" />
                          {t('dashboard.learn.distance', { km: res.distance_km })}
                        </span>
                      )}
                    </div>

                    {res.address_hi && (
                      <p className="res-address">
                        <DashIcon name="location" size={13} className="inline-dash-icon" />
                        {lang === 'hi' ? res.address_hi : res.address_en}
                      </p>
                    )}

                    <div className="res-action-row">
                      {res.link ? (
                        <a
                          href={res.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary btn-sm"
                        >
                          {t('dashboard.learn.viewBtn')} →
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => alert(`${res.provider_hi}: ${res.address_hi}`)}
                        >
                          <DashIcon name="location" size={13} className="inline-dash-icon" />
                          {t('dashboard.learn.directionsBtn')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 3: CAREER ROADMAP (5 Stages) ================= */}
      {activeTab === 'career' && (
        <section className="dash-tab-content">
          <div className="career-header-card">
            <h3>{t('dashboard.career.title', { role: roadmap?.title_en || 'Tailoring' })}</h3>
            <p className="subtext">{t('dashboard.career.subtitle')}</p>
          </div>

          {loading ? (
            <SkeletonCards count={3} />
          ) : (
            <>
              <div className="vertical-timeline">
                {roadmap?.stages?.map((stage) => {
                  const isCurrent = roadmap.currentStage === stage.stage
                  const isDone = completedSteps.includes(stage.stage)

                  return (
                    <div
                      key={stage.stage}
                      className={`timeline-stage-card ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}`}
                    >
                      <div className="stage-left-spine">
                        <div className="stage-number-bubble">
                          {isDone ? <DashIcon name="check" size={14} /> : stage.stage}
                        </div>
                      </div>

                      <div className="stage-card-body">
                        <div className="stage-title-row">
                          <h4>{lang === 'hi' ? stage.title_hi : stage.title_en}</h4>
                          {isCurrent && (
                            <span className="current-stage-tag">
                              <DashIcon name="star" size={12} className="inline-dash-icon" />
                              In Progress
                            </span>
                          )}
                        </div>

                        <div className="stage-details-grid">
                          <div className="detail-item">
                            <strong>
                              <DashIcon name="book" size={14} className="inline-dash-icon" />
                              {t('dashboard.career.learnLabel')}
                            </strong>
                            <p>{lang === 'hi' ? stage.what_to_learn_hi : stage.what_to_learn_en}</p>
                          </div>

                          <div className="detail-item">
                            <strong>
                              <DashIcon name="tag" size={14} className="inline-dash-icon" />
                              {t('dashboard.career.practiceLabel')}
                            </strong>
                            <p>{lang === 'hi' ? stage.what_to_practise_hi : stage.what_to_practise_en}</p>
                          </div>

                          <div className="detail-item">
                            <strong>
                              <DashIcon name="pay" size={14} className="inline-dash-icon" />
                              {t('dashboard.career.incomeLabel')}
                            </strong>
                            <p className="highlight-income">
                              {lang === 'hi' ? stage.income_range_hi : stage.income_range_en}
                            </p>
                          </div>

                          <div className="detail-item">
                            <strong>
                              <DashIcon name="briefcase" size={14} className="inline-dash-icon" />
                              {t('dashboard.career.toolsLabel')}
                            </strong>
                            <p>{lang === 'hi' ? stage.tools_needed_hi : stage.tools_needed_en}</p>
                          </div>

                          <div className="detail-item full-width-item free-action-box">
                            <strong>
                              <DashIcon name="target" size={14} className="inline-dash-icon" />
                              {t('dashboard.career.weeklyActionLabel')}
                            </strong>
                            <p>{lang === 'hi' ? stage.weekly_action_hi : stage.weekly_action_en}</p>
                          </div>

                          <div className="detail-item full-width-item tips-box">
                            <strong>
                              <DashIcon name="bulb" size={14} className="inline-dash-icon" />
                              {t('dashboard.career.businessTipsLabel')}
                            </strong>
                            <p>{lang === 'hi' ? stage.business_tips_hi : stage.business_tips_en}</p>
                          </div>

                          <div className="detail-item full-width-item schemes-box">
                            <strong>
                              <DashIcon name="building" size={14} className="inline-dash-icon" />
                              {t('dashboard.career.schemesLabel')}
                            </strong>
                            <p>{lang === 'hi' ? stage.schemes_hi : stage.schemes_en}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`btn-stage-toggle ${isDone ? 'completed' : ''}`}
                          onClick={() => handleToggleStep(stage.stage)}
                        >
                          {isDone ? (
                            <>
                              <DashIcon name="check" size={14} className="inline-dash-icon" />{' '}
                              {t('dashboard.career.completed')}
                            </>
                          ) : (
                            <>
                              <DashIcon name="target" size={14} className="inline-dash-icon" />{' '}
                              {t('dashboard.career.markComplete')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Adjacent Roles */}
              {roadmap?.adjacentRoles?.length > 0 && (
                <div className="adjacent-roles-card">
                  <h4>{t('dashboard.career.adjacentTitle')}</h4>
                  <div className="adjacent-roles-pills">
                    {roadmap.adjacentRoles.map((adj) => (
                      <span key={adj.role} className="adj-role-pill">
                        <DashIcon name="tag" size={12} className="inline-dash-icon" />
                        {lang === 'hi' ? adj.title_hi : adj.title_en}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ================= TAB: WORK & SKILL VIDEO VERIFICATION ================= */}
      {activeTab === 'verification' && (
        <section className="dash-tab-content verification-tab-content">
          {/* Top Banner / Explanation */}
          <div className="verification-hero-card container-interactive-card">
            <div className="verification-hero-header">
              <div className="verification-badge-tag">
                <DashIcon name="shield-check" size={16} />
                <span>{lang === 'hi' ? 'सत्यापित हुनर व कार्य अनुभव (ProofPass)' : 'Verified Work & Skill Experience (ProofPass)'}</span>
              </div>
              <button
                type="button"
                className={`btn-icon-listen ${isSpeaking ? 'active' : ''}`}
                onClick={handleSpeakCurrentFeature}
                title={t('nav.listen')}
              >
                <DashIcon name={isSpeaking ? 'stop' : 'speaker'} size={15} />
                <span>{isSpeaking ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'सुनें' : 'Listen')}</span>
              </button>
            </div>
            <h2>
              {lang === 'hi'
                ? 'पिछले कार्य का वीडियो प्रमाण अपलोड या रिकॉर्ड करें'
                : 'Upload or Record Video Proof of Your Previous Work'}
            </h2>
            <p className="verification-hero-desc">
              {lang === 'hi'
                ? 'नियोक्ताओं को अपने व्यावहारिक कौशल, उपयोग किए गए औजार और कार्य सुरक्षा के बारे में 1-2 मिनट का वीडियो समझाकर बताएं। इससे आपका कौशल सीधे प्रमाणित होता है और बिना डिग्री के भी उच्च वेतन वाले काम मिलते हैं।'
                : 'Demonstrate your practical craft, equipment used, and safety standards in a 1-2 minute video. Verified candidates receive higher employer call-backs and immediate trust.'}
            </p>
          </div>

          {verifySuccessMsg && (
            <div className="verification-success-alert">
              <DashIcon name="check" size={18} />
              <span>{verifySuccessMsg}</span>
            </div>
          )}

          {/* Video Submission & Studio Form */}
          <div className="verification-studio-card container-interactive-card">
            <div className="studio-card-header">
              <div className="studio-header-title">
                <DashIcon name="video" size={20} className="inline-dash-icon" />
                <h3>{lang === 'hi' ? 'नया कार्य व कौशल वीडियो जोड़ें' : 'Add New Work & Skill Video Proof'}</h3>
              </div>
              <button
                type="button"
                className="btn-demo-quickfill"
                style={{ width: 'auto', padding: '6px 14px' }}
                onClick={handleSelectSampleVideo}
              >
                ⚡ {lang === 'hi' ? 'डेमो वीडियो व जानकारी लोड करें' : 'Load Sample Demonstration'}
              </button>
            </div>

            <form onSubmit={handleSubmitVerification} className="verification-form">
              <div className="form-grid-2">
                <label className="input-group">
                  <span>{lang === 'hi' ? 'कार्य / प्रोजेक्ट का शीर्षक' : 'Work / Project Title'} *</span>
                  <input
                    type="text"
                    className="base-input"
                    value={verifyTitle}
                    onChange={(e) => setVerifyTitle(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. 3-फेज डिस्ट्रीब्यूशन पैनल वायरिंग' : 'e.g. 3-Phase Industrial Distribution Panel Wiring'}
                    required
                  />
                </label>

                <label className="input-group">
                  <span>{lang === 'hi' ? 'हुनर / कार्यक्षेत्र' : 'Trade / Craft Domain'}</span>
                  <select
                    className="base-input"
                    value={verifyTrade}
                    onChange={(e) => setVerifyTrade(e.target.value)}
                  >
                    {AVAILABLE_TRADES.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {lang === 'hi' ? tr.hi : tr.en}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="input-group">
                  <span>{lang === 'hi' ? 'इस कार्य में अनुभव (वर्ष)' : 'Practical Experience (Years)'}</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="30"
                    className="base-input"
                    value={verifyExp}
                    onChange={(e) => setVerifyExp(Number(e.target.value))}
                  />
                </label>

                <label className="input-group">
                  <span>{lang === 'hi' ? 'उपयोग किए गए मुख्य औजार व उपकरण' : 'Tools & Equipment Used'}</span>
                  <input
                    type="text"
                    className="base-input"
                    value={verifyTools}
                    onChange={(e) => setVerifyTools(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. मल्टीमीटर, इंसुलेटेड स्क्रूड्राइवर, हाइड्रोलिक क्रिम्पर' : 'e.g. Multimeter, Insulated Screwdrivers, Crimping Tool'}
                  />
                </label>
              </div>

              <label className="input-group" style={{ marginTop: '16px' }}>
                <span>{lang === 'hi' ? 'कार्य का विस्तृत विवरण (आपने क्या और कैसे किया)' : 'Detailed Work Description & Steps Followed'} *</span>
                <textarea
                  className="base-input"
                  rows={3}
                  value={verifyDesc}
                  onChange={(e) => setVerifyDesc(e.target.value)}
                  placeholder={
                    lang === 'hi'
                      ? 'स्पष्ट रूप से बताएं कि आपने कार्य की शुरुआत कैसे की, किन सुरक्षा सावधानियों का पालन किया, और क्या परिणाम हासिल हुआ।'
                      : 'Clearly describe the workflow, troubleshooting steps, materials handled, and safety measures applied.'
                  }
                  required
                />
              </label>

              {/* Video Recording & Upload Controls */}
              <div className="video-capture-section">
                <span className="input-label-header">
                  <DashIcon name="camera" size={16} className="inline-dash-icon" />
                  {lang === 'hi' ? 'कौशल व्याख्या वीडियो (1-2 मिनट)' : 'Skill Explanation Video (1-2 Mins)'}
                </span>

                <div className="video-action-buttons-row">
                  <label className="btn-upload-file-label">
                    <DashIcon name="upload" size={16} />
                    <span>{lang === 'hi' ? 'वीडियो फ़ाइल अपलोड करें' : 'Upload Video File'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {!isRecording ? (
                    <button
                      type="button"
                      className="btn-camera-record"
                      onClick={handleStartCameraRecording}
                    >
                      <DashIcon name="camera" size={16} />
                      <span>{lang === 'hi' ? 'कैमरा से रिकॉर्ड करें' : 'Record with Camera'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-camera-stop"
                      onClick={handleStopCameraRecording}
                    >
                      <span className="recording-pulsing-dot" />
                      <span>{lang === 'hi' ? `रिकॉर्डिंग रोकें (${recordingSeconds}s)` : `Stop Recording (${recordingSeconds}s)`}</span>
                    </button>
                  )}
                </div>

                {/* Live Webcam Recording Stream Display */}
                {isRecording && (
                  <div className="live-webcam-preview-box">
                    <video ref={webcamVideoRef} autoPlay playsInline muted className="live-webcam-video" />
                    <div className="recording-overlay-tag">
                      <span className="recording-pulsing-dot" />
                      <span>LIVE RECORDING: {recordingSeconds}s</span>
                    </div>
                  </div>
                )}

                {/* Video Playback Preview Player */}
                {videoPreviewUrl && !isRecording && (
                  <div className="video-playback-preview-box">
                    <div className="preview-header-bar">
                      <span className="preview-filename">
                        <DashIcon name="video" size={14} className="inline-dash-icon" />
                        {videoName || 'skill_demonstration_video.mp4'}
                      </span>
                      <span className="preview-duration-tag">
                        <DashIcon name="clock" size={12} className="inline-dash-icon" />
                        {videoDuration || '01:30'}
                      </span>
                    </div>
                    <video
                      src={videoPreviewUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="verification-playback-video"
                    >
                      {lang === 'hi' ? 'आपका ब्राउज़र वीडियो का समर्थन नहीं करता।' : 'Your browser does not support video playback.'}
                    </video>
                  </div>
                )}
              </div>

              {/* Automated AI Skill Verification Checklist */}
              <div className="ai-verification-checklist-card">
                <div className="checklist-header">
                  <DashIcon name="shield-check" size={18} />
                  <h4>{lang === 'hi' ? 'स्वचालित हुनर व सुरक्षा मूल्यांकन चेकलिस्ट' : 'Automated Skill & Safety Verification Checklist'}</h4>
                </div>
                <div className="checklist-items-grid">
                  <div className="checklist-item-row">
                    <DashIcon name="check" size={16} className="checklist-check-icon" />
                    <div>
                      <strong>{lang === 'hi' ? 'तकनीकी प्रक्रिया व विधि स्पष्टीकरण' : 'Technical Workflow & Method Articulation'}</strong>
                      <p>{lang === 'hi' ? 'उम्मीदवार ने कार्य के चरणों को क्रमबद्ध रूप से समझाया।' : 'Candidate explains the execution steps clearly.'}</p>
                    </div>
                  </div>
                  <div className="checklist-item-row">
                    <DashIcon name="check" size={16} className="checklist-check-icon" />
                    <div>
                      <strong>{lang === 'hi' ? 'औजार व सुरक्षा उपकरण (PPE) का सही उपयोग' : 'Tools & Safety Equipment (PPE) Compliance'}</strong>
                      <p>{lang === 'hi' ? 'सही टूल्स व सुरक्षा सावधानियों का प्रदर्शन किया गया।' : 'Proper tool usage and safety protocols verified.'}</p>
                    </div>
                  </div>
                  <div className="checklist-item-row">
                    <DashIcon name="check" size={16} className="checklist-check-icon" />
                    <div>
                      <strong>{lang === 'hi' ? 'व्यावहारिक समस्या समाधान व गुणवत्ता' : 'Practical Problem Solving & Quality'}</strong>
                      <p>{lang === 'hi' ? 'त्रुटि निवारण व मानक गुणवत्ता परीक्षण शामिल है।' : 'Troubleshooting logic and quality standard met.'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="action-btn-primary btn-submit-verification"
                disabled={verifyLoading}
              >
                <DashIcon name="shield-check" size={18} />
                <span>
                  {verifyLoading
                    ? (lang === 'hi' ? 'सत्यापन हो रहा है...' : 'Verifying & Generating ProofPass...')
                    : (lang === 'hi' ? 'कार्य प्रमाण सबमिट करें और ProofPass प्राप्त करें →' : 'Submit Work Proof & Get ProofPass →')}
                </span>
              </button>
            </form>
          </div>

          {/* List of Verified Work Proofs */}
          <div className="verified-proofs-gallery-section">
            <div className="gallery-header-row">
              <div>
                <h3>{lang === 'hi' ? 'आपके सत्यापित कार्य व वीडियो प्रमाण' : 'Your Verified Work & Video Proofs'}</h3>
                <p className="subtext">
                  {lang === 'hi'
                    ? 'ये सभी सत्यापित क्रेडेंशियल नियोक्ताओं और ठेकेदारों को सीधे आपकी प्रोफ़ाइल में दिखाई देते हैं।'
                    : 'These verified credentials and videos are visible to employers and contractors matching your trade.'}
                </p>
              </div>
              <span className="verified-count-badge">
                <DashIcon name="shield-check" size={15} />
                {verifications.length} {lang === 'hi' ? 'प्रमाणपत्र' : 'Credentials'}
              </span>
            </div>

            <div className="verified-proofs-grid">
              {verifications.map((v) => (
                <div key={v.id} className="verified-work-card container-interactive-card">
                  <div className="verified-card-top">
                    <div className="cert-id-tag">
                      <DashIcon name="shield-check" size={14} />
                      <span>{v.certificate_id}</span>
                    </div>
                    <span className="trust-score-badge">
                      {v.verification_score || 92}% {lang === 'hi' ? 'सत्यापित स्कोर' : 'Trust Score'}
                    </span>
                  </div>

                  <h4 className="verified-work-title">{v.title}</h4>
                  <div className="verified-work-meta">
                    <span className="work-trade-tag">
                      {v.trade.toUpperCase()}
                    </span>
                    <span className="work-exp-tag">
                      {v.experience_years} {lang === 'hi' ? 'वर्ष अनुभव' : 'Yrs Experience'}
                    </span>
                    <span className="work-date-tag">
                      {new Date(v.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Playable Video Player */}
                  <div className="verified-video-player-box">
                    <video
                      src={v.video_url}
                      controls
                      playsInline
                      preload="metadata"
                      className="verified-card-video"
                    >
                      {lang === 'hi' ? 'वीडियो समर्थित नहीं है' : 'Video not supported'}
                    </video>
                  </div>

                  <p className="verified-work-desc">{v.description}</p>

                  {v.tools_used && (
                    <div className="verified-tools-box">
                      <strong>{lang === 'hi' ? 'औजार:' : 'Tools:'}</strong> {v.tools_used}
                    </div>
                  )}

                  {/* Checklist Breakdown */}
                  {v.checks && v.checks.length > 0 && (
                    <div className="verified-card-checklist">
                      {v.checks.map((chk, ci) => (
                        <div key={ci} className="verified-check-pill">
                          <DashIcon name="check" size={12} className="inline-dash-icon" />
                          <span>{chk.title}: <strong>{chk.score}%</strong></span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="verified-card-footer">
                    <span className="verified-status-pill">
                      <DashIcon name="check" size={14} />
                      {lang === 'hi' ? 'नियोक्ताओं द्वारा मान्य' : 'Employer Trusted'}
                    </span>
                    <button
                      type="button"
                      className="btn-delete-verification"
                      onClick={() => handleDeleteVerification(v.id)}
                      title={lang === 'hi' ? 'हटाएं' : 'Delete'}
                    >
                      <DashIcon name="close" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= TAB 4: PROFILE & CONNECTED TRADE ================= */}
      {activeTab === 'profile' && (
        <section className="dash-tab-content">
          <form onSubmit={handleSaveProfile} className="profile-edit-card">
            <div className="profile-card-header">
              <div>
                <h3>{t('dashboard.profile.title')}</h3>
                <p className="subtext">
                  {lang === 'hi'
                    ? 'अपनी व्यक्तिगत जानकारी, हुनर का चयन व करियर लक्ष्य प्रबंधित करें। यहाँ किया गया बदलाव तुरंत पूरे प्लेटफ़ॉर्म पर लागू होगा।'
                    : 'Manage your personal details, primary trade, and career goals. Any updates here immediately synchronize across all courses and opportunities.'}
                </p>
              </div>
              {saveStatus && <span className="save-status-msg">{saveStatus}</span>}
            </div>

            {/* Section 1: Personal & Commute Details */}
            <div className="profile-sub-section">
              <h4 className="profile-section-subhead">
                <DashIcon name="profile" size={16} className="inline-dash-icon" />
                {lang === 'hi' ? '1. व्यक्तिगत व यात्रा प्राथमिकता' : '1. Personal & Commute Preferences'}
              </h4>
              <div className="form-grid-2">
                <label className="input-group">
                  <span>{t('dashboard.profile.name')}</span>
                  <input
                    type="text"
                    className="base-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={lang === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                  />
                </label>

                <label className="input-group">
                  <span>{t('dashboard.profile.location')}</span>
                  <input
                    type="text"
                    className="base-input"
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                    placeholder={lang === 'hi' ? 'गांव / कस्बा / शहर' : 'Village, Town, or City'}
                  />
                </label>

                <label className="input-group">
                  <span>
                    {t('dashboard.profile.travel')}: {editTravelKm} km
                  </span>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    step={2}
                    value={editTravelKm}
                    onChange={(e) => setEditTravelKm(Number(e.target.value))}
                  />
                </label>

                <label className="toggle-card">
                  <input
                    type="checkbox"
                    checked={editWfhOnly}
                    onChange={(e) => setEditWfhOnly(e.target.checked)}
                  />
                  <span>
                    <DashIcon name="home" size={14} className="inline-dash-icon" />
                    {t('onboarding.wfhOnly')}
                  </span>
                </label>
              </div>
            </div>

            {/* Section 2: Connected Primary Trade & Course Domain */}
            <div className="profile-trade-section">
              <div className="profile-section-subhead-row">
                <h4 className="profile-section-subhead">
                  <DashIcon name="briefcase" size={16} className="inline-dash-icon" />
                  {lang === 'hi'
                    ? '2. मेरा मुख्य कोर्स व ट्रेड (Connected Course & Trade Selection)'
                    : '2. Primary Trade & Course Domain'}
                </h4>
                <span className="profile-connected-badge">
                  <DashIcon name="check" size={12} className="inline-dash-icon" />
                  {lang === 'hi' ? 'सीधे कोर्स से जुड़ा हुआ' : 'Connected to Learning & Roadmap'}
                </span>
              </div>
              <p className="profile-section-help">
                {lang === 'hi'
                  ? 'यहाँ अपना मुख्य हुनर चुनें। यह ट्रेड सीधे कोर्स लर्निंग, सरकारी योजनाओं और करियर माइलस्टोन से जुड़ा है — किसी बार-बार प्रश्नोत्तरी की आवश्यकता नहीं है।'
                  : 'Select your trade below. It connects directly with your Course Learning, PMKVY/ITI recommendations, and career progression without asking repetitive questions.'}
              </p>

              <div className="profile-trade-grid">
                {AVAILABLE_TRADES.map((trade) => {
                  const isSelected = editTrade === trade.id
                  return (
                    <div
                      key={trade.id}
                      className={`profile-trade-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setEditTrade(trade.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setEditTrade(trade.id)}
                    >
                      <div className="profile-trade-icon">
                        <TradeIcon id={trade.id} size={20} />
                      </div>
                      <div className="profile-trade-text">
                        <h4>{lang === 'hi' ? trade.hi : trade.en}</h4>
                        <p>{lang === 'hi' ? trade.desc_hi : trade.desc_en}</p>
                      </div>
                      {isSelected && (
                        <span className="profile-trade-check">
                          <DashIcon name="check" size={12} />
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Section 3: Experience Level & Target Goal */}
            <div className="profile-level-goal-grid">
              <div className="profile-choice-block">
                <label className="input-group-label">
                  {lang === 'hi' ? '3. हुनर का अनुभव स्तर (Experience Level)' : '3. Experience & Skill Level'}
                </label>
                <div className="profile-pill-group">
                  {[
                    { id: 'Beginner', en: 'Beginner (0-1 yr)', hi: 'शुरुआती (0-1 वर्ष)' },
                    { id: 'Intermediate', en: 'Intermediate (1-3 yrs)', hi: 'मध्यम (1-3 वर्ष)' },
                    { id: 'Advanced', en: 'Master / Skilled (3+ yrs)', hi: 'मास्टर कारीगर (3+ वर्ष)' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      className={`profile-pill-btn ${editLevel === lvl.id ? 'selected' : ''}`}
                      onClick={() => setEditLevel(lvl.id)}
                    >
                      {lang === 'hi' ? lvl.hi : lvl.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-choice-block">
                <label className="input-group-label">
                  {lang === 'hi' ? '4. मुख्य करियर लक्ष्य (Career Goal)' : '4. Target Career Goal'}
                </label>
                <div className="profile-pill-group">
                  {[
                    { id: 'job', en: 'Full-Time Job / Employment', hi: 'नौकरी / नियमित रोजगार' },
                    { id: 'business', en: 'Own Shop / Business', hi: 'अपनी दुकान / स्वरोजगार' },
                    { id: 'side_income', en: 'Extra / Part-Time Income', hi: 'अतिरिक्त / पार्ट-टाइम कमाई' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`profile-pill-btn ${editGoalType === g.id ? 'selected' : ''}`}
                      onClick={() => setEditGoalType(g.id)}
                    >
                      {lang === 'hi' ? g.hi : g.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-action-row">
              <button type="submit" className="btn-primary">
                <DashIcon name="check" size={16} />
                {lang === 'hi' ? 'प्रोफ़ाइल सेव करें व कोर्स अपडेट करें' : 'Save Profile & Update All Courses'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setTab('learn')}
              >
                {lang === 'hi' ? 'मेरे कोर्स देखें →' : 'View Connected Courses →'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setTab('career')}
              >
                {lang === 'hi' ? 'करियर मार्ग देखें →' : 'View Career Roadmap →'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setTab('verification')}
              >
                <DashIcon name="shield-check" size={15} />
                {lang === 'hi' ? 'हुनर वीडियो सत्यापन देखें →' : 'View Work Video Verification →'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Contact Employer Modal */}
      {contactModalOpp && (
        <div className="auth-overlay" onClick={() => setContactModalOpp(null)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('dashboard.opps.appliedBtn')}</h3>
              <button
                type="button"
                className="auth-close"
                onClick={() => setContactModalOpp(null)}
              >
                <DashIcon name="close" size={16} />
              </button>
            </div>

            <p className="contact-modal-title">
              {lang === 'hi' ? contactModalOpp.title_hi : contactModalOpp.title_en}
            </p>
            <p className="contact-modal-org">
              <DashIcon name="building" size={14} className="inline-dash-icon" />
              {contactModalOpp.org}
            </p>

            <div className="contact-direct-buttons">
              <a
                href={contactModalOpp.contact?.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                {t('dashboard.opps.whatsappBtn')}
              </a>

              <a href={contactModalOpp.contact?.telUrl} className="btn-call">
                {t('dashboard.opps.callBtn')} ({contactModalOpp.contact?.phone})
              </a>

              <a href={contactModalOpp.contact?.smsUrl} className="btn-sms">
                {t('dashboard.opps.smsBtn')}
              </a>
            </div>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setContactModalOpp(null)}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

function OpportunityCard({ opp, lang, t, isApplied, onApply, onSpeak }) {
  return (
    <div className={`opportunity-card ${isApplied ? 'applied-card' : ''}`}>
      <div className="opp-header-row">
        <span className="opp-kind-tag">{opp.kind.toUpperCase()}</span>
        <button
          type="button"
          className="btn-icon-listen"
          onClick={onSpeak}
          title={t('nav.listen')}
          aria-label={t('nav.listen')}
        >
          <DashIcon name="speaker" size={15} />
        </button>
      </div>

      <h4 className="opp-title">{lang === 'hi' ? opp.title_hi : opp.title_en}</h4>
      <p className="opp-org">
        <DashIcon name="building" size={14} className="inline-dash-icon" />
        {opp.org}
      </p>

      <div className="opp-metrics-grid">
        <div className="metric-cell">
          <span className="metric-label">
            <DashIcon name="location" size={13} className="inline-dash-icon" /> Area:
          </span>
          <strong>{lang === 'hi' ? opp.area_hi : opp.area_en}</strong>
        </div>
        <div className="metric-cell">
          <span className="metric-label">
            <DashIcon name="pay" size={13} className="inline-dash-icon" /> Pay:
          </span>
          <strong>₹{opp.pay?.toLocaleString('en-IN')}/mo</strong>
        </div>
        <div className="metric-cell">
          <span className="metric-label">
            <DashIcon name="clock" size={13} className="inline-dash-icon" /> {t('dashboard.opps.commute')}:
          </span>
          <strong>{opp.work_from_home === 1 ? 'Home Work (WFH)' : `~${opp.mins} mins`}</strong>
        </div>
        <div className="metric-cell">
          <span className="metric-label">
            <DashIcon name="transit" size={13} className="inline-dash-icon" /> {t('dashboard.opps.fare')}:
          </span>
          <strong>{opp.work_from_home === 1 ? '₹0' : `₹${opp.cost}`}</strong>
        </div>
      </div>

      {opp.work_from_home === 1 && (
        <div className="wfh-banner">
          <DashIcon name="home" size={14} className="inline-dash-icon" />
          {t('dashboard.opps.wfhBadge')}
        </div>
      )}

      {/* Why This Matches You Reasons List */}
      <div className="why-matches-box">
        <strong>{t('dashboard.opps.whyMatch')}</strong>
        <ul>
          {(lang === 'hi' ? opp.reasons_hi : opp.reasons_en)?.slice(0, 3).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="opp-card-actions">
        {isApplied ? (
          <button type="button" className="btn-applied" disabled>
            <DashIcon name="check" size={14} className="inline-dash-icon" />
            {t('dashboard.opps.appliedBtn')}
          </button>
        ) : (
          <button type="button" className="btn-primary btn-apply" onClick={onApply}>
            {t('dashboard.opps.applyBtn')} →
          </button>
        )}
      </div>
    </div>
  )
}
