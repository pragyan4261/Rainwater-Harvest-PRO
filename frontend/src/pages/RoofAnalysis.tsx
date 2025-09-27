import React, { useState, useRef } from 'react';
// Markdown renderer (installed via react-markdown + remark-gfm)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types will resolve after dependency installation
import ReactMarkdown from 'react-markdown';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import remarkGfm from 'remark-gfm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MainLayout from '../layouts/MainLayout';
import styles from './RoofAnalysis.module.css';
import { 
  UploadIcon, 
  ImageIcon, 
  SendIcon, 
  RefreshCcwIcon, 
  Loader2Icon, 
  BarChart2Icon, 
  DropletIcon, 
  SparklesIcon,
  ZapIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  EyeIcon,
  MessageCircleIcon,
  CameraIcon
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RoofAIAnalysis {
  quality: string;
  score: number;
  notes: string[];
  recommendations: string[];
  areaEstimate?: number | null;
  captureQuality: string;
  runoffPotential: string;
  summary?: string;
}

const RoofAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RoofAIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: 'Upload a rooftop satellite or drone image to begin. I\'ll estimate collection suitability and you can ask follow‑up questions.'
  }]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysis(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const b64 = await toBase64(selectedFile);
      const res = await fetch('/api/roof-ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64, filename: selectedFile.name })
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data: RoofAIAnalysis = await res.json();
      setAnalysis(data);
      setMessages(prev => [...prev, { role: 'assistant', content: `Analysis complete. Score: ${data.score}/100 (Quality: ${data.quality}). ${data.summary || ''}` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Analysis failed. Please try another image or retry later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setMessages([{ role: 'assistant', content: 'Upload a rooftop image to begin a new analysis.' }]);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatError(null);
    setChatLoading(true);
    try {
      const res = await fetch('/api/roof-ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].filter(m => m.role !== 'system'),
          analysis
        })
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e: unknown) {
      setChatError('Failed to get AI response.');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had an issue generating a response.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Header Section with Gradient Background */}
      <div className="relative mb-8 -mx-6 -mt-6 px-6 pt-8 pb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">AI Roof Analysis</h1>
                <p className="text-blue-600 font-medium">Advanced computer vision for rainwater harvesting assessment</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <CameraIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Upload</span>
              </div>
              <div className="w-8 h-px bg-gradient-to-r from-blue-300 to-transparent"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <ZapIcon className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Analyze</span>
              </div>
              <div className="w-8 h-px bg-gradient-to-r from-green-300 to-transparent"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <TrendingUpIcon className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Optimize</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left / Main Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Image Upload and Analysis Section */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Roof Image Analysis</h2>
                </div>
                {analysis && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Analysis Complete</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                    previewUrl 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    {previewUrl ? (
                      <div className="relative group">
                        <img 
                          src={previewUrl} 
                          alt="Roof Preview" 
                          className="max-h-80 w-full object-contain rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300" 
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-300 flex items-center justify-center">
                          <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <ImageIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700 mb-2">Upload Roof Image</p>
                          <p className="text-sm text-gray-500 mb-4 max-w-xs">
                            Drop your roof image here or click to browse. 
                            Best results with clear aerial or satellite views.
                          </p>
                        </div>
                        <div className="flex pb-3 flex-wrap gap-2 justify-center text-xs text-gray-400">
                          <span className="px-2 py-1 bg-white rounded-full border">JPG</span>
                          <span className="px-2 py-1 bg-white rounded-full border">PNG</span>
                          <span className="px-2 py-1 bg-white rounded-full border">Max 10MB</span>
                        </div>
                      </div>
                    )}
                    
                    {!previewUrl && (
                      <Button 
                        variant="primary" 
                        size="lg"
                        onClick={triggerFilePicker} 
                        icon={<UploadIcon size={18} />}
                      >
                        Choose Image
                      </Button>
                    )}
                    
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      aria-label="Upload roof image" 
                      title="Upload roof image" 
                    />
                  </div>

                  {previewUrl && (
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={triggerFilePicker} 
                        icon={<UploadIcon size={14} />}
                      >
                        Change Image
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={runAnalysis} 
                        disabled={loading} 
                        icon={loading ? <Loader2Icon className="animate-spin" size={16} /> : <SparklesIcon size={16} />}
                      >
                        {loading ? 'Analyzing...' : 'AI Analyze'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={reset} 
                        icon={<RefreshCcwIcon size={14} />}
                      >
                        Reset
                      </Button>
                    </div>
                  )}
                </div>

                {/* Analysis Results Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart2Icon className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
                  </div>

                  {!analysis && (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                        <BarChart2Icon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium mb-2">Ready for Analysis</p>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                          Upload a clear roof image and click "AI Analyze" to get detailed 
                          suitability metrics for rainwater harvesting.
                        </p>
                      </div>
                    </div>
                  )}

                  {analysis && (
                    <div className="space-y-6">
                      {/* Score Cards Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs uppercase tracking-wide text-blue-600 font-bold">Overall Score</p>
                            <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-3xl font-bold text-blue-700 mb-1">{analysis.score}</p>
                          <p className="text-xs text-blue-600 font-medium">out of 100</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs uppercase tracking-wide text-green-600 font-bold">Quality Rating</p>
                            <TrendingUpIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-xl font-bold text-green-700 mb-1">{analysis.quality}</p>
                          <p className="text-xs text-green-600 font-medium">Assessment</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs uppercase tracking-wide text-indigo-600 font-bold">Capture Potential</p>
                            <ZapIcon className="h-4 w-4 text-indigo-600" />
                          </div>
                          <p className="text-sm font-bold text-indigo-700">{analysis.runoffPotential}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs uppercase tracking-wide text-amber-600 font-bold">Capture Quality</p>
                            <DropletIcon className="h-4 w-4 text-amber-600" />
                          </div>
                          <p className="text-sm font-bold text-amber-700">{analysis.captureQuality}</p>
                        </div>
                      </div>

                      {/* AI Summary */}
                      {analysis.summary && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                              <SparklesIcon className="h-3 w-3 text-purple-600" />
                            </div>
                            <p className="text-sm uppercase tracking-wide text-purple-600 font-bold">AI Summary</p>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
                        </div>
                      )}

                      {/* Detailed Analysis */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                            <EyeIcon className="h-4 w-4 text-blue-600 mr-2" />
                            Key Observations
                          </h4>
                          <ul className="space-y-2">
                            {analysis.notes.map((note, i) => (
                              <li key={i} className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-gray-700">{note}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                            <TrendingUpIcon className="h-4 w-4 text-green-600 mr-2" />
                            Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {analysis.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-gray-700">{rec}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          {/* Technical Insights Section */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <ZapIcon className="h-4 w-4 text-slate-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Advanced Processing</h2>
                </div>
                <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                  Coming Soon
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <EyeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Computer Vision</h3>
                  <p className="text-sm text-gray-600">Roof segmentation and material detection</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <DropletIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Flow Analysis</h3>
                  <p className="text-sm text-gray-600">Water runoff pathway modeling</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUpIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">3D Modeling</h3>
                  <p className="text-sm text-gray-600">Surface elevation and slope analysis</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our advanced AI pipeline will soon include real-time segmentation overlays, 
                  contour detection visuals, and intelligent runoff pathway estimation. These 
                  features will provide detailed technical insights for optimal rainwater 
                  harvesting system design.
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Roof Detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Material Classification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Slope Analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right / Chat Column */}
        <div className="xl:col-span-1">
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 h-[700px] flex flex-col">
            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <MessageCircleIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
                    <p className="text-xs text-blue-600 font-medium">Ask about your roof analysis</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      isUser 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-8' 
                        : 'bg-white text-gray-800 border border-gray-200 mr-8'
                    }`}>
                      {isUser ? (
                        <p className="text-sm leading-relaxed">{m.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              ul: (props: React.HTMLAttributes<HTMLUListElement>) => 
                                <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                              ol: (props: React.HTMLAttributes<HTMLOListElement>) => 
                                <ol className="list-decimal ml-4 space-y-1 my-2" {...props} />,
                              strong: (props: React.HTMLAttributes<HTMLElement>) => 
                                <strong className="font-semibold text-gray-900" {...props} />,
                              p: (props: React.HTMLAttributes<HTMLParagraphElement>) => 
                                <p className="mb-2 last:mb-0 text-gray-700" {...props} />
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 mr-8">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className={`w-2 h-2 bg-gray-400 rounded-full animate-bounce ${styles.bounceDelay1}`}></div>
                        <div className={`w-2 h-2 bg-gray-400 rounded-full animate-bounce ${styles.bounceDelay2}`}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {chatError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mr-8">
                  <p className="text-sm text-red-600">{chatError}</p>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-stretch gap-3">
                <div className="flex-1 relative">
                  <input
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    placeholder="Ask about debris, slope, materials, or filtration..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        sendChat(); 
                      } 
                    }}
                    disabled={chatLoading}
                  />
                </div>
                <Button 
                  variant="primary" 
                  onClick={sendChat} 
                  disabled={chatLoading || !chatInput.trim()} 
                  icon={<SendIcon size={16} />}
                >
                  Send
                </Button>
              </div>
              
              <div className="mt-3 flex items-center justify-center">
                <p className="text-xs text-gray-500 text-center max-w-sm">
                  <SparklesIcon className="h-3 w-3 inline mr-1" />
                  AI responses are illustrative. Computer vision analysis coming soon.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default RoofAnalysis;
