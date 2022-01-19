// import { parse, format } from "date-fns";

/**
 * Slack から取得した日付と時間をDate型に変換する関数
 * @param date 日付(M月D日)
 * @param time 時間(hh:mm)
 */
function formatDateFromSlack(date: string, time: string) {
  const parse = require("date-fns")
  console.log("formatDateFromSlack", date, time);
  return parse(`${date}${time}`, "M月d日HH:mm", new Date());
}

function formatStringFromDate(date: Date) {
  const format = require("date-fns")
  return format(date, "yyyyMMdd");
}

/**
 * Slack から取得した日付と時間から、ストレージに保存する形式に変換する関数
 */

export function createAttendanceDataFromSlack(
  slackData: { date: string; time: string }[]
) {
  console.log({ slackData });
  const dates = slackData.map(({ date, time }) =>
    formatDateFromSlack(date, time)
  );
  console.log(dates);

  return dates.reduce<{ ymd: string; start: Date; end: Date }[]>((acc, cur) => {
    const ymd = formatStringFromDate(cur);
    const targetIndex = acc.findIndex((e) => e.ymd === ymd);
    if (targetIndex < 0) {
      return [...acc, { ymd, start: cur, end: cur }];
    }
    if (acc[targetIndex].start > cur) acc[targetIndex].start = cur;
    if (cur > acc[targetIndex].end) acc[targetIndex].end = cur;
    return acc;
  }, []);
}
