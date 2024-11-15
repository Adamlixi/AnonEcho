// 监听扩展安装
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// 处理消息
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'HELLO') {
//     console.log('Hello from background script');
//   }
//   return true;
// });

// // 使用 declarativeNetRequest 替代 webRequest
// chrome.webRequest.onBeforeRequest.addListener(
//   function(details) {
//     if (details.method === "POST") {
//       console.log("Request intercepted:", {
//         url: details.url,
//         type: details.type,
//         method: details.method
//       });
//       console.log("111111111");
//       console.log(details);
//     }
//   },
//   { urls: ["http://127.0.0.1:9001/*"] }
// );