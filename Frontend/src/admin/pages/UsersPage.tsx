import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";
import UserDetails from "./UserDetails";

export default function UsersPage() {

    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>();

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

            <h2>Users</h2>

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

        </div>
    );
}