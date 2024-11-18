// 监听 Service Worker 的安装
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();  // 确保新的 Service Worker 立即激活
});

// 监听 Service Worker 的激活
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(clients.claim());  // 确保新的 Service Worker 立即接管所有客户端
});

// 处理消息
const PROCESS = "0uWvAQMhze2NT94rr46cbmKc5hpzuByQo0E9PNkVgOI"
chrome.runtime.onMessage.addListener((messageData, sender, sendResponse) => {
    console.log("Background received message:", messageData);
    const { connect } = require('@permaweb/aoconnect');

    const {dryrun } = connect(
        {
            MU_URL: "https://mu.ao-testnet.xyz",
            CU_URL: "https://cu.ao-testnet.xyz",
            GATEWAY_URL: "https://arweave.net",
        },
    );
    if (messageData.action === 'GetTwitterComments') {
        dryrun({
            process: PROCESS,
            tags: [
            { name: 'Action', value: "GetComment" },
            { name: 'TwitterId', value: messageData.tweetId }
        ],
        })
        .then(data => {
            sendResponse({ success: true, data: data });
        })
        .catch(error => {
            console.error("Fetch error:", error);
            sendResponse({ success: false, error: error.message });
        });

        return true; // 保持消息通道开放以进行异步响应
    } else if (messageData.action === 'CreateTwitterComments') {
        const MU_URL = "https://mu.ao-testnet.xyz"
        fetch(MU_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Accept': 'application/json'
            },
            redirect: 'follow',
            body: stringToUint8Array(messageData.signedData)
        }).then(response => {
            if (!response.ok) {
                console.error('Error encountered when writing message via MU')
            } else {
                sendResponse({ success: true });
            }
        })
        return true;
    }
});
function stringToUint8Array(str){
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
      arr.push(str.charCodeAt(i));
    }
   
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array
}
// 保持 Service Worker 活跃
setInterval(() => {
    console.log('Service Worker heartbeat');
}, 20000);