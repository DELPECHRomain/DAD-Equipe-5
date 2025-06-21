"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-4 text-xl hover:text-indigo-600 transition w-full text-left cursor-pointer"
    >
      <FiLogOut size={28} />
      <span>Déconnexion</span>
    </button>
  );
}
