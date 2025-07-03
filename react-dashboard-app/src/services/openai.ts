const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const fetchAIResponse = async (prompt: string): Promise<string> => {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
        console.warn('OpenAI API key not found');
        throw new Error('AI service is not configured. Please check your API key.');
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Use cheaper, faster model
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI study assistant. Provide clear, concise, and educational responses.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500, // Reduced for faster responses
                temperature: 0.7,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI API error:', response.status, errorData);
            
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenAI configuration.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a moment.');
            } else if (response.status >= 500) {
                throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
            } else {
                throw new Error(`OpenAI API error: ${response.status}`);
            }
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response from OpenAI API');
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        console.error('Error fetching AI response:', error);
        throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
};

export const generateTaskSuggestions = async (subject: string, difficulty: string): Promise<string[]> => {
    const prompt = `Generate 5 task suggestions for a ${difficulty} level ${subject} study session. Return only the task titles, one per line.`;
    
    try {
        const response = await fetchAIResponse(prompt);
        return response.split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
        console.error('Error generating task suggestions:', error);
        return [];
    }
};

export const summarizeNotes = async (notes: string): Promise<string> => {
    const prompt = `Please summarize the following notes in a clear and concise manner:\n\n${notes}`;
    
    try {
        return await fetchAIResponse(prompt);
    } catch (error) {
        console.error('Error summarizing notes:', error);
        throw error;
    }
};