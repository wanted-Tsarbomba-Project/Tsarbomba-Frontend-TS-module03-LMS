"use client";

import Image from "next/image";

import styles from "./Modal.module.css";

interface OneButtonModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalTitle: string;
  modalContent?: string;
}

export default function OneButtonModal({
  isOpen,
  onClose,
  modalTitle,
  modalContent,
}: OneButtonModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(event) => event.stopPropagation()}>
        <div className={styles.iconWrap}>
          <Image
            alt="check icon"
            className={styles.icon}
            height={64}
            src="/assets/img/modalCheckIcon.svg"
            width={64}
          />
        </div>

        <div className={styles.textWrap}>
          <h2 className={styles.title}>{modalTitle}</h2>
          {modalContent && <p className={styles.content}>{modalContent}</p>}
        </div>

        <div className={styles.buttonWrap}>
          <button
            className={`${styles.button} ${styles.oneButton}`}
            onClick={onClose}
            type="button"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
