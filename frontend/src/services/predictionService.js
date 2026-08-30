// KisanDrishti — Crop Disease Prediction Service
//
// Calls the real Flask backend POST /predict via the api.js client.
// Falls back to placeholder data ONLY when the backend URL is not
// configured or if explicitly requested (for offline development).

import { postPredict } from './api';

// ── Treatment & symptom knowledge base keyed by condition ──────────
// Used to enrich the raw backend response (which only returns
// class_name, confidence, crop, condition) with actionable advice.

const CONDITION_KB = {
  // ─── Apple ──────────────────────────────────────────────
  Apple_scab: {
    symptomsEn: ['Olive-green or brown velvety spots on leaves', 'Scabby lesions on fruit surface', 'Premature leaf drop'],
    symptomsHi: ['पत्तियों पर जैतून-हरे या भूरे मखमली धब्बे', 'फल की सतह पर पपड़ीदार घाव', 'समय से पहले पत्ती गिरना'],
    organicEn: ['Apply Neem oil spray (5ml/L) weekly', 'Use Bordeaux mixture (1%) as preventive', 'Remove fallen infected leaves'],
    organicHi: ['नीम तेल स्प्रे (5ml/L) साप्ताहिक लगाएं', 'बोर्डो मिश्रण (1%) निवारक के रूप में उपयोग करें', 'गिरी हुई संक्रमित पत्तियां हटाएं'],
    chemicalEn: ['Mancozeb 75% WP at 2.5g/L', 'Captan 50% WP at 2g/L', 'Myclobutanil 10% WP at 0.5g/L'],
    chemicalHi: ['मैंकोज़ेब 75% WP - 2.5g/L', 'कैप्टान 50% WP - 2g/L', 'माइक्लोब्यूटानिल 10% WP - 0.5g/L'],
    preventionEn: ['Plant scab-resistant varieties', 'Ensure proper air circulation', 'Apply fungicide at green-tip stage'],
    preventionHi: ['पपड़ी प्रतिरोधी किस्में लगाएं', 'उचित हवा का संचार सुनिश्चित करें', 'हरी-नोक अवस्था में फफूंदनाशक लगाएं'],
  },
  Black_rot: {
    symptomsEn: ['Circular brown lesions on leaves with concentric rings', 'Black shrunken mummified fruit', 'Cankers on branches'],
    symptomsHi: ['पत्तियों पर गोल भूरे धब्बे जिनमें गोलाकार छल्ले', 'काले सिकुड़े ममीकृत फल', 'शाखाओं पर कैंकर'],
    organicEn: ['Prune and destroy infected branches', 'Apply copper-based fungicide', 'Remove mummified fruit from trees'],
    organicHi: ['संक्रमित शाखाओं की छंटाई करें और नष्ट करें', 'तांबा आधारित फफूंदनाशक लगाएं', 'ममीकृत फल पेड़ों से हटाएं'],
    chemicalEn: ['Captan 50% WP at 2g/L', 'Thiophanate-methyl at 1g/L', 'Mancozeb 75% WP at 2.5g/L'],
    chemicalHi: ['कैप्टान 50% WP - 2g/L', 'थायोफैनेट-मिथाइल - 1g/L', 'मैंकोज़ेब 75% WP - 2.5g/L'],
    preventionEn: ['Practice good sanitation', 'Prune during dormant season', 'Avoid overhead irrigation'],
    preventionHi: ['अच्छी स्वच्छता अपनाएं', 'सुषुप्त अवधि में छंटाई करें', 'ऊपर से सिंचाई से बचें'],
  },
  Early_blight: {
    symptomsEn: ['Dark brown concentric rings on older leaves (target spots)', 'Leaf yellowing around lesion area', 'Premature defoliation in severe cases'],
    symptomsHi: ['पुरानी पत्तियों पर गहरे भूरे गोलाकार छल्ले (लक्ष्य धब्बे)', 'धब्बे के आसपास पत्ती का पीला पड़ना', 'गंभीर मामलों में समय से पहले पत्ती गिरना'],
    organicEn: ['Apply compost tea spray every 10 days', 'Use Trichoderma viride bio-fungicide', 'Mulch around plant base'],
    organicHi: ['हर 10 दिन कम्पोस्ट चाय स्प्रे करें', 'ट्राइकोडर्मा विरिडी जैव फफूंदनाशक उपयोग करें', 'पौधे के आधार पर मल्चिंग करें'],
    chemicalEn: ['Mancozeb 75% WP at 2.5g/L', 'Chlorothalonil 75% WP at 2g/L', 'Azoxystrobin 23% SC at 1ml/L'],
    chemicalHi: ['मैंकोज़ेब 75% WP - 2.5g/L', 'क्लोरोथालोनिल 75% WP - 2g/L', 'एज़ोक्सीस्ट्रोबिन 23% SC - 1ml/L'],
    preventionEn: ['Practice crop rotation', 'Remove infected plant debris', 'Avoid overhead irrigation', 'Use disease-free seeds'],
    preventionHi: ['फसल चक्र अपनाएं', 'संक्रमित पौधों के अवशेष हटाएं', 'ऊपर से सिंचाई से बचें', 'रोग-मुक्त बीज उपयोग करें'],
  },
  Late_blight: {
    symptomsEn: ['Water-soaked dark patches on leaves', 'White fuzzy growth on leaf underside', 'Rapid browning and death of foliage'],
    symptomsHi: ['पत्तियों पर पानी जैसे गहरे धब्बे', 'पत्ती के निचले भाग पर सफेद रोयेंदार वृद्धि', 'पत्तियों का तेजी से भूरा होना और मरना'],
    organicEn: ['Apply copper hydroxide spray', 'Use Bordeaux mixture (1%)', 'Remove and destroy infected plants immediately'],
    organicHi: ['कॉपर हाइड्रॉक्साइड स्प्रे लगाएं', 'बोर्डो मिश्रण (1%) उपयोग करें', 'संक्रमित पौधों को तुरंत हटाकर नष्ट करें'],
    chemicalEn: ['Metalaxyl + Mancozeb at 2.5g/L', 'Cymoxanil 8% + Mancozeb 64% at 3g/L', 'Dimethomorph 50% WP at 1g/L'],
    chemicalHi: ['मेटालैक्सिल + मैंकोज़ेब - 2.5g/L', 'साइमोक्सैनिल 8% + मैंकोज़ेब 64% - 3g/L', 'डाइमेथोमॉर्फ 50% WP - 1g/L'],
    preventionEn: ['Use blight-resistant varieties', 'Avoid waterlogging', 'Ensure good air circulation', 'Do not irrigate in evening'],
    preventionHi: ['अंगमारी प्रतिरोधी किस्में उपयोग करें', 'जलभराव से बचें', 'अच्छा हवा संचार सुनिश्चित करें', 'शाम को सिंचाई न करें'],
  },
  Bacterial_spot: {
    symptomsEn: ['Small dark water-soaked spots on leaves', 'Spots may have yellow halos', 'Fruit lesions appear raised and scabby'],
    symptomsHi: ['पत्तियों पर छोटे गहरे पानीदार धब्बे', 'धब्बों के चारों ओर पीला घेरा', 'फलों पर उभरे और पपड़ीदार घाव'],
    organicEn: ['Apply copper-based bactericide', 'Use Pseudomonas fluorescens spray', 'Remove heavily infected plants'],
    organicHi: ['तांबा आधारित जीवाणुनाशक लगाएं', 'स्यूडोमोनास फ्लोरेसेंस स्प्रे उपयोग करें', 'भारी संक्रमित पौधे हटाएं'],
    chemicalEn: ['Copper oxychloride 50% WP at 3g/L', 'Streptocycline at 0.5g/L + COC', 'Kasugamycin 3% SL at 2ml/L'],
    chemicalHi: ['कॉपर ऑक्सीक्लोराइड 50% WP - 3g/L', 'स्ट्रेप्टोसाइक्लिन - 0.5g/L + COC', 'कासुगामाइसिन 3% SL - 2ml/L'],
    preventionEn: ['Use certified disease-free seeds', 'Avoid working in wet fields', 'Practice crop rotation', 'Ensure proper spacing'],
    preventionHi: ['प्रमाणित रोग-मुक्त बीज उपयोग करें', 'गीले खेत में काम से बचें', 'फसल चक्र अपनाएं', 'उचित दूरी रखें'],
  },
  Powdery_mildew: {
    symptomsEn: ['White powdery coating on leaf surfaces', 'Leaves curl and become distorted', 'Stunted growth and reduced yield'],
    symptomsHi: ['पत्ती की सतह पर सफेद पाउडर जैसी परत', 'पत्तियां मुड़ जाती हैं और विकृत हो जाती हैं', 'विकास रुकना और उपज में कमी'],
    organicEn: ['Spray milk solution (1:9 milk:water)', 'Apply sulfur dust', 'Use potassium bicarbonate spray'],
    organicHi: ['दूध का घोल (1:9 दूध:पानी) छिड़कें', 'गंधक चूर्ण लगाएं', 'पोटैशियम बाइकार्बोनेट स्प्रे उपयोग करें'],
    chemicalEn: ['Sulfur 80% WP at 3g/L', 'Hexaconazole 5% EC at 1ml/L', 'Dinocap 48% EC at 1ml/L'],
    chemicalHi: ['सल्फर 80% WP - 3g/L', 'हेक्साकोनाज़ोल 5% EC - 1ml/L', 'डाइनोकैप 48% EC - 1ml/L'],
    preventionEn: ['Ensure proper air circulation', 'Avoid overcrowding plants', 'Remove infected leaves promptly'],
    preventionHi: ['उचित हवा संचार सुनिश्चित करें', 'पौधों की भीड़ से बचें', 'संक्रमित पत्तियां तुरंत हटाएं'],
  },
  // Catch-all for conditions not in the KB
  _default: {
    symptomsEn: ['Visible lesions or discoloration on plant tissue', 'Wilting or stunted growth', 'Abnormal spots, patches, or growths'],
    symptomsHi: ['पौधे के ऊतक पर दिखाई देने वाले घाव या रंग बदलना', 'मुरझाना या विकास रुकना', 'असामान्य धब्बे, पैच या वृद्धि'],
    organicEn: ['Apply Neem oil spray (5ml/L)', 'Use Trichoderma-based bio-fungicide', 'Remove and destroy infected plant parts'],
    organicHi: ['नीम तेल स्प्रे (5ml/L) लगाएं', 'ट्राइकोडर्मा आधारित जैव फफूंदनाशक उपयोग करें', 'संक्रमित पौधे के भागों को हटाकर नष्ट करें'],
    chemicalEn: ['Mancozeb 75% WP at 2.5g/L', 'Carbendazim 50% WP at 1g/L', 'Consult local KVK for specific recommendation'],
    chemicalHi: ['मैंकोज़ेब 75% WP - 2.5g/L', 'कार्बेंडाज़िम 50% WP - 1g/L', 'विशिष्ट सिफारिश के लिए स्थानीय KVK से संपर्क करें'],
    preventionEn: ['Practice crop rotation', 'Maintain field hygiene', 'Use disease-resistant varieties', 'Monitor crops regularly'],
    preventionHi: ['फसल चक्र अपनाएं', 'खेत की स्वच्छता बनाए रखें', 'रोग प्रतिरोधी किस्में उपयोग करें', 'फसलों की नियमित निगरानी करें'],
  },
};

