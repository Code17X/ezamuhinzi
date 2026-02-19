import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import HomeButton from "@/components/HomeButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoiceInput, useVoiceSpeech } from "@/hooks/useVoice";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Assistant = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Muraho! Ndi umujyanama wawe w'ubuhinzi ukoresha AI. Ndashobora kugufasha mu bibazo by'ubuzima bw'amatungo cyangwa gusesengura amafoto y'ibihingwa kugira ngo namenye indwara. Nshobora kubafasha gute uyu munsi?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const { toast } = useToast();

  const { isListening, transcript, isSupported: micSupported, startListening, stopListening, resetTranscript } = useVoiceInput(i18n.language);
  const { isSpeaking, speak, stopSpeaking } = useVoiceSpeech(i18n.language);

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    resetTranscript();
    setIsLoading(true);

    let assistantMessage = "";
    const assistantId = (Date.now() + 1).toString();

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vet-chat`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ 
            role: m.role, 
            content: m.content 
          })),
          language: i18n.language
        }),
      });

      if (response.status === 429) {
        toast({ title: "Rate Limit", description: "Too many requests. Please try again later.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast({ title: "Payment Required", description: "Please add funds to continue using AI features.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantMessage } : m
                  );
                }
                return [...prev, { id: assistantId, role: "assistant", content: assistantMessage }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Auto-speak the response
      if (autoSpeak && assistantMessage) {
        speak(assistantMessage);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to get response. Please try again.", variant: "destructive" });
      setIsLoading(false);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleImageAnalyzed = (analysis: string, imageUrl: string) => {
    const imageMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `[Image uploaded: ${imageUrl}]`,
    };
    const analysisMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: analysis,
    };
    setMessages((prev) => [...prev, imageMessage, analysisMessage]);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <Navigation />
      <HomeButton />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t('assistant.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('assistant.description')}
            </p>
          </div>

          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    {t('assistant.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('assistant.chatDescription')}
                  </CardDescription>
                </div>
                {/* Auto-speak toggle */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="auto-speak" className="text-xs text-muted-foreground">
                    {i18n.language === 'rw' ? '🔊 Ijwi' : i18n.language === 'fr' ? '🔊 Voix' : '🔊 Voice'}
                  </Label>
                  <Switch
                    id="auto-speak"
                    checked={autoSpeak}
                    onCheckedChange={setAutoSpeak}
                  />
                </div>
              </div>
            </CardHeader>
            
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-4">
                <TabsTrigger value="chat" className="flex-1">{t('assistant.chat')}</TabsTrigger>
                <TabsTrigger value="analyze" className="flex-1">{t('assistant.analyzeCrop')}</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto" style={{ minHeight: '200px', maxHeight: 'calc(100vh - 400px)' }}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : "text-left"}`}>
                        <div className={`inline-block p-3 rounded-lg ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          {message.content}
                        </div>
                        {/* Speak button for assistant messages */}
                        {message.role === "assistant" && (
                          <button
                            onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
                            className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                            title={isSpeaking ? "Stop" : "Listen"}
                          >
                            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                <div className="border-t p-4">
                  {/* Voice recording indicator */}
                  {isListening && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-destructive/10 rounded-lg animate-pulse">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                      <span className="text-sm text-destructive font-medium">
                        {i18n.language === 'rw' ? '🎙️ Mvuga...' : i18n.language === 'fr' ? '🎙️ Parlez...' : '🎙️ Listening...'}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {/* Mic button */}
                    {micSupported && (
                      <Button
                        variant={isListening ? "destructive" : "outline"}
                        size="icon"
                        onClick={handleMicToggle}
                        className="flex-shrink-0"
                        title={isListening ? "Stop" : "Speak"}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                    )}
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      placeholder={t('assistant.askQuestion')}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analyze" className="flex-1 flex flex-col m-0 p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('assistant.analyzeDescription')}
                  </p>
                  <ImageUpload onImageAnalyzed={handleImageAnalyzed} />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Assistant;
