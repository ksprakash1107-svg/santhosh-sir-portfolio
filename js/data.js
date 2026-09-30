/**
 * Santhosh S. — Verified Portfolio Data Configuration
 * Strictly adheres to verified factual sources.
 * Future content adjustments can be made directly in this file.
 */

export const PORTFOLIO_CONFIG = {
  profile: {
    name: "Santhosh S.",
    shortName: "Santhosh",
    monogram: "S",
    primaryTitle: "Multilingual Educator & Communication Trainer",
    facultyTitle: "English Professor / Faculty",
    coreConcept: "LANGUAGE HAS NO BORDER.",
    tagline: "English educator, communication trainer and international education professional shaped by teaching, language and international experience.",
    locations: {
      origin: { name: "Chennai, India", coords: "13.0827° N, 80.2707° E" },
      international: { name: "Australia", coords: "25.2744° S, 133.7751° E" }
    }
  },

  // Social & Institution Links (Factual & Verified)
  links: {
    madrasCollege: "https://www.madrascollege.ac.in/",
    goStudy: "https://www.go.study",
    // Configurable placeholder as required
    linkedin: "ADD_LINKEDIN_URL_HERE"
  },

  // Verified Editorial Metrics
  metrics: [
    {
      value: "17+",
      label: "Years of Language Pedagogy",
      meta: "Pedagogical Experience"
    },
    {
      value: "5",
      label: "Languages Across Global Spheres",
      meta: "Multilingual Competence"
    },
    {
      value: "5+",
      label: "Years of Study & Immersion in Australia",
      meta: "International Immersion"
    },
    {
      value: "MEC",
      label: "English Faculty in Higher Education",
      meta: "Academic Faculty"
    }
  ],

  // Five Languages Section Data
  languages: [
    {
      id: "tamil",
      order: "01",
      script: "தமிழ்",
      ipa: "/t̪ɐmɨɻ/",
      name: "Tamil",
      nativeFamily: "Classical Dravidian",
      region: "Classical Dravidian · South India",
      tagline: "Classical Heritage & Cadence",
      perspective: "Mother tongue providing the intuitive bedrock for classical grammar and rhetorical cadence.",
      color: "#B7955B"
    },
    {
      id: "english",
      order: "02",
      script: "English",
      ipa: "/ˈɪŋɡlɪʃ/",
      name: "English",
      nativeFamily: "Global Medium",
      region: "Higher Academia & Global Opportunity",
      tagline: "Academic Rigor & Global Voice",
      perspective: "Primary pedagogical medium for 17+ years focused on academic rigor, executive articulation, and exam mastery.",
      color: "#F4F0E8"
    },
    {
      id: "malayalam",
      order: "03",
      script: "മലയാളം",
      ipa: "/mɐlɐjaːɭɐm/",
      name: "Malayalam",
      nativeFamily: "Dravidian Heritage",
      region: "South Indian Linguistic Tradition",
      tagline: "Linguistic Depth & Cadence",
      perspective: "Expands cross-regional communicative agility, linguistic empathy, and rich phonological comprehension.",
      color: "#D8CBB8"
    },
    {
      id: "german",
      order: "04",
      script: "Deutsch",
      ipa: "/dɔʏtʃ/",
      name: "German",
      nativeFamily: "Central Germanic",
      region: "Germany · Central Europe",
      tagline: "Professional CEFR Fluency",
      perspective: "Mastery of German professional language standards and European communicative frameworks for international mobility.",
      color: "#17352F"
    },
    {
      id: "japanese",
      order: "05",
      script: "日本語",
      ipa: "/nihonɡo/",
      name: "Japanese",
      nativeFamily: "Japonic Sphere",
      region: "East Asian Cultural Sphere",
      tagline: "Contextual Etiquette & Nuance",
      perspective: "Cultivates acute sensitivity to contextual nuance, diplomatic etiquette, and cross-cultural respect.",
      color: "#B7955B"
    }
  ],

  // Australia & International Journey Timeline
  timeline: [
    {
      epoch: "01 — Foundations",
      title: "India: Roots & Pedagogy",
      subtitle: "The Genesis of an Educator",
      narrative: "Bilingual foundation in Tamil and English, establishing a pedagogy centered on communicative poise and academic readiness."
    },
    {
      epoch: "02 — International Chapter",
      title: "Australia: Academic Study & Immersion",
      subtitle: "International Higher Education Chapter",
      narrative: "Academic study and international immersion in Australia, mastering global pedagogical standards and international educational pathways.",
      highlight: true
    },
    {
      epoch: "03 — Synthesis",
      title: "Cross-Continental Synthesis",
      subtitle: "Bridging East, West & Global Aspirations",
      narrative: "Uniting Australian international education standards with Indian academic pathways to prepare scholars for international careers."
    },
    {
      epoch: "04 — Leadership",
      title: "Higher Education Leadership",
      subtitle: "Madras Engineering College & GoStudy",
      narrative: "Leading English faculty at Madras Engineering College and mentoring global candidates within the GoStudy ecosystem."
    }
  ],

  // Test Preparation & Training Disciplines
  testPrep: [
    {
      id: "ielts",
      code: "01",
      name: "IELTS",
      tagline: "Academic & General Training",
      description: "Structured diagnostic strategies across Listening, Reading, Writing, and Speaking, calibrated to band-9 rubrics and structural cohesion.",
      pillars: [
        "Band-specific rubric optimization",
        "Thesis management & essay cohesion",
        "Spontaneous fluency without hesitation"
      ],
      metricTitle: "17+ Years",
      metricSub: "Diagnostic Pedagogy"
    },
    {
      id: "pte",
      code: "02",
      name: "PTE Academic",
      tagline: "Algorithm-Aligned Scoring",
      description: "Coaching aligned to Pearson's automated scoring AI, acoustic phonetics, and high-speed integrated tasks.",
      pillars: [
        "Oral Fluency & Read Aloud acoustic clarity",
        "Summarize Spoken Text lexical precision",
        "Computer-scored essay templates"
      ],
      metricTitle: "Target 79+",
      metricSub: "Scoring Strategy"
    },
    {
      id: "oet",
      code: "03",
      name: "OET",
      tagline: "Healthcare Communication",
      description: "Medical-grade communication tailored for healthcare professionals, clinical consultations, and referral letters.",
      pillars: [
        "Clinical consultation rapport & empathy",
        "Patient-centered medical register",
        "Case-note transformation for referral letters"
      ],
      metricTitle: "Grade B & A",
      metricSub: "Clinical Standard Focus"
    },
    {
      id: "duolingo",
      code: "04",
      name: "Duolingo",
      tagline: "Computer-Adaptive Agility",
      description: "Rapid-fire training for the Duolingo English Test (DET), focusing on quick lexical production and adaptive scaling.",
      pillars: [
        "Timed vocabulary recognition",
        "Interactive reading & cloze passages",
        "Extended speaking & writing production"
      ],
      metricTitle: "Adaptive",
      metricSub: "Admission Ready"
    },
    {
      id: "communication",
      code: "05",
      name: "Communication",
      tagline: "Executive Articulation",
      description: "High-impact articulation and workplace diplomacy for engineers, academic faculty, and international professionals.",
      pillars: [
        "Executive storytelling & interview poise",
        "Cross-cultural professional diplomacy",
        "Symposium & conference presentation presence"
      ],
      metricTitle: "Lifelong",
      metricSub: "Professional Impact"
    }
  ]
};
