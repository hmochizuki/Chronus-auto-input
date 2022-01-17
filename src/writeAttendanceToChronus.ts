type WorkDivisionOption = {
  label: string;
  value: string;
  start: string;
  end: string;
};

type Data = { month: string; date: string; start: string; end: string };


export function writeAttendanceToChronus(
  chronusWorkDivisionOptions: WorkDivisionOption[]
) {
  console.log("write!");
  const iframe = document.getElementsByName("OPERATION")[0];
  if (!iframe) return window.alert("クロノスで実行してください。");

  // @ts-expect-error
  const doc = iframe.contentDocument as Document;
  const pageTitle = doc.getElementsByClassName("kinoutitle")[0].textContent;
  const displayedYmd = (
    doc.getElementsByName("DateToday")[0] as HTMLInputElement
  ).value;

  console.log(pageTitle, displayedYmd);

  if (pageTitle !== "勤休内容登録" || !displayedYmd) {
    return window.alert("クロノスの勤休内容登録画面で実行してください。");
  }

  const [displayedYear, displayedMonth, displayedDate] =
    displayedYmd.split("/");
  console.table([displayedYear, displayedMonth, displayedDate]);

  // @ts-expect-error
  chrome.storage.sync.get("data", ({ data }: { data: Data[] }) => {
    console.log({ data });
    if (!data) return window.alert("データが登録されていません。");

    const targetData = data.find(
      ({ month, date }) => month === displayedMonth && date === displayedDate
    );
    if (!targetData)
      return window.alert("対象日のデータが登録されていません。");

    console.log({ targetData });

    const workDivisionOption = chronusWorkDivisionOptions.find(
      ({ start, end }) => start <= targetData.start && end >= targetData.start
    );

    if (!workDivisionOption)
      return window.alert("正しいデータが登録されていません。");

    console.log({ workDivisionOption });

    const startTimeValue = workDivisionOption.end;
    const endTimeValue = targetData.end;

    (doc.getElementsByName("StartTime")[0] as HTMLInputElement).value =
      startTimeValue;
    (doc.getElementsByName("EndTime")[0] as HTMLInputElement).value =
      endTimeValue;
    (doc.getElementsByName("WorkDivision")[0] as HTMLInputElement).value =
      workDivisionOption.value;
    (doc.getElementsByName("AllowanceItem")[0] as HTMLInputElement).value =
      "AllowanceItem_29";
    (doc.getElementsByName("AllowanceItemValue")[0] as HTMLInputElement).value =
      "1";

    let costQuantityHour;
    let costQuantityMinute;

    costQuantityHour =
      parseInt(endTimeValue.substr(0, 2)) -
      parseInt(startTimeValue.substr(0, 2)) -
      1;
    if (endTimeValue.substr(2, 2) >= startTimeValue.substr(2, 2)) {
      costQuantityMinute =
        parseInt(endTimeValue.substr(2, 2)) -
        parseInt(startTimeValue.substr(2, 2));
    } else {
      costQuantityHour = costQuantityHour - 1;
      costQuantityMinute =
        parseInt(endTimeValue.substr(2, 2)) +
        parseInt(startTimeValue.substr(2, 2));
    }
    if (costQuantityHour && costQuantityMinute) {
      const costQuantity =
        String(costQuantityHour).padStart(2, "0") +
        String(costQuantityMinute).padStart(2, "0");
      (doc.getElementsByName("CostQuantity")[0] as HTMLInputElement).value =
        costQuantity;
      (doc.getElementsByName("TotalQuantity")[0] as HTMLInputElement).value =
        costQuantity;
    }

    /**
     * TODO: 打刻時間がずれている場合、備考を入力する
     */

    return window.confirm("OK");
  });
}
