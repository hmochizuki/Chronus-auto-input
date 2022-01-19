import { writeAttendanceToChronus } from "./writeAttendanceToChronus";
import chronusWorkDivisionOptions from "./options/chronusWorkDivisionOptions.json";

// メニューを作成する
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "contextMenu",
    title: "Chronus-input",
    type: "normal",
    contexts: ["page"],
  });
});

// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ['content-script.js']
//   });
// });