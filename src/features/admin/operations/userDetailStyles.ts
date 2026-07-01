export const userDetailClasses = {
  container: "box-border min-h-screen p-6 text-text-primary",
  pageHeader:
    "mb-7 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch",
  pageTitle: "m-0 text-[30px] font-bold",
  headerButtonGroup: "flex gap-2.5 max-md:flex-wrap",
  grayButton:
    "cursor-pointer rounded-[10px] border-0 bg-[#e5e5e5] px-[18px] py-3 text-[15px] font-semibold transition duration-200 hover:not-disabled:bg-[#d9d9d9] disabled:cursor-not-allowed disabled:opacity-60",
  infoSection: "mb-10",
  row: "flex gap-5 max-md:flex-col max-md:items-stretch",
  inputGroup:
    "mb-6 flex flex-1 flex-col [&>label]:mb-2.5 [&>label]:text-[15px] [&>label]:font-semibold [&>label]:text-[#666666]",
  readonlyBox:
    "flex min-h-[52px] items-center rounded-[10px] border border-[#dedede] bg-bg-box px-4 text-[15px]",
  tabGroup: "mt-5 mb-2.5 flex gap-2.5",
  tabButton:
    "h-9 w-[100px] cursor-pointer rounded-base border border-button-blue-bg bg-bg-box text-body font-medium text-text-primary",
  active: "border-0 bg-button-blue-bg text-text-white",
  listSection: "overflow-hidden rounded-xl border border-[#e5e5e5] bg-bg-box",
} as const;
