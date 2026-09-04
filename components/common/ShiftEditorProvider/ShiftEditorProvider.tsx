"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import ShiftEditorSheet from "@/components/common/ShiftEditorSheet/ShiftEditorSheet";
import ChangeScheduleSheet from "@/components/common/ChangeScheduleSheet/ChangeScheduleSheet";

type ShiftEditorContextType = {
  isOpen: boolean;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;

  openTodayShiftEditor: () => void;
  openShiftEditor: (date: Date) => void;
  closeShiftEditor: () => void;

  isChangeScheduleOpen: boolean;
  openChangeSchedule: () => void;
  closeChangeSchedule: () => void;
};

const ShiftEditorContext =
  createContext<ShiftEditorContextType | null>(null);
  export function ShiftEditorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [
  isChangeScheduleOpen,
  setIsChangeScheduleOpen,
] = useState(false);
  const [selectedDate, setSelectedDate] =
  useState<Date | null>(null);

  const openTodayShiftEditor = () => {
  setSelectedDate(new Date());
  setIsOpen(true);
};

const openShiftEditor = (date: Date) => {
  setSelectedDate(date);
  setIsOpen(true);
};
  const closeShiftEditor = () => setIsOpen(false);
  const openChangeSchedule = () =>
  setIsChangeScheduleOpen(true);

const closeChangeSchedule = () =>
  setIsChangeScheduleOpen(false);

  return (
    <ShiftEditorContext.Provider
      value={{
  isOpen,
  selectedDate,
  setSelectedDate,
  openTodayShiftEditor,
  openShiftEditor,
  closeShiftEditor,

  isChangeScheduleOpen,
  openChangeSchedule,
  closeChangeSchedule,
}}
    >
      {children}
            <ShiftEditorSheet
        isOpen={isOpen}
        onClose={closeShiftEditor}
      />
      <ChangeScheduleSheet
  isOpen={isChangeScheduleOpen}
  onClose={closeChangeSchedule}
/>
    </ShiftEditorContext.Provider>
  );
}
export function useShiftEditor() {
  const context = useContext(ShiftEditorContext);

  if (!context) {
    throw new Error(
      "useShiftEditor must be used inside ShiftEditorProvider"
    );
  }

  return context;
}