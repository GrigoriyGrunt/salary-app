"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet/BottomSheet";
import styles from "./MotivationSheet.module.css";
import { useUsersStore } from "@/store/usersStore";
import { getWarehouseConfig } from "@/lib/warehouses/config";

type Props = {
  open: boolean;
  goal: number;
  isGuide?: boolean;
  onClose: () => void;
  onGoalChange: (value: number) => void;
  onSave: () => void;
};

export default function MotivationSheet({
  open,
  goal,
  isGuide = false,
  onClose,
  onGoalChange,
  onSave,
}: Props) {
  const [value, setValue] =
  useState(
    isGuide ? "" : goal.toString()
  );
const numberValue = Number(value);
const currentUser = useUsersStore(
  (state) => state.currentUser
);
const warehouseConfig = getWarehouseConfig(
  currentUser?.warehouse
);
const tariffs = warehouseConfig?.tariffs;

const isTobaccoPicker =
  currentUser?.position === "Комплектовщик табака";

const isStacker =
  currentUser?.position === "Штабелер (водитель погрузчика)";

const isStorekeeper =
  currentUser?.position === "Кладовщик";
  const isWatchMotivation =
  currentUser?.position === "Комплектовщик основы" &&
  currentUser?.schedule === "15/15 вахта";

const isValid =
  Number.isInteger(numberValue) &&
  numberValue >= 100;
  return (
    <BottomSheet
      isOpen={open}
      onClose={onClose}
    >
      <div className={styles.container}>
        <h2 className={styles.title}>
          Мотивация
        </h2>

        <div className={styles.section}>
<div className={styles.label}>
  {isWatchMotivation
    ? "Цель на вахту"
    : isStorekeeper
      ? "Цель заработка в месяц"
      : "Цель на месяц"}
</div>

          <div className={styles.goalRow}>
            <input
              type="number"
              className={styles.input}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
            />

            <button
  type="button"
  className={styles.save}
  disabled={!isValid}
  onClick={() => {
    if (!isValid) {
      return;
    }

    onGoalChange(numberValue);
    onSave();
  }}
>
  Сохранить
</button>
          </div>

<div className={styles.caption}>
  {isStorekeeper
    ? "₽ в месяц"
    : isStacker
      ? "паллетов за смену"
      : isTobaccoPicker
        ? "блоков за смену"
        : "коробок за смену"}
</div>
        </div>

{!isTobaccoPicker && !isStacker && !isStorekeeper && (
  <div className={styles.section}>
    <div className={styles.label}>
      Основа
    </div>

    <div className={styles.row}>
      <span>до 1200</span>
      <span>{(tariffs?.boxes[0]?.rate ?? 2.7).toFixed(2).replace(".", ",")} ₽/кор</span>
    </div>

    <div className={styles.row}>
      <span>1200–1799</span>
      <span>{(tariffs?.boxes[1]?.rate ?? 3.6).toFixed(2).replace(".", ",")} ₽/кор</span>
    </div>

    <div className={styles.row}>
      <span>1800+</span>
      <span>{(tariffs?.boxes[2]?.rate ?? 4).toFixed(2).replace(".", ",")} ₽/кор</span>
    </div>
  </div>
)}
{!isStacker && !isStorekeeper && (
  <div className={styles.section}>
    <div className={styles.label}>
      Табак
          </div>

          <div className={styles.row}>
            <span>до 2200</span>
            <span>{(tariffs?.blocks[0]?.rate ?? 0.6).toFixed(2).replace(".", ",")} ₽/блок</span>
          </div>

          <div className={styles.row}>
            <span>2200–3199</span>
            <span>{(tariffs?.blocks[1]?.rate ?? 0.7).toFixed(2).replace(".", ",")} ₽/блок</span>
          </div>

          <div className={styles.row}>
            <span>3200–3999</span>
            <span>{(tariffs?.blocks[2]?.rate ?? 0.8).toFixed(2).replace(".", ",")} ₽/блок</span>
          </div>

          <div className={styles.row}>
            <span>4000+</span>
            <span>{(tariffs?.blocks[3]?.rate ?? 1).toFixed(2).replace(".", ",")} ₽/блок</span>
          </div>
        </div>
        )}
{isStorekeeper && (
  <div className={styles.section}>
    <div className={styles.label}>
      Кладовщик
    </div>

    <div className={styles.row}>
      <span>Приёмка и отгрузка</span>
      <span>{(tariffs?.storekeeper.palletRate ?? 15).toFixed(2).replace(".", ",")} ₽/паллет</span>
    </div>

    <div className={styles.row}>
      <span>Покоробочная приёмка</span>
      <span>{(tariffs?.storekeeper.boxRate ?? 3).toFixed(2).replace(".", ",")} ₽/короб</span>
    </div>
  </div>
)}        
{isStacker && (
  <div className={styles.section}>
    <div className={styles.label}>
      Штабелер
    </div>

    <div className={styles.row}>
      <span>до 249</span>
      <span>{(tariffs?.pallets[0]?.rate ?? 12).toFixed(2).replace(".", ",")} ₽/паллет</span>
    </div>

    <div className={styles.row}>
      <span>250–299</span>
      <span>{(tariffs?.pallets[1]?.rate ?? 14).toFixed(2).replace(".", ",")} ₽/паллет</span>
    </div>

    <div className={styles.row}>
      <span>300+</span>
      <span>{(tariffs?.pallets[2]?.rate ?? 17).toFixed(2).replace(".", ",")} ₽/паллет</span>
    </div>
  </div>
)}        
      </div>
    </BottomSheet>
  );
}