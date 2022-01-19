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
  /**
   * 時間を2つ受け取り 差分の unixtime を返却する関数
   * @param source 時間(HH:mm)
   * @param target 時間(HH:mm)
   * @returns target - source の unixtime(ms)
   */
  function calcTimeDiffFromHour(source: string, target: string) {
    const d1 = new Date(
      `2021-01-01 ${source.substring(0, 2)}:${parseInt(source.substring(2, 4))}`
    );
    const d2 = new Date(
      `2021-01-01 ${target.substring(0, 2)}:${parseInt(target.substring(2, 4))}`
    );
    return d2.getTime() - d1.getTime();
  }

  const iframe = document.getElementsByName("OPERATION")[0];
  if (!iframe) return window.alert("クロノスで実行してください。");

  // @ts-expect-error
  const doc = iframe.contentDocument as Document;
  const pageTitle = doc.getElementsByClassName("kinoutitle")[0].textContent;
  const displayedYmd = (
    doc.getElementsByName("DateToday")[0] as HTMLInputElement
  ).value;

  if (pageTitle !== "勤休内容登録" || !displayedYmd) {
    return window.alert("クロノスの勤休内容登録画面で実行してください。");
  }

  const [_displayedYear, displayedMonth, displayedDate] =
    displayedYmd.split("/");

  // @ts-expect-error
  chrome.storage.sync.get("data", ({ data }: { data: Data[] }) => {
    if (!data) return window.alert("データが登録されていません。");

    const targetData = data.find(
      ({ month, date }) => month === displayedMonth && date === displayedDate
    );
    if (!targetData)
      return window.alert("対象日のデータが登録されていません。");

    const workDivisionOption = chronusWorkDivisionOptions.find(
      ({ start, end }) => start <= targetData.start && end >= targetData.start
    );

    if (!workDivisionOption)
      return window.alert("正しいデータが登録されていません。");

    const startTimeValue = workDivisionOption.end;
    const endTimeValue = targetData.end;

    // 基本情報を入力する
    // TODO: 実際の勤務開始データと始業開始時間の差分を終業時間に追加する
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

    // 工数の計算を行い、最初のPJコードに工数を入力する
    const diff = calcTimeDiffFromHour(startTimeValue, endTimeValue);
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
        Math.abs(calcTimeDiffFromHour(startTimeStamp, startTimeValue)) /
        (60 * 1000);
      const endDiffMinute =
        Math.abs(calcTimeDiffFromHour(endTimeStamp, endTimeValue)) /
        (60 * 1000);
      if (startDiffMinute > 30 || endDiffMinute > 30) {
        (doc.getElementsByName("Comment")[0] as HTMLInputElement).value =
          "時差: リモートアクセスのため";
      }
    }

    return window.confirm("OK");
  });
}
