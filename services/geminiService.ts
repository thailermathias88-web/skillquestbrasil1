import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, QuizData, DiscResult, DiscAnalysisDetails, SkillGapAnalysis, InterviewPrepData, SalaryData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCandidateProfile = async (
  targetRole: string,
  experienceLevel: string,
  quizData: QuizData,
  cvBase64: string,
  cvMimeType: string
): Promise<AnalysisResult> => {

  const model = "gemini-2.5-flash";

  const prompt = `
    You are an elite AI Headhunter and Career Coach. 
    1. ANALYZE the attached CV image/PDF deeply. 
    2. The candidate wants to be a "${targetRole}" (${experienceLevel}).
    3. Motivation: "${quizData.motivation}".

    Task:
    - Extract the candidate's real name and their most recent job title from the CV.
    - Analyze their HARD and SOFT skills found in the document vs the requirements for ${targetRole}.
    - Assign a realistic score (0-100) based on years of experience and keyword density.
    - Create a 3-step immediate roadmap.
    - Create a PREMIUM 7-Day Soft Skill Action Plan. This must be extremely high quality.
      For each day, provide:
      - A concrete action.
      - A specific reading recommendation (Book title or famous Article name).
      - An introspection question.
      - A practical tool or technique (e.g., Pomodoro, STAR Method, Non-Violent Communication).

    Return JSON (PT-BR):
    {
      "extractedName": "Name found in CV",
      "extractedLastRole": "Last position found in CV",
      "matchScore": 0-100,
      "skills": [
         { "name": "Skill Name", "category": "hard" | "soft", "level": "Iniciante" | "Intermediário" | "Avançado", "score": 0-100 }
      ],
      "roadmap": [
         { "title": "Step title", "description": "Actionable advice" }
      ],
      "softSkillPlan": [ 
         { 
           "day": "Dia 1", 
           "title": "Topic (e.g. Comunicação)", 
           "action": "Specific task to do today", 
           "whyItMatters": "Context", 
           "toolOrTip": "Technique name",
           "readingRecommendation": "Book or Article Title",
           "estimatedTime": "15 min",
           "reflectionQuestion": "Question for journaling"
         }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cvMimeType,
              data: cvBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedName: { type: Type.STRING },
            extractedLastRole: { type: Type.STRING },
            matchScore: { type: Type.INTEGER },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["hard", "soft"] },
                  level: { type: Type.STRING, enum: ["Iniciante", "Intermediário", "Avançado", "Expert"] },
                  score: { type: Type.INTEGER }
                }
              }
            },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            softSkillPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  title: { type: Type.STRING },
                  action: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  toolOrTip: { type: Type.STRING },
                  readingRecommendation: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  reflectionQuestion: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);

    // CRITICAL: Safety checks to prevent 'map of undefined'
    if (!data.skills) data.skills = [];
    if (!data.roadmap) data.roadmap = [];
    if (!data.softSkillPlan) data.softSkillPlan = [];

    return data as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      matchScore: 0,
      extractedName: "Visitante",
      skills: [],
      roadmap: [],
      softSkillPlan: []
    };
  }
};

export const generateSkillGapAnalysis = async (
  skillName: string,
  currentScore: number,
  targetRole: string
): Promise<SkillGapAnalysis> => {
  const model = "gemini-2.5-flash";
  const prompt = `
        Atue como um mentor técnico sênior.
        O candidato tem a habilidade "${skillName}" com um nível de proficiência aproximado de ${currentScore}%.
        O objetivo dele é o cargo: "${targetRole}".

        Explique o que falta para ele chegar a 100% (Nível Expert/Referência) nesta habilidade específica.
        Seja técnico e direto.

        Retorne JSON:
        {
            "currentStatus": "Uma frase curta definindo o momento atual dele (ex: Você domina o básico, mas falta profundidade em X)",
            "missingPoints": ["Ponto 1 (tecnologia ou conceito avançado)", "Ponto 2", "Ponto 3"],
            "actionPlan": "Uma dica prática de estudo ou projeto para fechar esse gap."
        }
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentStatus: { type: Type.STRING },
            missingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionPlan: { type: Type.STRING }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "{}");

    // Safety check
    if (!data.missingPoints) data.missingPoints = [];

    return data as SkillGapAnalysis;
  } catch (e) {
    return {
      currentStatus: "Análise indisponível.",
      missingPoints: ["Continue praticando.", "Busque projetos reais."],
      actionPlan: "Estude a documentação oficial."
    };
  }
}


