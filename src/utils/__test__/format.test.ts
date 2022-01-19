import { parse } from "date-fns";
import { createAttendanceDataFromSlack } from "../../format";

const year = new Date().getFullYear();

function getDate(date: string, time?: string) {
  if (time) return parse(`${date}${time}`, "yyyyMMddHH:mm", new Date());
  return parse(`${date}`, "yyyyMMdd", new Date());
}

describe("createAttendanceDataFromSlack", () => {
  describe("単一日のデータのみ存在する場合", () => {
    const ymd = `${year}0101`;

    it("データが1つの場合", () => {
      const slackData = [{ date: "1月1日", time: "00:00" }];

      const expected = [{ ymd, start: getDate(ymd), end: getDate(ymd) }];
      expect(createAttendanceDataFromSlack(slackData)).toStrictEqual(expected);
    });

    it("同一日にデータが複数存在するの場合", () => {
      const slackData = [
        { date: "1月1日", time: "00:00" },
        { date: "1月1日", time: "23:59" },
        { date: "1月1日", time: "23:58" },
      ];
      const expected = [
        { ymd, start: getDate(ymd), end: getDate(ymd, "23:59") },
      ];
      expect(createAttendanceDataFromSlack(slackData)).toStrictEqual(expected);
    });
  });
  describe("複数日のデータが存在する場合", () => {
    const ymd1 = `${year}0101`;
    const ymd2 = `${year}0102`;
    const ymd3 = `${year}1231`;

    it("同一日にデータが1つの場合", () => {
      const slackData = [
        { date: "1月1日", time: "23:59" },
        { date: "1月2日", time: "00:00" },
        { date: "12月31日", time: "23:59" },
      ];

      const expected = [
        { ymd: ymd1, start: getDate(ymd1, "23:59"), end: getDate(ymd1, "23:59") },
        { ymd: ymd2, start: getDate(ymd2, "00:00"), end: getDate(ymd2, "00:00") },
        { ymd: ymd3, start: getDate(ymd3, "23:59"), end: getDate(ymd3, "23:59") },
      ];
      expect(createAttendanceDataFromSlack(slackData)).toStrictEqual(expected);
    });

    it("同一日にデータが複数存在するの場合", () => {
      const slackData = [
        { date: "1月1日", time: "00:00" },
        { date: "1月1日", time: "23:59" },
        { date: "1月1日", time: "23:58" },
        { date: "1月2日", time: "00:00" },
        { date: "1月2日", time: "23:59" },
        { date: "1月2日", time: "23:58" },
        { date: "12月31日", time: "00:00" },
        { date: "12月31日", time: "23:59" },
        { date: "12月31日", time: "23:58" },
      ];
      const expected = [
        { ymd: ymd1, start: getDate(ymd1), end: getDate(ymd1, "23:59") },
        { ymd: ymd2, start: getDate(ymd2), end: getDate(ymd2, "23:59") },
        { ymd: ymd3, start: getDate(ymd3), end: getDate(ymd3, "23:59") },
      ];
      expect(createAttendanceDataFromSlack(slackData)).toStrictEqual(expected);
    });
  });
});
