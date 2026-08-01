// Disease Detection Service with comprehensive symptom database
// This is a rule-based system that can be replaced with AI/ML API later

export const diseaseDatabase = {
  // Common symptoms database
  symptoms: {
    'fever': {
      diseases: ['malaria', 'typhoid', 'flu', 'covid-19', 'dengue'],
      severity: 'medium',
      category: 'infectious'
    },
    'cough': {
      diseases: ['flu', 'covid-19', 'bronchitis', 'pneumonia', 'asthma'],
      severity: 'medium',
      category: 'respiratory'
    },
    'headache': {
      diseases: ['migraine', 'tension headache', 'sinusitis', 'hypertension', 'meningitis'],
      severity: 'low',
      category: 'neurological'
    },
    'fatigue': {
      diseases: ['anemia', 'diabetes', 'thyroid', 'depression', 'chronic fatigue'],
      severity: 'low',
      category: 'systemic'
    },
    'nausea': {
      diseases: ['gastritis', 'food poisoning', 'migraine', 'pregnancy', 'vertigo'],
      severity: 'medium',
      category: 'gastrointestinal'
    },
    'vomiting': {
      diseases: ['gastroenteritis', 'food poisoning', 'migraine', 'appendicitis'],
      severity: 'high',
      category: 'gastrointestinal'
    },
    'diarrhea': {
      diseases: ['gastroenteritis', 'food poisoning', 'ibd', 'colitis'],
      severity: 'medium',
      category: 'gastrointestinal'
    },
    'shortness of breath': {
      diseases: ['asthma', 'pneumonia', 'covid-19', 'anxiety', 'heart failure'],
      severity: 'high',
      category: 'respiratory'
    },
    'chest pain': {
      diseases: ['heart attack', 'angina', 'anxiety', 'acid reflux', 'pneumonia'],
      severity: 'high',
      category: 'cardiovascular'
    },
    'joint pain': {
      diseases: ['arthritis', 'gout', 'rheumatoid arthritis', 'lupus', 'dengue'],
      severity: 'medium',
      category: 'musculoskeletal'
    },
    'rash': {
      diseases: ['allergy', 'eczema', 'measles', 'chicken pox', 'dengue'],
      severity: 'low',
      category: 'dermatological'
    },
    'sore throat': {
      diseases: ['strep throat', 'tonsillitis', 'flu', 'covid-19', 'allergies'],
      severity: 'low',
      category: 'respiratory'
    },
    'runny nose': {
      diseases: ['cold', 'allergies', 'sinusitis', 'flu', 'covid-19'],
      severity: 'low',
      category: 'respiratory'
    },
    'dizziness': {
      diseases: ['vertigo', 'anemia', 'dehydration', 'low blood pressure', 'anxiety'],
      severity: 'medium',
      category: 'neurological'
    },
    'back pain': {
      diseases: ['muscle strain', 'herniated disc', 'arthritis', 'kidney infection'],
      severity: 'medium',
      category: 'musculoskeletal'
    },
    'ear pain': {
      diseases: ['otitis media', 'swimmer\'s ear', 'ear infection', 'tmj disorder'],
      severity: 'medium',
      category: 'ear'
    },
    'eye redness': {
      diseases: ['conjunctivitis', 'allergies', 'dry eye', 'corneal abrasion'],
      severity: 'medium',
      category: 'eye'
    },
    'blurred vision': {
      diseases: ['refractive error', 'cataracts', 'glaucoma', 'diabetic retinopathy'],
      severity: 'high',
      category: 'eye'
    },
    'ringing in ears': {
      diseases: ['tinnitus', 'ear infection', 'hearing loss', 'meniere\'s disease'],
      severity: 'medium',
      category: 'ear'
    },
    'hearing loss': {
      diseases: ['ear infection', 'earwax blockage', 'age-related hearing loss', 'tinnitus'],
      severity: 'medium',
      category: 'ear'
    }
  },

  // Disease details with treatment recommendations
  diseaseDetails: {
    'malaria': {
      name: 'Malaria',
      description: 'A mosquito-borne infectious disease caused by Plasmodium parasites.',
      treatment: 'Antimalarial medications (artemisinin-based combination therapy)',
      precautions: 'Use mosquito nets, wear protective clothing, use insect repellent',
      medicines: ['Artemisinin', 'Quinine', 'Chloroquine']
    },
    'typhoid': {
      name: 'Typhoid Fever',
      description: 'A bacterial infection caused by Salmonella typhi.',
      treatment: 'Antibiotics (ciprofloxacin, ceftriaxone)',
      precautions: 'Drink clean water, maintain hygiene, get vaccinated',
      medicines: ['Ciprofloxacin', 'Ceftriaxone', 'Azithromycin']
    },
    'flu': {
      name: 'Influenza',
      description: 'A viral infection that attacks respiratory system.',
      treatment: 'Rest, fluids, antiviral medications',
      precautions: 'Get flu shot, wash hands frequently, avoid close contact',
      medicines: ['Oseltamivir', 'Paracetamol', 'Ibuprofen']
    },
    'covid-19': {
      name: 'COVID-19',
      description: 'A viral respiratory illness caused by SARS-CoV-2.',
      treatment: 'Rest, isolation, supportive care, antiviral medications',
      precautions: 'Wear mask, social distancing, get vaccinated',
      medicines: ['Paxlovid', 'Remdesivir', 'Paracetamol']
    },
    'bronchitis': {
      name: 'Bronchitis',
      description: 'Inflammation of the bronchial tubes.',
      treatment: 'Rest, fluids, cough medicine, inhalers',
      precautions: 'Avoid smoke, use humidifier, stay hydrated',
      medicines: ['Bronchodilators', 'Cough suppressants', 'Expectorants']
    },
    'pneumonia': {
      name: 'Pneumonia',
      description: 'Infection that inflames air sacs in one or both lungs.',
      treatment: 'Antibiotics, rest, fluids, oxygen therapy if severe',
      precautions: 'Get vaccinated, quit smoking, maintain good hygiene',
      medicines: ['Amoxicillin', 'Azithromycin', 'Levofloxacin']
    },
    'migraine': {
      name: 'Migraine',
      description: 'A neurological condition causing severe headaches.',
      treatment: 'Pain relievers, triptans, rest in dark room',
      precautions: 'Avoid triggers, maintain regular sleep, stay hydrated',
      medicines: ['Sumatriptan', 'Ibuprofen', 'Paracetamol']
    },
    'gastritis': {
      name: 'Gastritis',
      description: 'Inflammation of the stomach lining.',
      treatment: 'Antacids, proton pump inhibitors, avoid irritants',
      precautions: 'Avoid spicy food, reduce stress, eat small meals',
      medicines: ['Omeprazole', 'Ranitidine', 'Antacids']
    },
    'asthma': {
      name: 'Asthma',
      description: 'A condition where airways narrow and swell.',
      treatment: 'Inhalers, bronchodilators, corticosteroids',
      precautions: 'Avoid triggers, use air purifier, regular checkups',
      medicines: ['Albuterol', 'Fluticasone', 'Montelukast']
    },
    'arthritis': {
      name: 'Arthritis',
      description: 'Inflammation of one or more joints.',
      treatment: 'Pain relievers, anti-inflammatory drugs, physical therapy',
      precautions: 'Exercise regularly, maintain healthy weight, hot/cold therapy',
      medicines: ['Ibuprofen', 'Naproxen', 'Methotrexate']
    },
    'anemia': {
      name: 'Anemia',
      description: 'Lack of healthy red blood cells to carry oxygen.',
      treatment: 'Iron supplements, vitamin B12, dietary changes',
      precautions: 'Eat iron-rich foods, vitamin C for absorption',
      medicines: ['Iron supplements', 'Folic acid', 'Vitamin B12']
    },
    'diabetes': {
      name: 'Diabetes',
      description: 'Metabolic disorder with high blood sugar.',
      treatment: 'Insulin, oral medications, diet control',
      precautions: 'Monitor blood sugar, healthy diet, regular exercise',
      medicines: ['Metformin', 'Insulin', 'Glipizide']
    },
    'gastroenteritis': {
      name: 'Gastroenteritis',
      description: 'Inflammation of the stomach and intestines.',
      treatment: 'Rest, hydration, oral rehydration solution',
      precautions: 'Practice good hygiene, drink clean water, wash hands',
      medicines: ['Oral Rehydration Salts', 'Probiotics', 'Antidiarrheals']
    },
    'otitis media': {
      name: 'Otitis Media',
      description: 'Infection of the middle ear, common in children.',
      treatment: 'Antibiotics, pain relievers, ear drops',
      precautions: 'Keep ears dry, avoid inserting objects in ear',
      medicines: ['Amoxicillin', 'Ibuprofen', 'Ciprofloxacin ear drops']
    },
    'conjunctivitis': {
      name: 'Conjunctivitis (Pink Eye)',
      description: 'Inflammation of the conjunctiva of the eye.',
      treatment: 'Antibiotic eye drops, artificial tears, cold compresses',
      precautions: 'Wash hands frequently, avoid touching eyes, don\'t share towels',
      medicines: ['Antibiotic eye drops', 'Artificial tears', 'Antihistamine drops']
    },
    'sinusitis': {
      name: 'Sinusitis',
      description: 'Inflammation of the sinuses.',
      treatment: 'Decongestants, nasal sprays, saline irrigation',
      precautions: 'Use humidifier, stay hydrated, avoid allergens',
      medicines: ['Amoxicillin', 'Pseudoephedrine', 'Nasal corticosteroids']
    }
  },

  // Function to analyze symptoms and predict diseases
  analyzeSymptoms: (symptomsList) => {
    if (!symptomsList || symptomsList.length === 0) {
      return [];
    }

    const diseaseScores = {};
    
    // Score each disease based on matching symptoms
    symptomsList.forEach(symptom => {
      const symptomLower = symptom.toLowerCase().trim();
      const symptomData = diseaseDatabase.symptoms[symptomLower];
      
      if (symptomData) {
        symptomData.diseases.forEach(disease => {
          diseaseScores[disease] = (diseaseScores[disease] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort by score
    const results = Object.entries(diseaseScores)
      .map(([disease, score]) => ({
        disease,
        score,
        matchPercentage: Math.min(100, (score / 3) * 100),
        details: diseaseDatabase.diseaseDetails[disease] || null
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 predictions
    
    return results;
  }
};

export const diseaseDetectionService = {
  // Get all available symptoms
  getAllSymptoms: () => {
    return Object.keys(diseaseDatabase.symptoms);
  },
  
  // Get symptoms by category
  getSymptomsByCategory: (category) => {
    return Object.entries(diseaseDatabase.symptoms)
      .filter(([_, data]) => data.category === category)
      .map(([symptom]) => symptom);
  },
  
  // Get all categories
  getAllCategories: () => {
    const categories = new Set();
    Object.values(diseaseDatabase.symptoms).forEach(data => {
      categories.add(data.category);
    });
    return Array.from(categories);
  },
  
  // Analyze symptoms and return predictions
  predictDiseases: (symptoms) => {
    return diseaseDatabase.analyzeSymptoms(symptoms);
  },
  
  // Get disease details
  getDiseaseDetails: (diseaseName) => {
    return diseaseDatabase.diseaseDetails[diseaseName];
  },
  
  // Get recommended medicines for a disease
  getRecommendedMedicines: (diseaseName) => {
    const details = diseaseDatabase.diseaseDetails[diseaseName];
    return details ? details.medicines : [];
  },
  
  // Get treatment for a disease
  getTreatment: (diseaseName) => {
    const details = diseaseDatabase.diseaseDetails[diseaseName];
    return details ? details.treatment : 'Consult with doctor for proper treatment';
  },
  
  // Get precautions for a disease
  getPrecautions: (diseaseName) => {
    const details = diseaseDatabase.diseaseDetails[diseaseName];
    return details ? details.precautions : 'Follow doctor\'s advice';
  }
};

export default diseaseDetectionService;