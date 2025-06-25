"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { useLang } from "@/context/LangContext";
import { dictionaries } from "@/utils/dictionaries";

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const dict = dictionaries[lang];

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
      <span>{dict.logout}</span>
    </button>
  );
}
