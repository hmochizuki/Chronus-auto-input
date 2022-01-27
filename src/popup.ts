import { getMessageTimeFromSlack } from "./getMessageTimeFromSlack";

const slackOpenButton = document.getElementById("button-slack__open");

slackOpenButton?.addEventListener("click", async () => {
  chrome.tabs.create({
    url: 'https://app.slack.com/client/T95RQ76BE/search'
  });
});

const slackButton = document.getElementById("button-slack__read");

slackButton?.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    // @ts-expect-error
    function: getMessageTimeFromSlack,
  });
});