export const generateDiscFeedback = async (targetRole: string, discType: string, discName: string): Promise<DiscAnalysisDetails> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are an expert organizational psychologist.
    Candidate Profile: DISC Profile ${discType} (${discName}).
    Target Role: "${targetRole}".

    Analyze the compatibility between this personality type (Primary and Secondary factors) and the specific demands of this role in Brazil.
    
    Return JSON:
    {
        "matchScore": number (0-100 compatibility),
        "synergies": ["point 1", "point 2"], (Why they will succeed)
        "blindSpots": ["point 1", "point 2"], (Risks they need to watch out for)
        "communicationTip": "One golden rule for them in this role."
    }
    All in PT-BR.
  `;
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            synergies: { type: Type.ARRAY, items: { type: Type.STRING } },
            blindSpots: { type: Type.ARRAY, items: { type: Type.STRING } },
            communicationTip: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    // CRITICAL: Safety checks for Premium Dashboard
    if (!data.synergies || !Array.isArray(data.synergies)) data.synergies = ["Perfil altamente adaptável."];
    if (!data.blindSpots || !Array.isArray(data.blindSpots)) data.blindSpots = ["Atenção aos detalhes.", "Gestão de tempo."];
    if (!data.communicationTip) data.communicationTip = "Seja claro e objetivo.";

    return data as DiscAnalysisDetails;

  } catch (e) {
    return {
      matchScore: 50,
      synergies: ["Análise indisponível no momento."],
      blindSpots: ["Tente novamente mais tarde."],
      communicationTip: "Seja você mesmo."
    };
  }
}

export const getSalaryData = async (role: string, experience: string): Promise<SalaryData> => {
  const model = "gemini-2.5-flash";
  const prompt = `
        Aja como um especialista sênior em remuneração (C&B) no Brasil.
        Cargo: "${role}"
        Nível: "${experience}"

        1. Estime os salários CLT mensais médios (Júnior, Pleno, Sênior).
        2. Variação Regional: Você DEVE retornar EXATAMENTE 4 objetos no array 'regionalData', com os seguintes nomes de região:
           - "Sudeste (SP/RJ)"
           - "Sul (Curitiba/Poa)"
           - "Nordeste (Recife/SSA)"
           - "Remoto/Tech"
           Calcule a média real para o nível Pleno nessas regiões.
        3. Estratégia de Negociação: Crie 2 argumentos sólidos baseados em valor (não peça por pedir).

        Retorne estritamente JSON:
        {
            "junior": number,
            "pleno": number,
            "senior": number,
            "marketDemand": "Alta" | "Média" | "Baixa",
            "regionalData": [
                { "region": "Sudeste (SP/RJ)", "factor": "Base 100%", "average": 1234 },
                { "region": "Sul (Curitiba/Poa)", "factor": "-10% vs SP", "average": 1234 },
                { "region": "Nordeste (Recife/SSA)", "factor": "-20% vs SP", "average": 1234 },
                { "region": "Remoto/Tech", "factor": "Competitivo", "average": 1234 }
            ],
            "negotiationStrategy": {
                "mainArgument": "Texto do argumento principal",
                "secondaryArgument": "Texto do argumento secundário",
                "closingPhrase": "Frase de fechamento"
            }
        }
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            junior: { type: Type.INTEGER },
            pleno: { type: Type.INTEGER },
            senior: { type: Type.INTEGER },
            marketDemand: { type: Type.STRING },
            regionalData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  region: { type: Type.STRING },
                  factor: { type: Type.STRING },
                  average: { type: Type.INTEGER }
                }
              }
            },
            negotiationStrategy: {
              type: Type.OBJECT,
              properties: {
                mainArgument: { type: Type.STRING },
                secondaryArgument: { type: Type.STRING },
                closingPhrase: { type: Type.STRING }
              }
            }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "{}");

    // Ensure arrays and objects exist to prevent UI crashes
    if (!data.regionalData || !Array.isArray(data.regionalData)) {
      data.regionalData = [];
    }

    if (!data.negotiationStrategy) {
      data.negotiationStrategy = {
        mainArgument: "Destaque seus resultados e impacto nos projetos anteriores.",
        secondaryArgument: "Mencione sua evolução técnica e aprendizado contínuo.",
        closingPhrase: "Estou aberto a ouvir a proposta da empresa."
      };
    }

    // Ensure numeric values exist
    if (typeof data.junior !== 'number') data.junior = 0;
    if (typeof data.pleno !== 'number') data.pleno = 0;
    if (typeof data.senior !== 'number') data.senior = 0;

    return data;
  } catch (e) {
    console.error(e);
    return {
      junior: 3000,
      pleno: 5000,
      senior: 8000,
      marketDemand: "Média",
      regionalData: [],
      negotiationStrategy: {
        mainArgument: "Foque nos resultados.",
        secondaryArgument: "Mostre evolução.",
        closingPhrase: "Estou à disposição."
      }
    };
  }
};

