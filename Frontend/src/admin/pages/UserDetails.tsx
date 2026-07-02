import { useEffect, useState } from "react";
import { ApiwebService } from "../../services";

type Props = {
    userId: string;
    goBack: () => void;
};

export default function UserDetails({
    userId,
    goBack
}: Props) {

    const [user, setUser] = useState<any>();

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        const result =
            await ApiwebService.getAdminUsers1(userId);

        setUser(result);
    }

    async function block() {

        await ApiwebService.putAdminUsersBlock(userId);

        loadUser();
    }

    async function unblock() {

        await ApiwebService.putAdminUsersUnblock(userId);

        loadUser();
    }

    async function remove() {

        await ApiwebService.deleteAdminUsers(userId);

        loadUser();
    }

    if (!user)
        return <h3>Loading...</h3>;

    return (

        <div>

            <button onClick={goBack}>
                Back
            </button>

            <h2>{user.userName}</h2>

            <p>Email : {user.email}</p>

            <p>Role : {user.role}</p>

            <p>Blocked : {user.isBlocked ? "Yes" : "No"}</p>

            <p>Deleted : {user.isDeleted ? "Yes" : "No"}</p>

            <button onClick={block}>
                Block
            </button>

            <button onClick={unblock}>
                Unblock
            </button>

            <button onClick={remove}>c
                Delete
            </button>

            <button>
                Message User
            </button>

        </div>

    );
}