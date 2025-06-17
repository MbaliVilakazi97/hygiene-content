import React, { useState } from 'react';
import './ContentGenerator.css';

// Cartoon character SVG components
const CartoonCharacter = ({ type }: { type: string }) => {
  switch (type) {
    case 'bubble':
      return (
        <div className="cartoon-bubble bubble-1" />
      );
    case 'bubble2':
      return (
        <div className="cartoon-bubble bubble-2" />
      );
    case 'bubble3':
      return (
        <div className="cartoon-bubble bubble-3" />
      );
    default:
      return null;
  }
};

// Cartoon background component
const CartoonBackground = () => (
  <div className="cartoon-background">
    <div className="cartoon-element" />
    <div className="cartoon-element" />
    <div className="cartoon-element" />
    <div className="cartoon-element" />
    <div className="cartoon-element" />
    <div className="sparkle" />
    <div className="sparkle" />
    <div className="sparkle" />
    <div className="sparkle" />
  </div>
);

// Prompt templates for different creative writing scenarios
const PROMPT_TEMPLATES = [
  { 
    label: 'Short Story', 
    value: 'story', 
    template: 'Write a short story about a toddler learning about hygiene.',
    emoji: '📚'
  },
  { 
    label: 'Rhyming Poem', 
    value: 'poem', 
    template: 'Create a fun rhyming poem about toddler hygiene habits.',
    emoji: '🎵'
  },
  { 
    label: 'Bedtime Story', 
    value: 'bedtime', 
    template: 'Write a gentle bedtime story about keeping clean and healthy.',
    emoji: '🌙'
  },
  { 
    label: 'Interactive Story', 
    value: 'interactive', 
    template: 'Create an interactive story where the toddler makes choices about hygiene.',
    emoji: '🎮'
  },
  { 
    label: 'Educational Tale', 
    value: 'educational', 
    template: 'Write an educational story that teaches toddlers about hygiene in a fun way.',
    emoji: '🎓'
  },
];

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const ContentGenerator: React.FC = () => {
  const [promptType, setPromptType] = useState(PROMPT_TEMPLATES[0].value);
  const [customParam1, setCustomParam1] = useState('');
  const [customParam2, setCustomParam2] = useState('');
  const [customParam3, setCustomParam3] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [performance, setPerformance] = useState<{ time?: number; tokens?: number }>({});

  const buildPrompt = () => {
    const template = PROMPT_TEMPLATES.find(t => t.value === promptType)?.template || '';
    return `${template}\nAge Group: ${customParam1}\nHygiene Focus: ${customParam2}\nLearning Objective: ${customParam3}`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');
    const start = Date.now();
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key not found. Please check your .env file.');
      setLoading(false);
      return;
    }
    const prompt = buildPrompt();
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setOutput(data.candidates[0].content.parts[0].text);
        setPerformance({ time: Date.now() - start, tokens: data.usageMetadata?.totalTokens || undefined });
      } else if (data.error) {
        setError(data.error.message || 'Unknown error from Gemini API.');
      } else {
        setError('No content generated.');
      }
    } catch (err: any) {
      setError('Failed to connect to Gemini API.');
    }
    setLoading(false);
  };

  const handleExport = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toddler-hygiene-story.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <CartoonBackground />
      <div className="content-generator-container">
        <CartoonCharacter type="bubble" />
        <CartoonCharacter type="bubble2" />
        <CartoonCharacter type="bubble3" />
        
        <h2>✨ Story Time for Little Clean Hands! ✨</h2>
        
        <form onSubmit={handleGenerate} className="content-generator-form">
          <label>
            What kind of story would you like? 📖
            <select value={promptType} onChange={e => setPromptType(e.target.value)}>
              {PROMPT_TEMPLATES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>
          </label>
          
          <label>
            How old is your little one? ��
            <input 
              value={customParam1} 
              onChange={e => setCustomParam1(e.target.value)} 
              placeholder="e.g., 2-3 years old"
              required 
            />
          </label>
          
          <label>
            What should we learn about? 🧼
            <input 
              value={customParam2} 
              onChange={e => setCustomParam2(e.target.value)} 
              placeholder="e.g., washing hands, brushing teeth"
              required 
            />
          </label>
          
          <label>
            What's the main lesson? 🎯
            <input 
              value={customParam3} 
              onChange={e => setCustomParam3(e.target.value)} 
              placeholder="e.g., germs are tiny but important"
              required 
            />
          </label>
          
          <button type="submit" disabled={loading} className="generate-button">
            {loading ? 'Creating Magic... ✨' : 'Create Story! 🎨'}
          </button>
        </form>

        {loading && <p className="loading">✨ Creating your special story... ✨</p>}
        {error && <p className="error">Oops! {error}</p>}
        
        {output && (
          <div className="output-section">
            <h3>🌟 Your Special Story 🌟</h3>
            <pre>{output}</pre>
            <button onClick={handleExport} className="export-button">
              Save Story 📥
            </button>
          </div>
        )}
        
        {performance.time && (
          <div className="performance">
            <p>✨ Story created in {performance.time}ms ✨</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ContentGenerator; 