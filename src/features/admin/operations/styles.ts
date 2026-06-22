export const adminUserListClasses = {
  container: "box-border p-6 text-text-primary",
  title: "mt-0 mb-5 text-2xl font-bold",
} as const;

export const adminAlramListClasses = {
  container: "box-border p-6 text-text-primary",
  header:
    "mb-5 flex items-center justify-between gap-4 [&_h1]:m-0 [&_h1]:text-2xl [&_h1]:font-bold",
  statusSelect:
    "h-9 w-[120px] rounded-base border border-button-blue-bg bg-bg-box px-2.5 text-description text-text-primary",
  typeButtonGroup: "mb-5 flex gap-2.5",
  typeButton:
    "h-9 w-[88px] cursor-pointer rounded-base border border-button-blue-bg bg-bg-box text-center text-body font-medium leading-6 text-text-primary",
  active: "border-0 bg-button-blue-bg text-text-white",
} as const;

export const adminRuleClasses = {
  container: "box-border flex w-[min(100%,1463px)] flex-col gap-4 p-6",
  ruleBlock: "flex w-full flex-col gap-2",
  ruleHeader: "flex w-[min(100%,960px)] items-center justify-between",
  ruleLabel: "m-0 text-body font-medium leading-6 text-text-primary",
  ruleInputBox:
    "box-border flex min-h-[100px] w-[min(100%,960px)] flex-wrap items-center gap-5 rounded border border-black/10 bg-bg-box px-4 py-2",
  ruleItem: "flex flex-wrap items-center gap-2.5",
  ruleText: "text-body font-medium leading-6 text-black",
  ruleInput:
    "box-border h-11 w-[162px] rounded-[10px] border border-[#d9d9d9] px-2.5 text-description outline-none focus:border-[#4f46e5]",
  toggleButton:
    "h-10 min-w-[90px] cursor-pointer rounded-[10px] border-0 text-description font-semibold transition duration-200 ease-in-out",
  enabled: "bg-button-blue-bg text-text-white hover:opacity-90",
  disabled: "bg-[#e5e7eb] text-[#374151] hover:bg-[#d1d5db]",
  submitWrapper: "mt-3 mb-10 flex w-[min(100%,960px)] justify-center",
  submitButton:
    "h-[50px] w-[180px] cursor-pointer rounded-[10px] border-0 bg-button-blue-bg text-body font-semibold text-text-white transition duration-200 ease-in-out hover:not-disabled:bg-button-blue-hover-bg disabled:cursor-not-allowed disabled:opacity-60",
} as const;
