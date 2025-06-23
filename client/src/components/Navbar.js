"use client";

import Link from "next/link";
import { AiOutlineHome, AiOutlineBell, AiOutlineUser } from "react-icons/ai";
import { FaFeatherAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "./LogoutButton";
import Image from "next/image";

export default function Navbar() {
  const { accessToken, userId } = useAuth();

  return (
    <>
      <nav className="bg-white text-black h-screen fixed w-64 hidden md:flex flex-col justify-between p-4 border-r border-gray-300">
        <div>
          <Link href="/home" className="mb-8 flex items-center gap-3">
            <Image src="/breezy-logo.svg" alt="Logo" width={40} height={40} className="mx-1" />
            <span className="text-2xl font-bold">Breezy</span>
          </Link>


          <div className="space-y-6">
            <Link
              href="/home"
              className="flex items-center gap-4 text-xl hover:text-indigo-600 transition"
            >
              <AiOutlineHome size={28} />
              <span>Accueil</span>
            </Link>

            <Link
              href="/notifications"
              className="flex items-center gap-4 text-xl hover:text-indigo-600 transition"
            >
              <AiOutlineBell size={28} />
              <span>Notifications</span>
            </Link>

            <Link
              href={`/profile/${userId}`}
              className="flex items-center gap-4 text-xl hover:text-indigo-600 transition"
            >
              <AiOutlineUser size={28} />
              <span>Profil</span>
            </Link>

            {accessToken && (
              <div className="mt-6">
                <LogoutButton />
              </div>
            )}
          </div>
        </div>

        {accessToken && (
          <Link
            href="/create-post"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 mt-6"
          >
            <FaFeatherAlt />
            <span className="hidden lg:inline">Poster</span>
          </Link>
        )}
      </nav>

      <nav className="bg-white text-black fixed bottom-0 left-0 right-0 h-16 flex md:hidden justify-around items-center border-t border-gray-300 z-50">
        <Link
          href="/home"
          className="flex flex-col items-center justify-center hover:text-indigo-600 transition"
        >
          <AiOutlineHome size={26} />
        </Link>

        <Link
          href="/notifications"
          className="flex flex-col items-center justify-center hover:text-indigo-600 transition"
        >
          <AiOutlineBell size={26} />
        </Link>

        <Link
          href="/create-post"
          className="bg-indigo-600 p-3 rounded-full hover:bg-indigo-700 text-white"
        >
          <FaFeatherAlt size={20} />
        </Link>

        <Link
          href={`/profile/${userId}`}
          className="flex flex-col items-center justify-center hover:text-indigo-600 transition"
        >
          <AiOutlineUser size={26} />
        </Link>
      </nav>
    </>
  );
}