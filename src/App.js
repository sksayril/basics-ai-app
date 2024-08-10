import React, { useState } from 'react';
import './App.css';

function App() {
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleSendMessage = async () => {
        if (!chatInput) {
            alert('Please enter a message!');
            return;
        }

        // Display user's message
        setChatMessages(prevMessages => [
            ...prevMessages, 
            { type: 'user-message', content: chatInput }
        ]);

        const userMessage = chatInput;
        setChatInput(''); // Clear input after sending

        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2/v1/chat/completions",
                {
                    headers: {
                        Authorization: "Bearer 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", // Replace with your actual API key
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({
                        model: "mistralai/Mistral-7B-Instruct-v0.2",
                        messages: [{ role: "user", content: userMessage }],
                        max_tokens: 500,
                        stream: false,
                    }),
                }
            );

            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
            }

            const result = await response.json();
            const botResponse = result.choices[0].message.content || "I'm sorry, I couldn't process that.";

            // Display bot's response
            setChatMessages(prevMessages => [
                ...prevMessages, 
                { type: 'bot-message', content: botResponse }
            ]);
        } catch (error) {
            // Display error as bot's response
            setChatMessages(prevMessages => [
                ...prevMessages, 
                { type: 'bot-message', content: `An error occurred: ${error.message}` }
            ]);
            console.error(error);
        }
    };

    const handleGenerateImage = async () => {
        if (!imagePrompt) {
            alert('Please enter a prompt for image generation!');
            return;
        }

        setLoading(true);
        setProgress(20);

        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
                {
                    headers: {
                        Authorization: "Bearer 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", // Replace with your actual API key
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({ "inputs": imagePrompt }),
                }
            );

            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
            }

            setProgress(70);

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setGeneratedImage(url);

            setProgress(100);
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
            console.error(error);
        } finally {
            setLoading(false);
            setTimeout(() => setProgress(0), 1000); // Reset progress after a short delay
        }
    };

    return (
        <div className="main-container">
            <div className="image-gen-container">
                <h2>AI Image Generation</h2>
                <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Enter a prompt for image generation"
                />
                <button onClick={handleGenerateImage} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Image'}
                </button>
                {loading && (
                    <div id="loadingBar" className="loading-bar">
                        <div className="progress" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
                {generatedImage && (
                    <div id="result">
                        <img id="generatedImage" src={generatedImage} alt="Generated" />
                    </div>
                )}
            </div>

            <div className="chatbot-container">
                <h2>AI Chatbot</h2>
                <div id="chatWindow" className="chat-window">
                    {chatMessages.map((message, index) => (
                        <div key={index} className={`message ${message.type}`}>
                            {message.content}
                        </div>
                    ))}
                </div>
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me something..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}

export default App;
