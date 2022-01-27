import { getMessageTimeFromSlack } from "./getMessageTimeFromSlack";

// メニューを作成する
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "open_slack",
    title: "slack を開く",
    type: "normal",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "read_slack",
    title: "slack から読み込む",
    type: "normal",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "open_chronus",
    title: "Chronus を開く",
    type: "normal",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const { menuItemId } = info;
  if (menuItemId === "open_slack") {
    chrome.tabs.create({
      url: "https://app.slack.com/client/T95RQ76BE/search",
    });
  }

  if (menuItemId === "read_slack") {
    chrome.scripting.executeScript({
      target: { tabId: tab?.id as number },
      // @ts-expect-error
      function: getMessageTimeFromSlack,
    });
  }

  if(menuItemId === "open_chronus") {
    chrome.tabs.create({
      url: "https://chronus-ext.tis.co.jp/Lysithea/JSP_Files/authentication/WC010_1.jsp",
    });
  }
});
