import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import UserDetails from "./UserDetails";
import CreateUserModal from "../components/CreateUserModal";

export default function UsersPage() {

    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>();
    const [showCreateModal, setShowCreateModal] = useState(false);
    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        const result = await ApiwebService.getAdminUsers();
        setUsers(result);
    }

    if (selectedUser)
        return (
            <UserDetails
                userId={selectedUser.id}
                goBack={() => {
                    setSelectedUser(null);
                    loadUsers();
                }}
            />
        );

    return (
        <div>

            <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    }}
>
    <h2>Users</h2>

    <button
        onClick={() => setShowCreateModal(true)}
    >
        + Create User
    </button>
</div>

            <table
                border={1}
                cellPadding={8}
                style={{ borderCollapse: "collapse" }}
            >

                <thead>

                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Blocked</th>
                        <th>Deleted</th>
                        <th></th>
                    </tr>

                </thead>

                <tbody>

                    {users.map(user => (

                        <tr key={user.id}>

                            <td>{user.userName}</td>

                            <td>{user.email}</td>

                            <td>{user.isBlocked ? "Yes" : "No"}</td>

                            <td>{user.isDeleted ? "Yes" : "No"}</td>

                            <td>

                                <button
                                    onClick={() => setSelectedUser(user)}
                                >
                                    View
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            {showCreateModal && (
    <CreateUserModal
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
            loadUsers();
            setShowCreateModal(false);
        }}
    />
)}

        </div>
    );
}