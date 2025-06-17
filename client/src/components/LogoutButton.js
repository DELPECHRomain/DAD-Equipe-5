
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


export default function LogoutButton({ className}) {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className={`bg-indigo-800 text-white rounded hover:bg-blue-800 hover:cursor-pointer`}
        >
        Déconnexion
        </button>
    );
}
