
import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { DiscResult } from '../types';

interface DiscTestModalProps {
  onClose: () => void;
  onComplete: (result: DiscResult) => void;
}

// Full 12-question simplified DISC test in PT-BR - IMPROVED CONTENT
const questions = [
  {
    id: 1,
    text: "Em um projeto em grupo, qual papel você assume naturalmente?",
    options: [
      { type: 'D', text: "O Líder: Tomo a frente, defino as metas e cobro resultados da equipe." },
      { type: 'I', text: "O Motivador: Trago ideias criativas, mantenho o clima leve e facilito a comunicação." },
      { type: 'S', text: "O Apoiador: Ouço a todos, ajudo na execução e garanto a harmonia do grupo." },
      { type: 'C', text: "O Analista: Organizo o cronograma, reviso os detalhes e garanto a qualidade técnica." }
    ]
  },
  {
    id: 2,
    text: "O que mais te estressa ou desmotiva no ambiente de trabalho?",
    options: [
      { type: 'D', text: "Lentidão, indecisão e reuniões que não levam a lugar nenhum." },
      { type: 'I', text: "Tarefas repetitivas, isolamento social e excesso de burocracia rígida." },
      { type: 'S', text: "Pressão agressiva, conflitos constantes e mudanças bruscas sem planejamento." },
      { type: 'C', text: "Desorganização, falta de processos claros e trabalhos feitos 'nas coxas'." }
    ]
  },
  {
    id: 3,
    text: "Diante de uma decisão difícil e urgente, como você age?",
    options: [
      { type: 'D', text: "Decido rápido e com pragmatismo, focado no resultado final, mesmo assumindo riscos." },
      { type: 'I', text: "Confio na minha intuição e considero quem será impactado pela decisão." },
      { type: 'S', text: "Busco conselhos, pondero as consequências e tento uma solução segura para todos." },
      { type: 'C', text: "Analiso dados e fatos, comparo cenários e decido com base na lógica para não errar." }
    ]
  },
  {
    id: 4,
    text: "Qual destas características as pessoas mais elogiam em você?",
    options: [
      { type: 'D', text: "Sua ousadia, coragem e capacidade de resolver problemas." },
      { type: 'I', text: "Seu carisma, entusiasmo e facilidade de convencer as pessoas." },
      { type: 'S', text: "Sua paciência, lealdade e disposição para ajudar a qualquer hora." },
      { type: 'C', text: "Seu perfeccionismo, organização e alto padrão de qualidade." }
    ]
  },
  {
    id: 5,
    text: "Ao receber uma tarefa totalmente nova, qual é seu primeiro passo?",
    options: [
      { type: 'D', text: "Começo imediatamente, aprendendo enquanto faço para entregar logo." },
      { type: 'I', text: "Faço um brainstorming com colegas para buscar ideias inovadoras." },
      { type: 'S', text: "Procuro entender o método padrão e peço instruções claras antes de iniciar." },
      { type: 'C', text: "Pesquiso a fundo, leio a documentação e planejo cada etapa para evitar erros." }
    ]
  },
  {
    id: 6,
    text: "Como você lida com conflitos ou discussões?",
    options: [
      { type: 'D', text: "Enfrento diretamente e defendo meu ponto de vista para vencer o argumento." },
      { type: 'I', text: "Tento usar a diplomacia e o humor para quebrar o gelo e persuadir." },
      { type: 'S', text: "Evito o confronto a todo custo; prefiro ceder para manter a paz." },
      { type: 'C', text: "Uso lógica e evidências concretas para provar quem está correto." }
    ]
  },
  {
    id: 7,
    text: "O que te faz sentir realizado profissionalmente?",
    options: [
      { type: 'D', text: "Superar metas desafiadoras, ter autonomia e poder de decisão." },
      { type: 'I', text: "Ser reconhecido publicamente, elogiado e ter liberdade criativa." },
      { type: 'S', text: "Ter estabilidade, segurança e saber que meu trabalho ajuda os outros." },
      { type: 'C', text: "Ver um trabalho complexo concluído com perfeição e sem falhas." }
    ]
  },
  {
    id: 8,
    text: "Qual é o seu maior medo no contexto profissional?",
    options: [
      { type: 'D', text: "Fracassar, perder minha autonomia ou parecer incompetente." },
      { type: 'I', text: "Ser rejeitado, ignorado ou perder o prestígio com o grupo." },
      { type: 'S', text: "Perder a estabilidade financeira ou enfrentar mudanças repentinas e caóticas." },
      { type: 'C', text: "Ser criticado pela qualidade do meu trabalho ou cometer um erro grave." }
    ]
  },
  {
    id: 9,
    text: "Qual é o seu estilo de comunicação preferido?",
    options: [
      { type: 'D', text: "Direto e objetivo: 'Vá direto ao ponto'." },
      { type: 'I', text: "Expressivo e envolvente: 'Gosto de contar histórias e interagir'." },
      { type: 'S', text: "Calmo e atencioso: 'Prefiro ouvir mais do que falar'." },
      { type: 'C', text: "Formal e detalhado: 'Prefiro por escrito, com todos os dados'." }
    ]
  },
  {
    id: 10,
    text: "O que você pensa sobre regras e procedimentos?",
    options: [
      { type: 'D', text: "São úteis, mas se atrapalharem o resultado, eu as questiono ou contorno." },
      { type: 'I', text: "Acho chatas e restritivas; prefiro flexibilidade para inovar." },
      { type: 'S', text: "São importantes para manter a ordem e garantir que todos saibam o que fazer." },
      { type: 'C', text: "São essenciais e devem ser seguidas à risca para garantir a qualidade." }
    ]
  },
  {
    id: 11,
    text: "Quando você está sob pressão extrema, qual comportamento tende a surgir?",
    options: [
      { type: 'D', text: "Torno-me impaciente, autoritário e exijo rapidez dos outros." },
      { type: 'I', text: "Fico ansioso, desorganizado e busco aprovação excessiva." },
      { type: 'S', text: "Me fecho, concordo com tudo para evitar problemas e internalizo o estresse." },
      { type: 'C', text: "Torno-me excessivamente crítico, perfeccionista e travo nos detalhes." }
    ]
  },
  {
    id: 12,
    text: "Qual destas frases poderia ser o seu lema?",
    options: [
      { type: 'D', text: "\"Missão dada é missão cumprida. Resultados acima de tudo.\"" },
      { type: 'I', text: "\"Juntos vamos mais longe. O importante é criar conexões.\"" },
      { type: 'S', text: "\"Devagar e sempre. A consistência é a chave do sucesso.\"" },
      { type: 'C', text: "\"Se é para fazer, que seja bem feito. A excelência está nos detalhes.\"" }
    ]
  }
];

