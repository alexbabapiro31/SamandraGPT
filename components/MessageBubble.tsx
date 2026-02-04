import React from 'react';
import { Message, MessageRole } from '../types';
import { IconRobot } from './Icons';

interface MessageBubbleProps {
  message: Message;
}

// Simple text formatter to handle basic markdown-like structures
// For a production app, use 'react-markdown'
const formatContent = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        inCodeBlock = false;
        elements.push(
          <div key={`code-${idx}`} className="bg-gray-950 border border-gray-800 rounded-lg p-4 my-2 overflow-x-auto font-mono text-sm text-green-400 shadow-inner">
            <pre>{codeBuffer.join('\n')}</pre>
          </div>
        );
        codeBuffer = [];
      } else {
        // Start code block
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      codeBuffer.push(line);
    } else {
      // Bold text handling (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const lineContent = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      
      if (line.trim() === '') {
        elements.push(<br key={`br-${idx}`} />);
      } else {
        elements.push(<p key={`p-${idx}`} className="mb-1 leading-relaxed">{lineContent}</p>);
      }
    }
  });

  return elements;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.User;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isUser ? 'bg-gray-700' : 'bg-gradient-to-br from-primary-600 to-purple-600'}`}>
          {isUser ? (
            <span className="text-xs font-bold text-gray-300">YO</span>
          ) : (
             <IconRobot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Content Bubble */}
        <div className={`
          relative p-4 rounded-2xl shadow-xl border
          ${isUser 
            ? 'bg-gray-800 border-gray-700 text-gray-100 rounded-tr-none' 
            : 'bg-gray-900/80 backdrop-blur-sm border-primary-500/30 text-gray-200 rounded-tl-none ring-1 ring-primary-500/20'
          }
        `}>
          {message.role === MessageRole.Model && (
            <div className="absolute -top-3 left-0 bg-gray-950 border border-primary-900/50 text-[10px] text-primary-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
               Gemini Omega
            </div>
          )}

          {message.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
              <img src={message.imageUrl} alt="Generated" className="w-full h-auto object-cover" />
            </div>
          )}
          
          <div className="text-sm md:text-base break-words">
            {message.isThinking ? (
                <div className="flex items-center space-x-2 text-primary-400 animate-pulse">
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-150"></span>
                    <span className="text-xs font-mono ml-2">ADVANCED REASONING...</span>
                </div>
            ) : (
                formatContent(message.content)
            )}
          </div>
          
          <div className="text-[10px] text-gray-500 mt-2 text-right opacity-60">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;