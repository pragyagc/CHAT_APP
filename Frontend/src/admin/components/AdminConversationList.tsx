import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";

type Props = {
    onSelectConversation: (conversation: any) => void;
};

export default function AdminConversationList({
    onSelectConversation
}: Props) {

    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {

        const result = await ApiwebService.getAdminUsers();

        // Don't show admins or deleted users
        setUsers(
            result.filter(
                (u: any) =>
                    u.role !== "Admin" &&
                    !u.isDeleted
            )
        );
    }

    async function openChat(user: any) {
        try {

        // Create (or get) the conversation
        const createdConversation =
            await ApiwebService.postConversations(user.id);

        // Load the complete conversation list
        const conversations =
            await ApiwebService.getConversations();

        // Find the conversation we just created/opened
        const fullConversation = conversations.find(
            (c: any) => c.id === createdConversation.id
        );

        console.log(fullConversation);

        if (fullConversation) {
            onSelectConversation(fullConversation);
        }

    } catch (err) {
        console.error(err);
        alert("Unable to open chat.");
    }}

    return (

        <div>

            <h3 style={{ padding: 15 }}>
                Users
            </h3>

            {users.map(user => (

                <div
                    key={user.id}
                    onClick={() => openChat(user)}
                    style={{
                        padding: 15,
                        borderBottom: "1px solid #eee",
                        cursor: "pointer"
                    }}
                >

                    <b>{user.userName}</b>

                    <br />

                    {user.email}

                </div>

            ))}

        </div>

    );
}