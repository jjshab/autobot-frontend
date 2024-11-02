import React, { useState } from 'react';
import axios from 'axios';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{ sender: string; text: string }>
  >([]);
  const [inputValue, setInputValue] = useState('');

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();

    // Add user message to chat history
    setMessages([...messages, { sender: 'User', text: userMessage }]);
    setInputValue('');

    try {
      const response = await axios.post('/api/runFlow', {
        flowIdOrName: '1d6fc45c-6a2a-4390-aad5-7c2d5446fbfe', // Replace with your actual flow ID
        langflowId: '8e5d7633-a80d-430d-8451-0d958740fc9a', // Replace with your actual LangFlow ID
        inputValue: userMessage,
        inputType: 'chat',
        outputType: 'chat',
        tweaks: {},
      });

      const data = response.data;

      if (data && data.outputs) {
        const flowOutputs = data.outputs[0];
        const firstComponentOutputs = flowOutputs.outputs[0];
        const output = firstComponentOutputs.outputs.message;

        // Add chatbot response to chat history
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'AutoBot', text: output.message.text },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'AutoBot', text: 'An error occurred. Please try again.' },
      ]);
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender}: </strong>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') sendMessage();
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
