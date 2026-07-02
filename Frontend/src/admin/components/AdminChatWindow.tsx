import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";

type Props = {
    conversation: any;
};

export default function AdminChatWindow({
    conversation
}: Props) {

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");

    useEffect(() => {

        load();

    }, [conversation]);

    async function load() {

        const result =
            await ApiwebService.getMessagesConversation(
                conversation.id
            );

        setMessages(result);
    }

    async function send() {

        if (!text.trim())
            return;

        const msg =
            await ApiwebService.postMessages({

                conversationId:
                    conversation.id,

                content: text

            });

        setMessages(prev => [...prev, msg]);

        setText("");
    }

    return (

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%"
            }}
        >

            <div
                style={{
                    padding: 20,
                    borderBottom: "1px solid lightgray"
                }}
            >
                <h3>{conversation.otherUserName}</h3>
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 20
                }}
            >

                {messages.map((m: any) => (

                    <div
                        key={m.id}
                        style={{
                            marginBottom: 10
                        }}
                    >

                        <b>{m.sender?.userName}</b>

                        <br />

                        {m.text}

                    </div>

                ))}

            </div>

            <div
                style={{
                    display: "flex",
                    padding: 20,
                    gap: 10
                }}
            >

                <input
                    style={{ flex: 1 }}
                    value={text}
                    onChange={(e) =>
                        setText(e.target.value)
                    }
                />

                <button
                    onClick={send}
                >
                    Send
                </button>

            </div>

        </div>

    );
}