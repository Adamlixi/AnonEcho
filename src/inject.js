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
    } else if (event.data.type === 'SEND_TEXT') {
        console.log('Message from text box:', event.data.text);
        console.log('Message from tweetId:', event.data.tweetId);
        const { connect, createDataItemSigner } = require('@permaweb/aoconnect');

        const { result, results, message, spawn, monitor, unmonitor, dryrun} = connect(
            {
                MU_URL: "http://127.0.0.1:9001/mu",
                CU_URL: "http://127.0.0.1:9001/cu",
                GATEWAY_URL: "http://127.0.0.1:9001/ar",
            },
        );
        const PROCESS = "VIy_yhCG3JFu8cHdFuMwo6lxslmaW5gtyZ6IBnksSok"
        try {
            const messageId = await message({
              process: PROCESS,
              signer: createDataItemSigner(window.arweaveWallet),
              tags: [
                { name: 'Action', value: "CreateComment" },
                { name: 'TwitterId', value: event.data.tweetId },
                { name: 'Message', value: event.data.text }
            ],
            });
            async function getResult(processId, messageId) {
                let { Messages } = await result({
                    // the arweave TXID of the message
                    message: messageId,
                    // the arweave TXID of the process
                    process: processId,
                  });
                return Messages
            }
            console.log("messageId:", messageId)
            // var resp = await getResult(PROCESS, messageId);
            // if (resp[0].Data === "Success") {
            document.dispatchEvent(new CustomEvent('COMMENT_CREATED', { 
                detail: {
                    messageId: messageId,
                    tweetId: event.data.tweetId
                }
            }))
            // }
            return messageId;
          } catch (error) {
            console.log("messageToAO -> error:", error)
            return '';
        }
    } else if (event.data.type === 'GET_COMMENTS') {
        console.log("GET_COMMENTS:", event.data.tweetId)

        const { connect, createDataItemSigner } = require('@permaweb/aoconnect');

        const { result, results, message, spawn, monitor, unmonitor, dryrun} = connect(
            {
                MU_URL: "http://127.0.0.1:9001/mu",
                CU_URL: "http://127.0.0.1:9001/cu",
                GATEWAY_URL: "http://127.0.0.1:9001/ar",
            },
        );
        try {
            const resp = await dryrun({
              process: "VIy_yhCG3JFu8cHdFuMwo6lxslmaW5gtyZ6IBnksSok",
              tags: [
                { name: 'Action', value: "GetComment" },
                { name: 'TwitterId', value: event.data.tweetId }
            ],
            });
            console.log("comments:", resp.Messages[0].Data)
            document.dispatchEvent(new CustomEvent('COMMENTS_IN_TWITTER', { 
                detail: {
                    comments: resp.Messages[0].Data
                }
            }));
          } catch (error) {
            console.log("messageToAO -> error:", error)
            return '';
        }
    }
}); 