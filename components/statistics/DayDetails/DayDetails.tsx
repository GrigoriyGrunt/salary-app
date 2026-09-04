"use client";

type DayDetailsProps = {
  date: Date;
};

export default function DayDetails({
  date,
}: DayDetailsProps) {
  return (
    <div>
      <h1>Детали дня</h1>

      <p>{date.toLocaleDateString("ru-RU")}</p>
    </div>
  );
}