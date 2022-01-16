// メニューを作成する
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "contextMenu",
    title: "Chronus-input",
    type: "normal",
    contexts: ["page"],
  });
});
