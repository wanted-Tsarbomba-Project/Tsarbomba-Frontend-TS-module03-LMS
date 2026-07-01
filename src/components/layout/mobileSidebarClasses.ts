export const mobileSidebarClasses = {
  toggleButton:
    "fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 z-[1100] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-[#1a237e] bg-bg-box p-0 shadow-[0_8px_24px_rgba(15,23,42,0.22)] min-[1024px]:hidden",
  toggleIcon: "h-14 w-14",
  overlayAsideOpen:
    "max-[1023px]:fixed max-[1023px]:left-1/2 max-[1023px]:top-1/2 max-[1023px]:z-[1000] max-[1023px]:block max-[1023px]:max-h-[min(76dvh,560px)] max-[1023px]:w-[min(340px,calc(100dvw-32px))] max-[1023px]:-translate-x-1/2 max-[1023px]:-translate-y-1/2 max-[1023px]:overflow-y-auto max-[1023px]:shadow-[0_20px_50px_rgba(15,23,42,0.24)]",
  overlayAsideClosed: "max-[1023px]:hidden",
  backdrop:
    "fixed inset-0 z-[900] cursor-default bg-[#000000]/40 min-[1024px]:hidden",
} as const;
