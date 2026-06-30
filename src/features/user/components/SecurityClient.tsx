"use client";

import { useEffect, useState } from "react";
import {
  getLoginHistory,
  getTrustedDevices,
  removeTrustedDevice,
} from "../actions";
import type { LoginHistoryItem, TrustedDeviceItem } from "../types";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import OneButtonModal from "@/components/common/OneButtonModal";
import TwoButtonModal from "@/components/common/TwoButtonModal";

// ISO 문자열 → "YYYY-MM-DD HH:mm"
const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// 국가/도시 → "도시, 국가" (둘 중 있는 것만)
const formatLocation = (
  country: string | null,
  city: string | null,
): string => {
  const parts = [city, country].filter((v): v is string => !!v);
  return parts.length > 0 ? parts.join(", ") : "위치 정보 없음";
};

// 화면 높이에 맞춰 카드 높이를 제한(헤더+여백 보정) → 카드는 안 잘리고 목록만 내부 스크롤.
const cardClass =
  "border border-border-light rounded-xl bg-bg-box p-6 flex-1 flex flex-col min-w-0 max-h-[calc(100vh-8rem)]";
const scrollAreaClass = "flex-1 overflow-y-auto -mr-2 pr-2";
const rowClass =
  "flex items-center justify-between gap-3 px-4 py-3 border border-border-light rounded-lg";

export default function SecurityClient() {
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [devices, setDevices] = useState<TrustedDeviceItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [historyFailed, setHistoryFailed] = useState(false);
  const [devicesFailed, setDevicesFailed] = useState(false);

  // 해제 확인/처리
  const [targetDevice, setTargetDevice] = useState<TrustedDeviceItem | null>(
    null,
  );
  const [removing, setRemoving] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const loadHistory = () => {
    setHistoryLoading(true);
    setHistoryFailed(false);
    getLoginHistory()
      .then(setHistory)
      .catch(() => setHistoryFailed(true))
      .finally(() => setHistoryLoading(false));
  };

  const loadDevices = () => {
    setDevicesLoading(true);
    setDevicesFailed(false);
    getTrustedDevices()
      .then(setDevices)
      .catch(() => setDevicesFailed(true))
      .finally(() => setDevicesLoading(false));
  };

  useEffect(() => {
    loadHistory();
    loadDevices();
  }, []);

  const handleRemoveConfirm = async () => {
    if (!targetDevice) return;
    setRemoving(true);
    try {
      await removeTrustedDevice(targetDevice.id);
      setDevices((prev) => prev.filter((d) => d.id !== targetDevice.id));
      setTargetDevice(null);
      setResultMsg("신뢰 기기를 해제했습니다.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "해제에 실패했습니다.";
      setTargetDevice(null);
      setResultMsg(msg);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex gap-5 items-start max-lg:flex-col">
      {/* 로그인 이력 */}
      <section className={cardClass}>
        <h2 className="shrink-0 text-lg font-semibold text-text-primary mb-5">
          로그인 이력
        </h2>

        <div className={scrollAreaClass}>
          {historyLoading ? (
            <LoadingIndicator message="로그인 이력을 불러오는 중입니다." />
          ) : historyFailed ? (
            <p className="text-center text-sm text-text-red py-8">
              로그인 이력을 불러오지 못했어요.
            </p>
          ) : history.length === 0 ? (
            <p className="text-center text-sm text-text-secondary py-8">
              로그인 이력이 없어요.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {history.map((h) => (
                <li key={h.loginHistoryId} className={rowClass}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {formatDateTime(h.createdAt)}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">
                      {formatLocation(h.country, h.city)} · {h.ipAddress}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
                      h.isSuspicious
                        ? "bg-bg-gray-box text-text-red"
                        : "bg-bg-gray-box text-text-blue"
                    }`}
                  >
                    {h.isSuspicious ? "의심" : "정상"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 신뢰 기기 관리 */}
      <section className={cardClass}>
        <h2 className="shrink-0 text-lg font-semibold text-text-primary mb-5">
          신뢰 기기 관리
        </h2>

        <div className={scrollAreaClass}>
          {devicesLoading ? (
            <LoadingIndicator message="신뢰 기기를 불러오는 중입니다." />
          ) : devicesFailed ? (
            <p className="text-center text-sm text-text-red py-8">
              신뢰 기기를 불러오지 못했어요.
            </p>
          ) : devices.length === 0 ? (
            <p className="text-center text-sm text-text-secondary py-8">
              등록된 신뢰 기기가 없어요.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {devices.map((d) => (
                <li key={d.id} className={rowClass}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {d.deviceName}
                      </p>
                      {d.current && (
                        <span className="shrink-0 text-[10px] font-bold text-text-blue border border-text-blue rounded px-1 py-0.5">
                          현재 기기
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">
                      {formatLocation(d.lastCountry, d.lastCity)} ·{" "}
                      {formatDateTime(d.lastUsedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTargetDevice(d)}
                    className="shrink-0 text-xs font-semibold text-text-red border border-text-red rounded-md px-3 py-1.5 hover:bg-text-red hover:text-text-white transition-colors cursor-pointer"
                  >
                    해제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <TwoButtonModal
        isOpen={!!targetDevice}
        onClose={() => setTargetDevice(null)}
        onConfirm={handleRemoveConfirm}
        confirmDisabled={removing}
        modalTitle="해제하시겠습니까?"
        modalContent={
          "신뢰 기기가 해제되면 다음 로그인 시\n추가 인증을 다시 거쳐야 합니다."
        }
      />

      <OneButtonModal
        isOpen={!!resultMsg}
        onClose={() => setResultMsg(null)}
        modalTitle="알림"
        modalContent={resultMsg ?? ""}
      />
    </div>
  );
}
