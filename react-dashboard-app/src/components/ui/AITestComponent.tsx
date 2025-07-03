import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

const AITestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testAPIKey = () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');
  };

  const testSimpleRequest = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('VITE_OPENAI_API_KEY environment variable is not set');
      }

      console.log('Making request to OpenAI...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say hello!' }],
          max_tokens: 50,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      setResponse(data.choices[0].message.content);
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">AI Service Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={testAPIKey}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check API Key
        </button>

        <button
          onClick={testSimpleRequest}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Testing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Test AI Request</span>
            </>
          )}
        </button>

        {response && (
          <div className="p-3 bg-green-50 border border-green-200 rounded flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Success!</p>
              <p className="text-green-700">{response}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITestComponent;
