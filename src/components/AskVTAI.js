"use client";
import { useState } from 'react';


export default function AskVTAI() {
  // const [activeTab, setActiveTab] = useState('Last Day');
  const [question, setQuestion] = useState('');

  const suggestedQuestions = [
    'What are the top 5 news events today?',
    'Which companies are making headlines in the business world within the past week?',
    'What are the most trending topics in politics today?'
  ];

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-extrabold">Ask Aboki AI</h2>
        <button className="text-gray-500 hover:text-black">
          <i className="fas fa-expand"></i>
        </button>
      </div>



      {/* Suggested Questions Section */}
      <div className="flex flex-wrap gap-2 mt-4">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs"
          >
            {question}
          </button>
        ))}
      </div>

      {/* Ask a Question Input */}
      <div className="flex items-center mt-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a Question"
          className="flex-grow p-2 border rounded-l-full bg-gray-100 text-sm outline-none"
        />
        <button className="bg-gray-300 p-2 rounded-r-full">
          <i className="fas fa-paper-plane text-gray-600"></i>
        </button>
      </div>
    </div>
  );
}
