"use client"
import Link from "next/link";
import { AiOutlineUser } from 'react-icons/ai';
import LogoutButton from "./LogoutButton";
import { useAuth } from "@/context/AuthContext";


export default function Navbar() {
    const { accessToken } = useAuth();

    return (
        <nav className="bg-black text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/home">
                    <span className="text-2xl font-bold cursor-pointer">Breezy</span>
                </Link>
                <div className="flex space-x-4">
                    <Link href="/profile">
                        <AiOutlineUser className="text-2xl cursor-pointer" />
                    </Link>
                    {accessToken && <LogoutButton />}
                </div>
            </div>
        </nav>
    );
}