const profiles = {
  'D': { name: 'Dominante', desc: 'Focado em resultados, direto e assertivo.' },
  'I': { name: 'Influente', desc: 'Comunicativo, otimista e persuasivo.' },
  'S': { name: 'Estável', desc: 'Paciente, leal e bom ouvinte.' },
  'C': { name: 'Conforme', desc: 'Analítico, preciso e detalhista.' }
};

export const DiscTestModal: React.FC<DiscTestModalProps> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [rawScores, setRawScores] = useState({ D: 0, I: 0, S: 0, C: 0 });

  const handleAnswer = (type: 'D' | 'I' | 'S' | 'C') => {
    const newScores = { ...rawScores, [type]: rawScores[type] + 1 };
    setRawScores(newScores);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      finishTest(newScores);
    }
  };

  const finishTest = (finalScores: { D: number, I: number, S: number, C: number }) => {
    // 1. Calculate Percentages
    const total = 12;
    const scoresPercent = {
        D: Math.round((finalScores.D / total) * 100),
        I: Math.round((finalScores.I / total) * 100),
        S: Math.round((finalScores.S / total) * 100),
        C: Math.round((finalScores.C / total) * 100),
    };

    // 2. Find Winners (Primary & Secondary)
    // Convert to array to sort
    const sorted = Object.entries(finalScores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0][0] as 'D' | 'I' | 'S' | 'C';
    const secondary = sorted[1][0] as 'D' | 'I' | 'S' | 'C';

    const result: DiscResult = {
        primary: primary,
        secondary: secondary,
        scores: scoresPercent,
        name: `${profiles[primary].name}-${profiles[secondary].name}`,
        description: profiles[primary].desc
    };
    onComplete(result);
  };

  const currentQ = questions[step];
  const progress = ((step) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Teste DISC Profissional</h2>
                <p className="text-xs text-slate-500">Questão {step + 1} de {questions.length}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
                <X className="w-5 h-5 text-slate-400" />
            </button>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-slate-100 w-full">
             <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Question Area */}
        <div className="p-6 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-slate-900 mb-6 leading-snug">{currentQ.text}</h3>

            <div className="space-y-3">
                {currentQ.options.map((opt, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleAnswer(opt.type as any)}
                        className="w-full p-4 text-left rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 active:bg-indigo-100 transition-all flex items-center justify-between group touch-manipulation"
                    >
                        <span className="text-sm md:text-base text-slate-700 font-medium group-hover:text-indigo-900 leading-relaxed">{opt.text}</span>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