export const getInterviewPrep = async (role: string, type: 'behavioral' | 'technical' | 'case-study' = 'behavioral'): Promise<InterviewPrepData> => {
  const model = "gemini-2.5-flash";

  let prompt = "";
  let schema: any = {};

  if (type === 'case-study') {
    prompt = `
            Crie 3 "Estudos de Caso" distintos, detalhados e inspiradores sobre candidatos que conseguiram vagas de "${role}".
            
            IMPORTANTE:
            - NÃO use nomes como "Empresa Fictícia", "TechCorp" ou "Empresa X".
            - Use contextos REAIS brasileiros (ex: "Uma grande varejista em São José dos Campos", "Uma startup fintech na Faria Lima em SP", "Uma indústria em Curitiba").
            - Cada história deve mostrar como o candidato superou um desafio específico.

            Estrutura para cada um dos 3 casos:
            1. Perfil (experiência, desafio).
            2. Cenário/Desafio técnico ou situacional que ele enfrentou.
            3. "Key Question" (Pergunta chave) do recrutador.
            4. Resposta/comportamento vencedor do candidato.
            5. Análise: Por que ele foi contratado.

            Retorne JSON (PT-BR).
        `;
    schema = {
      type: Type.OBJECT,
      properties: {
        caseStudies: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              candidateProfile: { type: Type.STRING },
              scenario: { type: Type.STRING },
              challenge: { type: Type.STRING },
              keyQuestion: { type: Type.STRING },
              candidateResponse: { type: Type.STRING },
              whyTheyGotHired: { type: Type.STRING }
            }
          }
        }
      }
    };

  } else if (type === 'technical') {
    prompt = `
            Prepare um candidato para entrevista de: "${role}".
            Foco: Perguntas TÉCNICAS (Hard Skills).

            1. Gere EXATAMENTE 5 perguntas frequentes e difíceis.
            2. "bestAnswer": Uma resposta técnica profunda e correta.
            3. "recruiterTip": O que o tech lead avalia na resposta.
            
            NÃO GERE DRESS CODE PARA ESTA SEÇÃO.

            Retorne JSON (PT-BR).
        `;
    schema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              bestAnswer: { type: Type.STRING },
              recruiterTip: { type: Type.STRING }
            }
          }
        }
      }
    };
  } else {
    // Behavioral Q&A
    prompt = `
            Prepare um candidato para entrevista de: "${role}".
            Foco: Perguntas COMPORTAMENTAIS (Soft Skills/Culture Fit).

            1. Gere EXATAMENTE 5 perguntas frequentes.
            2. "bestAnswer": Uma resposta MATADORA (Gold Standard) usando método STAR.
            3. "recruiterTip": O que o recrutador realmente quer ouvir (segredo de bastidores).
            4. Inclua um DRESS CODE adequado para essa área.

            Retorne JSON (PT-BR).
        `;
    schema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              bestAnswer: { type: Type.STRING },
              recruiterTip: { type: Type.STRING }
            }
          }
        },
        dressCode: {
          type: Type.OBJECT,
          properties: {
            attire: { type: Type.STRING },
            description: { type: Type.STRING },
            donts: { type: Type.ARRAY, items: { type: Type.STRING } },
            arrivalTime: { type: Type.STRING }
          }
        }
      }
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const result = JSON.parse(response.text || "{}");

    // Safety checks
    if (!result.questions) result.questions = [];
    if (!result.caseStudies) result.caseStudies = [];
    if (result.dressCode && !result.dressCode.donts) result.dressCode.donts = [];

    // Tag the result with the requested type for UI handling
    return { ...result, type: type === 'case-study' ? 'case-study' : 'qa' };

  } catch (e) {
    console.error(e);
    // Fallback
    return {
      type: 'qa',
      questions: [{ id: 1, question: "Erro ao gerar", bestAnswer: "Tente novamente.", recruiterTip: "Erro na IA." }],
      dressCode: { attire: "Social", description: "Roupa formal.", donts: [], arrivalTime: "10 min antes" }
    };
  }
};

