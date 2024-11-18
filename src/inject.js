window.addEventListener('message', async (event) => {
    if (event.data.type === 'TRIGGER_ARCONNECT') {
        try {
            if (typeof window.arweaveWallet === 'undefined') {
                alert('ArConnect not found. Please install ArConnect first.');
                return;
            }

            await window.arweaveWallet.connect([
                'ACCESS_ADDRESS',
                'ACCESS_PUBLIC_KEY',
                'SIGN_TRANSACTION',
                'SIGNATURE'
            ]);

            const address = await window.arweaveWallet.getActiveAddress();
            document.dispatchEvent(new CustomEvent('ARCONNECT_SUCCESS', { 
                detail: { address } 
            }));
        } catch (error) {
            document.dispatchEvent(new CustomEvent('ARCONNECT_ERROR', { 
                detail: { error: error.message } 
            }));
        }
    } else if (event.data.type === 'SIGN_TEXT') {
        try {
            const PROCESS = "0uWvAQMhze2NT94rr46cbmKc5hpzuByQo0E9PNkVgOI"
            const {createDataItemSigner} = require("@permaweb/aoconnect")
            const signer = createDataItemSigner(window.arweaveWallet)
            const tags = [
                { name: 'Action', value: "CreateComment" },
                { name: 'TwitterId', value: event.data.tweetId },
                { name: 'Message', value: event.data.text },
                { name: 'Variant', value: 'ao.TN.1' },
                { name: 'Type', value: 'Message' },
                { name: 'Data-Protocol', value: 'ao' },
                { name: 'Parent', value: event.data.parent }
            ]
            const signedDataItem = await signer({ data: "", tags, target: PROCESS, anchor: "" })
            document.dispatchEvent(new CustomEvent('GET_SIGNER', {
                detail: {
                    signedData: Uint8ArrayToString(signedDataItem.raw),
                    tweetId: event.data.tweetId
                }
            }));

          } catch (error) {
            console.log("messageToAO -> error:", error)
            return '';
        }
    } else if (event.data.type === 'CHECK_WALLET_CONNECTION') {
        checkWalletConnection();
    }
}); 

function Uint8ArrayToString(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i]);
    }
    return dataString
}

// 添加钱包状态检查函数
async function checkWalletConnection() {
    try {
        // 检查 arweaveWallet 是否存在
        if (window.arweaveWallet) {
            try {
                // 获取当前连接的钱包地址
                const address = await window.arweaveWallet.getActiveAddress();
                if (address) {
                    // 发送钱包已连接的消息
                    document.dispatchEvent(new CustomEvent('WALLET_STATUS', {
                        detail: {
                            isConnected: true,
                            address: address
                        }
                    }));
                    return;
                }
            } catch (error) {
                console.log('Wallet not connected:', error);
            }
        }
        
        // 如果没有连接，发送未连接状态
        document.dispatchEvent(new CustomEvent('WALLET_STATUS', {
            detail: {
                isConnected: false,
                address: null
            }
        }));
    } catch (error) {
        console.error('Error checking wallet connection:', error);
        // 发送错误状态
        document.dispatchEvent(new CustomEvent('WALLET_STATUS', {
            detail: {
                isConnected: false,
                address: null,
                error: error.message
            }
        }));
    }
}