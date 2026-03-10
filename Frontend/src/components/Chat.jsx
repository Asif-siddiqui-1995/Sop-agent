import {useEffect, useRef, useState} from "react";
import "./Chat.css";

export default function Chat({onClose}) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        {
            from: "bot",
            text: "Hi 👋 I'm OpsMind, and I'll help you with company SOPs.",
            time: "5:55 PM",
        },
        {
            from: "bot",
            text: "What would you like to know?",
            time: "5:55 PM",
        },
    ]);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef(null);
    const bodyRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        bodyRef.current?.scrollTo({
            top: bodyRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, sources]);

    const sendQuestion = async () => {
        if (!input.trim() || loading) return;

        const userText = input;

        const userMessage = {
            from: "user",
            text: userText,
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setSources([]);
        setLoading(true);

        const response = await fetch("http://localhost:5000/api/chat/chat", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({question: userText}),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let botText = "";

        setMessages((prev) => [...prev, {from: "bot", text: "", time: "…"}]);

        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);

            if (chunk.includes('"type":"sources"')) {
                const json = JSON.parse(chunk.replace("data: ", ""));
                setSources(json.sources);
            } else {
                botText += chunk.replace("data: ", "");
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].text = botText;
                    return updated;
                });
            }
        }

        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    };

    return (
        <div className="chat-overlay" onClick={onClose}>
            <div className="chat-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-title">🧠 OpsMind AI</div>
                    <button className="chat-close" onClick={() => onClose?.()}>
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="chat-body" ref={bodyRef}>
                    <div className="chat-date">October 15, 2024</div>

                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-message ${msg.from}`}>
                            <div className="chat-bubble">
                                {msg.text || "Thinking…"}
                            </div>
                            <div className="chat-time">{msg.time}</div>
                        </div>
                    ))}

                    {sources.length > 0 && (
                        <div className="chat-sources">
                            <div className="sources-title">Sources</div>
                            <ul>
                                {sources.map((src, i) => (
                                    <li key={i}>
                                        📄 {src.filename}
                                        {src.page && ` — Page ${src.page}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="chat-input">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question… (Enter to send)"
                        rows={2}
                        disabled={loading}
                    />
                    <button onClick={sendQuestion} disabled={loading}>
                        {loading ? "…" : "Send"}
                    </button>
                </div>

                <div className="chat-footer">Powered by OpsMind AI</div>
            </div>
        </div>
    );
}
