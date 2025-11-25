import React, { useState } from 'react';
import { ChevronLeft, FileText, Upload, Check, Loader2, Download, AlertCircle, Sparkles } from 'lucide-react';
import { generateOptimizedCVDocument } from '../services/geminiService';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Initialize pdfMake fonts safely
try {
    // @ts-ignore
    if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
        // @ts-ignore
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
    } else if (pdfFonts && (pdfFonts as any).vfs) {
        // @ts-ignore
        pdfMake.vfs = (pdfFonts as any).vfs;
    }
} catch (e) {
    console.error("Erro ao inicializar fontes do PDFMake:", e);
}

interface CvOptimizerProps {
    onBack: () => void;
}

const CvOptimizer: React.FC<CvOptimizerProps> = ({ onBack }) => {
    const [file, setFile] = useState<File | null>(null);
    const [targetRole, setTargetRole] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleOptimize = async () => {
        if (!file || !targetRole) {
            setError("Por favor, faça upload do CV e defina o cargo alvo.");
            return;
        }

        setIsOptimizing(true);
        setError(null);

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const mimeType = file.type;

                const result = await generateOptimizedCVDocument(base64, mimeType, targetRole);

                if (result) {
                    setOptimizedData(result);
                } else {
                    setError("Falha ao otimizar. Tente novamente.");
                }
                setIsOptimizing(false);
            };
        } catch (e) {
            console.error(e);
            setError("Erro ao processar arquivo.");
            setIsOptimizing(false);
        }
    };

    const generatePDF = () => {
        if (!optimizedData) return;

        const docDefinition = {
            content: [
                { text: optimizedData.fullName, style: 'header' },
                { text: optimizedData.contactInfo.join(' | '), style: 'subheader', margin: [0, 0, 0, 20] },

                { text: 'Resumo Profissional', style: 'sectionHeader' },
                { text: optimizedData.summary, margin: [0, 0, 0, 15] },

                { text: 'Experiência Profissional', style: 'sectionHeader' },
                ...optimizedData.experience.map((exp: any) => [
                    { text: `${exp.role} - ${exp.company}`, style: 'jobTitle' },
                    { text: exp.period, style: 'date', margin: [0, 0, 0, 5] },
                    { ul: exp.achievements, margin: [0, 0, 0, 15] }
                ]).flat(),

                { text: 'Formação Acadêmica', style: 'sectionHeader' },
                ...optimizedData.education.map((edu: any) => [
                    { text: `${edu.degree} - ${edu.institution}`, style: 'jobTitle' },
                    { text: edu.year, style: 'date', margin: [0, 0, 0, 10] }
                ]).flat(),

                { text: 'Habilidades', style: 'sectionHeader' },
                { text: optimizedData.skills.join(', '), margin: [0, 0, 0, 20] }
            ],
            styles: {
                header: { fontSize: 22, bold: true, alignment: 'center', color: '#0f172a' },
                subheader: { fontSize: 10, alignment: 'center', color: '#64748b' },
                sectionHeader: { fontSize: 14, bold: true, color: '#009c3b', margin: [0, 10, 0, 5], decoration: 'underline' },
                jobTitle: { fontSize: 12, bold: true, color: '#334155' },
                date: { fontSize: 10, italics: true, color: '#94a3b8' }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        pdfMake.createPdf(docDefinition).download(`CV_Otimizado_${optimizedData.fullName.split(' ')[0]}.pdf`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 border-b border-slate-200 sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="font-bold text-lg text-slate-800">Otimizador de CV</h1>
            </div>

            <div className="flex-1 p-6 max-w-2xl mx-auto w-full">

                {!optimizedData ? (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                IA Headhunter
                            </h2>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Faça upload do seu currículo atual e diga qual vaga você quer. Nossa IA vai reescrever seu CV para passar nos robôs (ATS) e encantar recrutadores.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">1. Qual o cargo desejado?</label>
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="Ex: Desenvolvedor Front-end Sênior"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">2. Seu Currículo Atual (PDF)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="cv-upload"
                                    />
                                    <label
                                        htmlFor="cv-upload"
                                        className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
                                    >
                                        {file ? (
                                            <>
                                                <Check className="w-8 h-8 text-emerald-500 mb-2" />
                                                <p className="text-sm font-bold text-emerald-700">{file.name}</p>
                                                <p className="text-xs text-emerald-600">Clique para trocar</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                <p className="text-sm font-bold text-slate-600">Toque para enviar PDF</p>
                                                <p className="text-xs text-slate-400">Máx. 5MB</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleOptimize}
                                disabled={isOptimizing || !file || !targetRole}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${isOptimizing ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'}`}
                            >
                                {isOptimizing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Otimizando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Gerar Novo CV
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-emerald-100 border border-emerald-200 rounded-2xl p-6 text-center">
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                                <Check className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-emerald-800 mb-2">CV Otimizado!</h2>
                            <p className="text-emerald-700 text-sm mb-6">
                                Sua versão ATS-Friendly para <strong>{targetRole}</strong> está pronta.
                            </p>

                            <button
                                onClick={generatePDF}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                            >
                                <Download className="w-5 h-5" />
                                Baixar PDF Agora
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4">Prévia do Conteúdo</h3>

                            <div className="space-y-4 text-sm text-slate-600">
                                <div>
                                    <p className="font-bold text-slate-800">Resumo</p>
                                    <p className="italic bg-slate-50 p-3 rounded-lg border border-slate-100">{optimizedData.summary}</p>
                                </div>

                                <div>
                                    <p className="font-bold text-slate-800">Skills Destacadas</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {optimizedData.skills.map((s: string, i: number) => (
                                            <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setOptimizedData(null);
                                setFile(null);
                            }}
                            className="w-full text-slate-500 font-bold py-3 hover:text-slate-700 transition-colors"
                        >
                            Otimizar Outro Currículo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CvOptimizer;