export const optimizeCVContent = async (
  cvBase64: string,
  cvMimeType: string,
  targetRole: string
): Promise<import('../types').CVOptimizationResult> => {
  const model = "gemini-2.5-flash";
  const prompt = `
        Você é um especialista em otimização de currículos e sistemas ATS (Applicant Tracking System).
        
        Analise o currículo anexado e otimize-o para a vaga de: "${targetRole}"
        
        Sua tarefa:
        1. Reescreva o resumo profissional de forma impactante e alinhada à vaga
        2. Identifique e destaque as skills mais relevantes para a vaga
        3. Liste melhorias específicas que aumentarão a taxa de aprovação em sistemas ATS
        4. Calcule um score ATS (0-100) baseado em:
           - Uso de palavras-chave relevantes
           - Formatação adequada
           - Clareza e objetividade
           - Alinhamento com a vaga
        5. Forneça sugestões práticas de melhoria
        
        Retorne JSON (PT-BR):
        {
            "optimizedSummary": "Resumo profissional otimizado (2-3 frases impactantes)",
            "highlightedSkills": ["Skill 1", "Skill 2", "Skill 3", ...],
            "keyImprovements": ["Melhoria 1", "Melhoria 2", "Melhoria 3"],
            "atsScore": 0-100,
            "suggestions": ["Sugestão prática 1", "Sugestão prática 2", ...]
        }
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cvMimeType,
              data: cvBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedSummary: { type: Type.STRING },
            highlightedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            keyImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            atsScore: { type: Type.INTEGER },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    // Safety checks
    if (!data.highlightedSkills || !Array.isArray(data.highlightedSkills)) {
      data.highlightedSkills = [];
    }
    if (!data.keyImprovements || !Array.isArray(data.keyImprovements)) {
      data.keyImprovements = [];
    }
    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      data.suggestions = [];
    }
    if (typeof data.atsScore !== 'number') {
      data.atsScore = 0;
    }
    if (!data.optimizedSummary) {
      data.optimizedSummary = "Resumo não disponível.";
    }

    return data;

  } catch (e) {
    console.error("CV Optimization Error:", e);
    return {
      optimizedSummary: "Erro ao otimizar currículo. Tente novamente.",
      highlightedSkills: [],
      keyImprovements: [],
      atsScore: 0,
      suggestions: ["Tente fazer upload novamente do seu currículo."]
    };
  }
};

export const generateInterviewQuestion = async (role: string, topic: string): Promise<{ question: string }> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are an expert technical interviewer for the role of "${role}".
    Topic: "${topic}".

    Generate a single, challenging, but fair interview question.
    It should be conversational, as if spoken in a real interview.
    Keep it under 30 words.
    Language: PT-BR.

    Return JSON: { "question": "The question text" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { text: prompt },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"question": "Conte-me sobre você."}');
  } catch (e) {
    console.error(e);
    return { question: "Poderia me falar um pouco sobre sua experiência profissional?" };
  }
};

export const evaluateInterviewAnswer = async (question: string, answer: string): Promise<{ score: number, feedback: string, improvement: string }> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are an expert interview coach.
    Question: "${question}"
    Candidate Answer (Spoken): "${answer}"

    Evaluate the answer based on clarity, relevance, and confidence.
    
    Return JSON (PT-BR):
    {
      "score": 0-10,
      "feedback": "One sentence on what was good.",
      "improvement": "One specific tip to improve this answer."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { text: prompt },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"score": 0, "feedback": "Erro ao avaliar.", "improvement": "Tente novamente."}');
  } catch (e) {
    console.error(e);
    return { score: 0, feedback: "Não foi possível avaliar sua resposta.", improvement: "Verifique sua conexão e tente novamente." };
  }
};