import { useState } from "react";
import AdminConversationList from "../components/AdminConversationList";
import AdminChatWindow from "../components/AdminChatWindow";

export default function AdminChat() {

    const [conversation, setConversation] = useState<any>(null);

    return (

        <div
            style={{
                display: "flex",
                height: "100%"
            }}
        >

            <div
                style={{
                    width: 300,
                    borderRight: "1px solid lightgray"
                }}
            >
                <AdminConversationList
                    onSelectConversation={setConversation}
                />
            </div>

            <div style={{ flex: 1 }}>

                {conversation ? (
                    <AdminChatWindow
                        conversation={conversation}
                    />
                ) : (
                    <div style={{ padding: 20 }}>
                        Select a user
                    </div>
                )}

            </div>

        </div>

    );
}