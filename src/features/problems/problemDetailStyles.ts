export const problemDetailClasses = {
  container: "min-h-[80vh] w-full bg-bg-main",
  mainArea:
    "relative flex min-h-[calc(80vh-80px)] gap-4 overflow-hidden py-3.5 max-lg:flex-col",
  contentArea:
    "flex min-w-0 flex-1 items-stretch gap-3 max-[1180px]:flex-col",
  contentAreaStacked: "flex-col",
  resizeHandle:
    "w-2 shrink-0 cursor-col-resize rounded-base bg-border-light transition hover:bg-button-blue-bg focus:outline-none focus:ring-2 focus:ring-button-blue-bg max-[1180px]:hidden",
  problemResizablePane:
    "flex-[0_0_var(--problem-panel-percent)] max-w-[var(--problem-panel-percent)] min-w-[260px] max-[1180px]:w-full max-[1180px]:max-w-full max-[1180px]:min-w-0 max-[1180px]:flex-auto",
  problemStackedPane: "w-full min-w-0 max-w-full flex-auto",
  solveResizablePane: "flex-1 min-w-[400px] max-[1180px]:min-w-0",
  solveStackedPane: "min-w-0 flex-auto",
  problemBox:
    "min-w-0 rounded-base border border-border-light bg-bg-box p-4 [&_h2]:m-0 [&_h2]:text-title-lg [&_h2]:font-bold [&_h2]:text-text-primary",
  problemHeader: "mb-2.5 flex items-center justify-between gap-3",
  datasetDownloadButton:
    "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-base border border-border-light bg-bg-box transition hover:bg-bg-hover-gray disabled:cursor-not-allowed disabled:opacity-50",
  solveBox:
    "min-w-0 rounded-base border border-border-light bg-bg-box p-4 [&_h2]:mt-0 [&_h2]:mb-2.5 [&_h2]:text-title-lg [&_h2]:font-bold [&_h2]:text-text-primary",
  problemContent:
    "whitespace-pre-wrap break-words text-body leading-normal text-text-primary",
  editorSection: "relative",
  codeEditor:
    "min-h-[220px] w-full resize-y rounded-base border border-border-light p-3 font-mono text-body text-text-primary",
  hintToast:
    "absolute left-1/2 top-[42px] z-10 -translate-x-1/2 whitespace-nowrap rounded-base bg-button-blue-bg px-[18px] py-3 text-body font-semibold text-text-white",
  tabs: "mt-3 mb-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&_button]:min-w-24 [&_button]:shrink-0 [&_button]:cursor-pointer [&_button]:rounded-base [&_button]:border [&_button]:border-border-light [&_button]:bg-bg-box [&_button]:px-3.5 [&_button]:py-[9px] [&_button]:text-[15px] [&_button]:text-text-primary [&_button:disabled]:cursor-not-allowed [&_button:disabled]:bg-bg-navbar [&_button:disabled]:text-[#9ca3af]",
  activeTab: "bg-bg-navbar! text-text-blue!",
  bottomPanel:
    "h-[180px] w-full max-w-full overflow-y-auto rounded-base border border-border-light p-3 text-body text-text-primary",
  executionOutput: "m-0 whitespace-pre-wrap break-words font-mono",
  executionError: "m-0 whitespace-pre-wrap break-words font-mono text-text-red",
  submitWrap: "mt-3 flex min-w-0 justify-end overflow-visible",
  submitButton:
    "h-11 min-w-[120px] shrink-0 cursor-pointer rounded-base border border-button-blue-bg bg-button-blue-bg px-4 text-body font-semibold text-text-white hover:not-disabled:bg-button-blue-hover-bg disabled:cursor-not-allowed disabled:opacity-60",
  chatPanel:
    "pointer-events-none absolute right-0 top-3.5 z-20 flex h-[calc(100%-28px)] min-h-[560px] w-[min(420px,calc(100%-32px))] translate-x-6 flex-col rounded-base border border-border-light bg-bg-box opacity-0 shadow-[0_12px_32px_rgba(15,23,42,0.16)] transition-[opacity,transform] duration-200 ease-in-out max-md:fixed max-md:inset-x-3 max-md:bottom-3 max-md:top-[74px] max-md:h-auto max-md:min-h-0 max-md:w-auto",
  open: "pointer-events-auto translate-x-0 opacity-100",
  chatHeader:
    "flex min-h-[58px] items-center justify-between border-b border-border-light px-5 text-title-md font-bold text-text-primary [&_button]:inline-flex [&_button]:h-[34px] [&_button]:w-[34px] [&_button]:cursor-pointer [&_button]:items-center [&_button]:justify-center [&_button]:rounded-base [&_button]:border [&_button]:border-text-primary [&_button]:bg-bg-box [&_button]:p-0 [&_button]:text-2xl [&_button]:leading-none [&_button]:text-text-primary",
  chatMessages: "flex-1 overflow-y-auto p-[18px]",
  chatMessageWrap: "mb-2.5 flex justify-start",
  userMessageWrap: "justify-end",
  chatMessage:
    "max-w-[86%] whitespace-pre-wrap break-words rounded-base px-3 py-2.5 leading-[1.6] text-text-primary",
  assistantMessage: "bg-[#bfd3ef]",
  userMessage: "border border-border-light bg-bg-box",
  errorMessage: "text-text-red",
  chatInputWrap:
    "flex items-end gap-2 border-t border-border-light p-3.5 [&_textarea]:box-border [&_textarea]:max-h-36 [&_textarea]:min-h-11 [&_textarea]:flex-1 [&_textarea]:resize-none [&_textarea]:overflow-y-hidden [&_textarea]:rounded-base [&_textarea]:border [&_textarea]:border-border-light [&_textarea]:p-2.5 [&_textarea]:leading-normal [&_textarea]:text-text-primary [&_textarea]:outline-none [&_button]:h-11 [&_button]:min-w-[72px] [&_button]:cursor-pointer [&_button]:rounded-base [&_button]:border [&_button]:border-button-blue-bg [&_button]:bg-button-blue-bg [&_button]:text-text-white [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-60",
} as const;
