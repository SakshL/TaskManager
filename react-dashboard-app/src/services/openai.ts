const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const fetchAIResponse = async (prompt: string): Promise<string> => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching AI response:', error);
        throw error;
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