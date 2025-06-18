"use client"


export default function Loader() {

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-800 mb-4"></div>
                <p className="text-indigo-800 text-lg font-semibold">Chargement en cours...</p>
            </div>
        </div>
    );
}