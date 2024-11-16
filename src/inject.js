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
            const PROCESS = "VIy_yhCG3JFu8cHdFuMwo6lxslmaW5gtyZ6IBnksSok"
            const {createDataItemSigner} = require("@permaweb/aoconnect")
            const signer = createDataItemSigner(window.arweaveWallet)
            const tags = [
                { name: 'Action', value: "CreateComment" },
                { name: 'TwitterId', value: event.data.tweetId },
                { name: 'Message', value: event.data.text },
                { name: 'Variant', value: 'ao.TN.1' },
                { name: 'Type', value: 'Message' },
                { name: 'Data-Protocol', value: 'ao' }
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
    }
}); 

function Uint8ArrayToString(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i]);
    }
    return dataString
}