export function getMessageTimeFromSlack() {
  const messages = Array.from(
    document.getElementsByClassName("c-message_group")
  );

  const messageDateTimes = messages.map((e) => {
    return {
      time: e.getElementsByClassName("c-timestamp__label")[0].textContent,
      date: e.getElementsByClassName("c-message_group__header_date")[0]
        .textContent,
    };
  }) as { date: string; time: string }[];

  const data = messageDateTimes.reduce<{ date: string; times: string[] }[]>(
    (acc, cur) => {
      const t = acc.find((e) => e.date === cur.date);
      if (t) {
        t.times.push(cur.time);
        return acc;
      }
      return [...acc, { date: cur.date, times: [cur.time] }];
    },
    []
  );

  const formatedData = data.map((d) => {
    const [month, date] = d.date
      .slice(0, d.date.length - 1)
      .split("月")
      .map((e) => e.padStart(2, "0"));
    const start = d.times[d.times.length - 1].replace(":", "");
    const end = d.times[0].replace(":", "");
    return { month, date, start, end };
  });

  if (data.length > 0) {
    chrome.storage.sync.set({ data: formatedData });
    window.confirm("保存されました");
    return;
  }

  return window.alert("データの取得に失敗しました");
}
