import React, { useState } from 'react';
import { Language, AIAdvisoryExplanation, CropProfile, SoilAnalysisSummary, FertilizerRecommendation, IrrigationAdvisory } from '../types';
import { I18N } from '../data/i18n';
import { askAiAssistantApi } from '../services/api';
import { Sparkles, Send, Volume2, VolumeX, MessageSquare, Bot, User, ArrowRight, ShieldCheck } from 'lucide-react';

interface ScreenAIAssistantProps {
  language: Language;
  explanation: AIAdvisoryExplanation;
  cropProfile: CropProfile;
  soilAnalysis: SoilAnalysisSummary;
  nutrientRec: FertilizerRecommendation;
  irrigationRec: IrrigationAdvisory;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onNext: () => void;
  onBack: () => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
}

export const ScreenAIAssistant: React.FC<ScreenAIAssistantProps> = ({
  language,
  explanation,
  cropProfile,
  soilAnalysis,
  nutrientRec,
  irrigationRec,
  isSpeaking,
  onToggleSpeech,
  onNext,
  onBack
}) => {
  const t = I18N[language];

  const [inputQuestion, setInputQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      sender: 'assistant',
      text: `${explanation.soilHealthSummary}\n\n${explanation.nutrientAdvice}\n\n${explanation.irrigationAdvice}`
    }
  ]);

  const quickQuestions = language === 'kn' ? [
    'ಸಾರಜನಕ (Nitrogen) ಕೊರತೆಯಾದರೆ ಬೆಳೆಗೆ ಏನಾಗುತ್ತದೆ?',
    'ಡಿಎಪಿ ಮತ್ತು ಯೂರಿಯಾ ಗೊಬ್ಬರವನ್ನು ಯಾವಾಗ ಮತ್ತು ಹೇಗೆ ಹಾಕಬೇಕು?',
    'ನನ್ನ ಬೆಳೆಗೆ ದಿನಕ್ಕೆ ಎಷ್ಟು ಲೀಟರ್ ನೀರು ಬೇಕು?',
    'ಮಣ್ಣು ಕ್ಷಾರೀಯ (Alkaline) ಆಗಿದ್ದರೆ ಜಿಪ್ಸಮ್ ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ?'
  ] : language === 'hi' ? [
    'नाइट्रोजन की कमी से फसल पर क्या प्रभाव पड़ता है?',
    'डीएपी और यूरिया कब और कैसे डालें?',
    'मेरी फसल को रोजाना कितने लीटर पानी की जरूरत है?',
    'क्षारीय मिट्टी में जिप्सम का क्या उपयोग है?'
  ] : [
    'Why is Nitrogen deficient and what does it mean for my crop?',
    'When should I apply DAP and Urea in the growth stages?',
    'How much water in Litres does my crop require today?',
    'How does Gypsum help with alkaline soil pH?'
  ];

  const handleSend = async (qToSend?: string) => {
    const q = (qToSend || inputQuestion).trim();
    if (!q) return;

    const userMsg: ChatMessage = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsTyping(true);

    try {
      const answer = await askAiAssistantApi(
        q,
        language,
        cropProfile,
        soilAnalysis,
        nutrientRec,
        irrigationRec
      );
      setMessages(prev => [...prev, { sender: 'assistant', text: answer }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: 'AgroSense AI is processing your agricultural context. Follow the verified fertilizer and irrigation timetable.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="screen-container">
      <div className="hero-box">
        <div className="hero-badge">
          <Sparkles className="hero-badge-icon text-amber" />
          <span>Grounded Gemini Agricultural Intelligence</span>
        </div>
        <h1 className="hero-title">{t.aiTitle}</h1>
        <p className="hero-subtitle">{t.aiSubtitle}</p>
      </div>

      {/* Advisory Speech Player Bar */}
      <div className="audio-hero-player">
        <div className="audio-player-info">
          <Volume2 className="player-icon text-emerald" />
          <div>
            <strong>Multilingual Audio Narration</strong>
            <p>Listen to your soil health, fertilizer dosage and water requirements read aloud</p>
          </div>
        </div>
        <button
          type="button"
          className={`btn-audio-hero ${isSpeaking ? 'active-speaking' : ''}`}
          onClick={onToggleSpeech}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="btn-icon animate-pulse" />
              <span>{t.voiceStop}</span>
            </>
          ) : (
            <>
              <Volume2 className="btn-icon" />
              <span>{t.voiceListen}</span>
            </>
          )}
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="chat-window-card">
        <div className="chat-messages-container">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-message-bubble ${m.sender === 'user' ? 'msg-user' : 'msg-bot'}`}>
              <div className="msg-avatar">
                {m.sender === 'user' ? <User className="avatar-icon" /> : <Bot className="avatar-icon" />}
              </div>
              <div className="msg-content">
                <span className="msg-sender-name">{m.sender === 'user' ? 'Farmer' : 'AgroSense AI'}</span>
                <p className="msg-text-body">{m.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message-bubble msg-bot">
              <div className="msg-avatar">
                <Bot className="avatar-icon animate-spin" />
              </div>
              <div className="msg-content">
                <span className="typing-dots">AgroSense AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggested Questions */}
        <div className="quick-questions-strip">
          <span className="quick-label">{t.sampleQuestions}</span>
          <div className="quick-pills-row">
            {quickQuestions.map((qq, i) => (
              <button
                key={i}
                type="button"
                className="quick-question-pill"
                onClick={() => handleSend(qq)}
              >
                {qq}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="chat-text-input"
          />
          <button type="submit" className="chat-send-btn">
            <Send className="btn-send-icon" />
            <span>{t.send}</span>
          </button>
        </form>
      </div>

      <div className="grounding-footer-note">
        <ShieldCheck className="note-icon text-emerald" />
        <span>Grounded Agricultural Safety: The AI model does not independently invent fertilizer dosages; all recommendations are strictly anchored to verified STCR formulations.</span>
      </div>

      {/* Action Footer */}
      <div className="screen-action-footer">
        <button type="button" className="btn-secondary" onClick={onBack}>
          {t.back}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          <MessageSquare className="btn-icon" />
          <span>View Final Advisory Report</span>
          <ArrowRight className="btn-arrow" />
        </button>
      </div>
    </div>
  );
};
