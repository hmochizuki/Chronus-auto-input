import chronusWorkDivisionOptions from "./options/chronusWorkDivisionOptions.json"

type WorkDivisionOption = {
  label: string;
  value: string;
  start?: string;
  end?: string;
};

export function writeAttendanceToChronus(
  chronusWorkDivisionOptions: WorkDivisionOption[]
) {
  function parseUnixFromTime(time: string) {
    return new Date(
      `2021-01-01 ${time.substring(0, 2)}:${parseInt(time.substring(2, 4))}`
    ).getTime();
  }

  function parseTimeStringFromUnix(unix: number) {
    const d = new Date(unix);
    return (
      String(d.getHours()).padStart(2, "0") +
      String(d.getMinutes()).padStart(2, "0")
    );
  }

  /**
   * 時間を2つ受け取り 差分の unixtime を返却する関数
   * @param source 時間(HH:mm)
   * @param target 時間(HH:mm)
   * @returns target - source の unixtime(ms)
   */
  function calcUnixTimeDiff(source: string, target: string) {
    return parseUnixFromTime(target) - parseUnixFromTime(source);
  }

  const doc = document;
  const pageTitle = doc.getElementsByClassName("kinoutitle")?.[0]?.textContent;
  const displayedYmd = (
    doc.getElementsByName("DateToday")?.[0] as HTMLInputElement
  )?.value;

  if (pageTitle !== "勤休内容登録" || !displayedYmd) return

  const [_displayedYear, displayedMonth, displayedDate] =
    displayedYmd.split("/");

  // @ts-expect-error
  chrome.storage.sync.get("data", ({ data }: { data: Data[] }) => {
    if (!data) return window.alert("データが登録されていません。");

    const targetData = data.find(
      ({ month, date }) => month === displayedMonth && date === displayedDate
    );

    if (!targetData)return console.warn("対象日のデータが登録されていません。");

    const workDivisionOption = chronusWorkDivisionOptions.find(
      ({ start, end }) => start && end && start <= targetData.start && end >= targetData.start
    );

    if (!workDivisionOption || !workDivisionOption.end)
      return window.alert("正しいデータが登録されていません。");

    // 基本情報を入力する
    const startTimeValue = workDivisionOption.end;
    const diffFromActual = calcUnixTimeDiff(targetData.start, startTimeValue);
    const endTimeValue = parseTimeStringFromUnix(
      parseUnixFromTime(targetData.end) + diffFromActual
    );

    (doc.getElementsByName("StartTime")[0] as HTMLInputElement).value =
      workDivisionOption.end;
    (doc.getElementsByName("EndTime")[0] as HTMLInputElement).value =
      endTimeValue;
    (doc.getElementsByName("WorkDivision")[0] as HTMLInputElement).value =
      workDivisionOption.value;
    (doc.getElementsByName("AllowanceItem")[0] as HTMLInputElement).value =
      "AllowanceItem_29";
    (doc.getElementsByName("AllowanceItemValue")[0] as HTMLInputElement).value =
      "1";

    // 工数の計算を行い、最初のPJコードに工数を入力する
    const diff = calcUnixTimeDiff(startTimeValue, endTimeValue);
    const diffHour = diff / (60 * 60 * 1000);
    const diffMinute = (diffHour - Math.floor(diffHour)) * 60;
    const costQuantity =
      String(Math.floor(diffHour) - 1).padStart(2, "0") +
      String(Math.floor(diffMinute)).padStart(2, "0");

    (doc.getElementsByName("CostQuantity")[0] as HTMLInputElement).value =
      costQuantity;
    (doc.getElementsByName("TotalQuantity")[0] as HTMLInputElement).value =
      costQuantity;

    // 打刻時間がずれている場合、備考を入力する
    const startTimeStamp = (
      doc.getElementsByName("StartTimeStamp")[0] as HTMLInputElement
    ).value;
    const endTimeStamp = (
      doc.getElementsByName("EndTimeStamp")[0] as HTMLInputElement
    ).value;

    if (startTimeStamp && endTimeStamp) {
      const startDiffMinute =
        Math.abs(calcUnixTimeDiff(startTimeStamp, startTimeValue)) /
        (60 * 1000);
      const endDiffMinute =
        Math.abs(calcUnixTimeDiff(endTimeStamp, endTimeValue)) / (60 * 1000);
      if (startDiffMinute > 30 || endDiffMinute > 30) {
        (doc.getElementsByName("Comment")[0] as HTMLInputElement).value =
          "時差: リモートアクセスのため";
      }
    }

    return window.confirm("OK");
  });
}

writeAttendanceToChronus(chronusWorkDivisionOptions);
