'use client';

import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({maxSteps: 3});
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto">
      <div className="space-y-2">
        {messages.map(m => (
          <div key={m.id} className="px-4">
            <div className="font-bold text-sm mb-1">{m.role}</div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {m.content.length > 0 ? (
                <ReactMarkdown className="leading-normal">{m.content}</ReactMarkdown>
              ) : (
                <span className="italic font-light text-sm">
                  {'calling tool: ' + m?.toolInvocations?.[0].toolName}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}