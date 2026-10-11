"use client";

import { useEffect, useState } from "react";
import { useUsersStore } from "@/store/usersStore";

export default function InstructionInvitation() {
  const currentUser = useUsersStore(
    (state) => state.currentUser
  );

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;

    const userId = currentUser.id;
    const handledKey = `instruction-invitation-handled-${userId}`;
    const motivationKey = `show-motivation-guide-${userId}`;

    const checkInvitation = () => {
      if (
        localStorage.getItem(handledKey) === "true"
      ) {
        setIsOpen(false);
        return;
      }

      if (
        localStorage.getItem(motivationKey) === "true"
      ) {
        setIsOpen(false);
        return;
      }

      setIsOpen(true);
    };

    checkInvitation();

    window.addEventListener(
      "motivation-guide-completed",
      checkInvitation
    );

    return () => {
      window.removeEventListener(
        "motivation-guide-completed",
        checkInvitation
      );
    };
  }, [currentUser?.id]);

  if (!isOpen || !currentUser?.id) return null;

  const handleChoice = (startGuide: boolean) => {
    localStorage.setItem(
      `instruction-invitation-handled-${currentUser.id}`,
      "true"
    );

    setIsOpen(false);

    if (startGuide) {
      window.dispatchEvent(
        new Event("open-instruction-guide")
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 24,
          borderRadius: 20,
          background: "#ffffff",
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        <p
          style={{
            margin: "0 0 24px",
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.45,
            color: "#222222",
          }}
        >
          Хотите посмотреть инструкцию как пользоваться
          приложением КалькуляторЗП?
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => handleChoice(true)}
            style={{
              flex: 1,
              padding: "12px 8px",
              border: 0,
              borderRadius: 12,
              background: "#b5121b",
color: "#ffffff",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Да
          </button>

          <button
            onClick={() => handleChoice(false)}
            style={{
              flex: 1,
              padding: "12px 8px",
              border: "1px solid #d1d5db",
              borderRadius: 12,
              background: "#ffffff",
              color: "#222222",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Нет, не хочу
          </button>
        </div>
      </div>
    </div>
  );
}