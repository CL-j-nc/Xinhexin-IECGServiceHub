import React, { useState } from 'react';

type View = "home" | "chat";

const ChatWidget: React.FC = () => {
    const [view, setView] = useState<View>("home");
    const [messages, setMessages] = useState<string[]>([]);

    const handleSendMessage = (message: string) => {
        setMessages([...messages, message]);
        setView("chat");
    };

    return (
        <div>
            {view === "home" && (
                <div>
                    <h1>欢迎使用聊天机器人</h1>
                    <p>如何查询保单的缴费状态？</p>
                    <button onClick={() => setView("chat")}>开始聊天</button>
                </div>
            )}
            {view === "chat" && (
                <div>
                    <h1>聊天窗口</h1>
                    <ul>
                        {messages.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                                handleSendMessage(e.currentTarget.value.trim());
                                e.currentTarget.value = "";
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatWidget;