import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import { connection } from "../../signalr/connection";

type Props = {
    conversation: any;
};

export default function AdminChatWindow({
    conversation
}: Props) {

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");
    

  useEffect(() => {
    if (!conversation) return;

    load();
    joinConversation();

    return () => {
        connection.invoke("LeaveConversation", conversation.id).catch(() => {});
        connection.off("ReceiveMessage");
    };

}, [conversation?.id]);

    async function load() {

        const result =
            await ApiwebService.getMessagesConversation(
                conversation.id
            );

        setMessages(result);
    }

    async function joinConversation() {
 



  await connection.invoke("JoinConversation", conversation.id);

  connection.off("ReceiveMessage");

  connection.on("ReceiveMessage", (msg: any) => {
    if (msg.conversationId !== conversation.id) return;

    setMessages(prev => [...prev, msg]);
  });
}

    async function send() {

        if (!text.trim())
            return;

        await connection.invoke
        (
            "SendMessage",conversation.id,text
        );

setText("");

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