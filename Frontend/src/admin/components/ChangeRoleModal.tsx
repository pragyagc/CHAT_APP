import { useState } from "react";
import { ApiwebService } from "../../services";
import { toast } from "react-toastify";

type Props = {
    user: any;
    close: () => void;
    refresh: () => void;
};

export default function ChangeRoleModal({
    user,
    close,
    refresh
}: Props) {

    const [role,setRole] = useState(user.role);

    const handleSave = async()=>{

        try{
            await ApiwebService.putAdminUsersRole({
                userId: user.id,
                role
            });

            toast.success("Role changed");
            refresh();
            close();

        }catch(error){
            toast.error("Failed to change role");
        }
    }


    return (
        <div className="modal">

            <h3>
                Change Role for {user.email}
            </h3>


            <select
                value={role}
                onChange={(e)=>setRole(e.target.value)}
            >
                <option value="User">
                    User
                </option>

                <option value="Admin">
                    Admin
                </option>

            </select>


            <button onClick={handleSave}>
                Save
            </button>

            <button onClick={close}>
                Cancel
            </button>

        </div>
    );
}