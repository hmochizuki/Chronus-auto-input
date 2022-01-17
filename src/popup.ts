import { getMessageTimeFromSlack } from "./getMessageTimeFromSlack";
import { writeAttendanceToChronus } from "./writeAttendanceToChronus";
import chronusWorkDivisionOptions from "./options/chronusWorkDivisionOptions.json"

const slackButton = document.getElementById("button__slack");

slackButton?.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    // @ts-expect-error
    function: getMessageTimeFromSlack,
  });
});

let chronusButton = document.getElementById("button__chronus");

chronusButton?.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    // @ts-expect-error
    function: writeAttendanceToChronus,
    args: [chronusWorkDivisionOptions],
  });
});
