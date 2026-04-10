"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Loader2, Copy, Download, RefreshCw, History, Check, Zap, FileText, Briefcase, Linkedin } from "lucide-react";
import { enhanceText } from "./actions";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type TabType = "resume-bullets" | "professional-bio" | "linkedin-summary";

interface HistoryItem {
  id: string;
  timestamp: number;
  type: TabType;
  input: string;
  output: string;
}

const DEMO_DATA = {
  "resume-bullets": "Managed team of 5 and did sales and increased revenue. Also used excel to track things for the boss.",
  "professional-bio": "I am a software engineer with 5 years experience. I know react and node. I like building things and working in a team.",
  "linkedin-summary": "Hi I'm John. I've been working in marketing for a long time. Looking for a new role in tech. Reach out if you have something."
};

const TAB_LABELS: Record<TabType, string> = {
  "resume-bullets": "Resume Bullets",
  "professional-bio": "Professional Bio",
  "linkedin-summary": "LinkedIn Summary"
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("resume-bullets");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Initialize history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("enhancerHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Update body class for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const saveToHistory = (input: string, output: string, type: TabType) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      type,
      input,
      output
    };
    
    const newHistory = [newItem, ...history].slice(0, 8); // Keep last 8
    setHistory(newHistory);
    localStorage.setItem("enhancerHistory", JSON.stringify(newHistory));
  };

  const handleEnhance = async (isRegenerate = false) => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    if (!isRegenerate) {
        setOutputText("");
    }

    try {
      const res = await enhanceText(activeTab, inputText);
      if (res.success && res.text) {
        setOutputText(res.text);
        saveToHistory(inputText, res.text, activeTab);
      } else {
        setError(res.error || "Something went wrong.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = async () => {
    if (!outputRef.current) return;
    
    // Create a temporary unstyled div for clean PDF generation
    const printDiv = document.createElement("div");
    printDiv.innerHTML = `<div style="font-family: Arial, sans-serif; padding: 40px; color: #000; background: #fff;">
        <h1 style="border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px;">${TAB_LABELS[activeTab]}</h1>
        <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${outputText}</div>
    </div>`;
    document.body.appendChild(printDiv);
    
    try {
      const canvas = await html2canvas(printDiv, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Enhanced_${TAB_LABELS[activeTab].replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      document.body.removeChild(printDiv);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setActiveTab(item.type);
    setInputText(item.input);
    setOutputText(item.output);
  };

  const formatDate = (ms: number) => {
    return new Date(ms).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen flex-col font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-glow">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight">AI Resume Enhancer</span>
                <span className="text-xs text-muted-foreground hidden sm:inline-block leading-tight">Turn messy text into professional gold</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} className="rounded-full hover:bg-secondary">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="container mx-auto flex-1 p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl">
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6 w-full lg:w-2/3">
          
          {/* Quick Demos */}
          <section className="flex flex-wrap gap-2 items-center">
             <span className="text-sm text-muted-foreground font-medium mr-2">Quick Try:</span>
             <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1.5 py-1"
                onClick={() => { setActiveTab("resume-bullets"); setInputText(DEMO_DATA["resume-bullets"]); setOutputText(""); }}
            >
                <FileText className="w-3 h-3"/> Resume
             </Badge>
             <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1.5 py-1"
                onClick={() => { setActiveTab("professional-bio"); setInputText(DEMO_DATA["professional-bio"]); setOutputText(""); }}
            >
                <Briefcase className="w-3 h-3"/> Bio
             </Badge>
             <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1.5 py-1"
                onClick={() => { setActiveTab("linkedin-summary"); setInputText(DEMO_DATA["linkedin-summary"]); setOutputText(""); }}
            >
                <Linkedin className="w-3 h-3"/> LinkedIn
             </Badge>
          </section>

          {/* Editor & Output Split */}
          <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-[500px]">
            
            {/* Input Panel */}
            <Card className="flex-1 flex flex-col border-border/50 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden relative">
              <CardHeader className="pb-4 bg-muted/30">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="resume-bullets">Bullets</TabsTrigger>
                    <TabsTrigger value="professional-bio">Bio</TabsTrigger>
                    <TabsTrigger value="linkedin-summary">LinkedIn</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4">
                <Textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your messy text here..."
                  className="flex-1 min-h-[250px] resize-none border-0 bg-transparent focus-visible:ring-0 p-2 text-base leading-relaxed"
                />
              </CardContent>
              <CardFooter className="p-4 bg-muted/20 border-t border-border/50">
                <Button 
                    onClick={() => handleEnhance(false)} 
                    disabled={isLoading || !inputText.trim()} 
                    className="w-full shadow-lg font-semibold"
                    size="lg"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enhancing...</>
                  ) : (
                    <><Zap className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400" /> Enhance with AI</>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Output Panel */}
            <Card className="flex-1 flex flex-col border-border/50 shadow-lg bg-primary/5 border-primary/20 xl:w-1/2">
               <CardHeader className="pb-4">
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2">
                        Result
                        {outputText && <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Polished</Badge>}
                    </CardTitle>
                 </div>
               </CardHeader>
               <CardContent className="flex-1 flex flex-col p-4 relative">
                  {error && <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-md mb-2">{error}</div>}
                  
                  {outputText ? (
                    <div ref={outputRef} className="flex-1 p-4 rounded-md bg-background border border-border/50 shadow-inner whitespace-pre-wrap leading-relaxed text-[15px]">
                        {outputText}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-md p-8 text-center bg-background/50">
                        {isLoading ? (
                            <><Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" /><p>Applying professional polish...</p></>
                        ) : (
                            <><FileText className="w-10 h-10 mb-4 opacity-50" /><p>Your polished text will appear here.</p></>
                        )}
                    </div>
                  )}
               </CardContent>
               <CardFooter className="p-4 flex gap-2 flex-wrap items-center bg-muted/10 border-t border-border/50">
                 <Button 
                    variant="secondary" 
                    onClick={copyToClipboard} 
                    disabled={!outputText || isLoading}
                    className="flex-1 sm:flex-none transition-all"
                 >
                    {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                 </Button>
                 
                 <Button 
                    variant="secondary" 
                    onClick={() => handleEnhance(true)} 
                    disabled={!outputText || isLoading}
                    className="flex-1 sm:flex-none"
                 >
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading ? "animate-spin" : "")} />
                    Regenerate
                 </Button>
                 <div className="flex-1" />
                 <Button 
                    variant="default" 
                    onClick={downloadPDF} 
                    disabled={!outputText || isLoading}
                    className="w-full sm:w-auto"
                 >
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                 </Button>
               </CardFooter>
            </Card>

          </div>
        </main>

        {/* Sidebar History */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">
          <Card className="h-full flex flex-col shadow-md border-border/50 bg-card/80">
            <CardHeader className="pb-3 px-4">
               <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="h-5 w-5" /> History
               </CardTitle>
               <CardDescription>Your recent enhancements</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[400px] lg:h-[calc(100vh-320px)] px-4">
                  {history.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No history yet.</p>
                  ) : (
                      <div className="flex flex-col gap-3 pb-4">
                          {history.map((item) => (
                              <button 
                                key={item.id} 
                                onClick={() => loadHistoryItem(item)}
                                className="text-left group bg-muted/40 hover:bg-muted/80 p-3 rounded-lg border border-border/50 transition-colors flex flex-col gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                  <div className="flex justify-between items-center w-full">
                                      <Badge variant="outline" className="text-[10px] py-0">{TAB_LABELS[item.type]}</Badge>
                                      <span className="text-[10px] text-muted-foreground">{formatDate(item.timestamp)}</span>
                                  </div>
                                  <p className="text-xs text-foreground/80 line-clamp-2">
                                      {item.input}
                                  </p>
                              </button>
                          ))}
                      </div>
                  )}
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-auto w-full py-6 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
             <span className="flex items-center gap-1">Powered by <span className="font-semibold text-foreground">Google Gemini 2.5 Flash</span></span>
          </div>
          <p className="text-xs opacity-80">Requires GEMINI_API_KEY environment variable.</p>
        </div>
      </footer>
    </div>
  );
}
