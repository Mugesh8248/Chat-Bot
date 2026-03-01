import React, { useState } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import axios from "axios";

export default function App() {

  const [messages, setMessages] = useState([]);

  const onSend = async (newMessages = []) => {

    setMessages(previous => GiftedChat.append(previous, newMessages));

    const userMessage = newMessages[0].text;

    try {
      const res = await axios.post("http://192.168.0.119:8000/chat", {
        message: userMessage
      });

      const botMessage = {
        _id: Math.random().toString(),
        text: res.data.reply,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "Groq AI"
        }
      };

      setMessages(previous => GiftedChat.append(previous, [botMessage]));

    } catch (error) {

      const errorMessage = {
        _id: Math.random().toString(),
        text: "⚠️ Server error. Please try again.",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "Groq AI"
        }
      };

      setMessages(previous => GiftedChat.append(previous, [errorMessage]));

      console.log(error);

    }
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: 1,
        name: "User"
      }}
    />
  );
}