/**
 * Look up a condition string (e.g. "Early_blight") in the knowledge base.
 * Tries exact match first, then partial match, then falls back to _default.
 */
function lookupConditionKB(condition) {
  if (!condition) return CONDITION_KB._default;

  // Exact match
  if (CONDITION_KB[condition]) return CONDITION_KB[condition];

  // Partial match (condition string may contain extra characters)
  const conditionLower = condition.toLowerCase().replace(/[_\s]+/g, '');
  for (const [key, value] of Object.entries(CONDITION_KB)) {
    if (key === '_default') continue;
    const keyLower = key.toLowerCase().replace(/[_\s]+/g, '');
    if (conditionLower.includes(keyLower) || keyLower.includes(conditionLower)) {
      return value;
    }
  }

  return CONDITION_KB._default;
}

/**
 * Derive severity from confidence percentage:
 *   confidence >= 80  → 'high'
 *   confidence >= 50  → 'medium'
 *   confidence < 50   → 'low'
 */
function deriveSeverity(confidence) {
  if (confidence >= 80) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

/**
 * Format a raw condition string for display.
 * "Early_blight" → "Early Blight"
 * "Tomato_Yellow_Leaf_Curl_Virus" → "Tomato Yellow Leaf Curl Virus"
 */
function formatCondition(condition) {
  if (!condition) return '';
  return condition
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Main prediction function.
 * Calls the real Flask backend and enriches the response with
 * treatment/symptom data from the local knowledge base.
 *
 * @param {string} imageUri - Local file URI of the crop image
 * @param {string} cropType - User-selected crop type (for metadata)
 * @returns {object} Enriched diagnosis result
 */
export async function predictCropDisease(imageUri, cropType) {
  // Call the real Flask backend
  const backendResponse = await postPredict(imageUri);

  // Parse backend fields
  const { class_name, confidence, crop, condition } = backendResponse;

  // Determine if healthy
  const isHealthy = !condition || condition.toLowerCase() === 'healthy' || condition === '';
  const displayCondition = formatCondition(condition);

  if (isHealthy) {
    return {
      isDiseased: false,
      diseaseName: 'Healthy',
      diseaseNameHi: 'स्वस्थ',
      confidence: confidence / 100, // normalize to 0-1
      severity: 'none',
      crop: crop || cropType,
      className: class_name,
      symptoms: [],
      symptomsHi: [],
      organicTreatment: [],
      organicTreatmentHi: [],
      chemicalTreatment: [],
      chemicalTreatmentHi: [],
      prevention: ['Continue regular field monitoring', 'Maintain balanced nutrition'],
      preventionHi: ['नियमित खेत निगरानी जारी रखें', 'संतुलित पोषण बनाए रखें'],
    };
  }

  // Enrich with knowledge base
  const kb = lookupConditionKB(condition);
  const severity = deriveSeverity(confidence);

  return {
    isDiseased: true,
    diseaseName: displayCondition || class_name,
    diseaseNameHi: displayCondition || class_name, // Same formatted name (Hindi KB expansion possible)
    confidence: confidence / 100, // normalize to 0-1
    severity,
    crop: crop || cropType,
    className: class_name,
    symptoms: kb.symptomsEn,
    symptomsHi: kb.symptomsHi,
    organicTreatment: kb.organicEn,
    organicTreatmentHi: kb.organicHi,
    chemicalTreatment: kb.chemicalEn,
    chemicalTreatmentHi: kb.chemicalHi,
    prevention: kb.preventionEn,
    preventionHi: kb.preventionHi,
  };
}

export default { predictCropDisease };
