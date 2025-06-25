"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LangContext";
import { dictionaries } from "@/utils/dictionaries";

export default function NotificationsPage() {
  const { accessToken, userId } = useAuth();
  const { lang } = useLang();
  const dict = dictionaries[lang];
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !userId) return;
    setLoading(true);

    fetch(`http://localhost:3003/notification-service/notifications/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [accessToken, userId]);

  if (loading) {
    return <div className="p-8 text-center">{dict.loading}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">{dict.notifications}</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">{dict.noNotifications || "Aucune notification."}</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li key={notif._id} className="bg-gray-100 rounded-lg p-4">
              {notif.type === "like" && (
                <span>
                  <b>{notif.fromUserDisplayName}</b> {dict.likedYourPost || "a aimé votre post."}
                </span>
              )}
              {notif.type === "follow" && (
                <span>
                  <b>{notif.fromUserDisplayName}</b> {dict.followedYou || "a commencé à vous suivre."}
                </span>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {new Date(notif.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}