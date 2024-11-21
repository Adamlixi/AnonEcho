function createTextBox() {
    const textBox = document.createElement('div');
    textBox.id = 'helloTextBox';
    textBox.style.cssText = `
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #333;
        border-radius: 8px;
        background-color: #000;
        color: #71767b;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        min-height: 20px;
    `;
    textBox.textContent = 'Write your anonymous comment...';
    textBox.contentEditable = 'true';

    textBox.addEventListener('focus', function() {
        if (this.textContent === 'Write your anonymous comment...') {
            this.textContent = '';
            this.style.color = '#fff';
        }
    });

    textBox.addEventListener('blur', function() {
        if (this.textContent.trim() === '') {
            this.textContent = 'Write your anonymous comment...';
            this.style.color = '#71767b';
        }
    });

    return textBox;
}

// 注入脚本到页面
function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.type = 'text/javascript';
    (document.head || document.documentElement).appendChild(script);
}

// 创建钱包连接按钮
function createWalletButton() {
    const button = document.createElement('button');
    button.id = 'wallet-connect-button';
    button.style.cssText = `
        padding: 8px 16px;
        margin: 10px 0;
        border: none;
        border-radius: 20px;
        background-color: #1DA1F2;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-right: 10px;
        min-width: 140px;
    `;

    // 检查钱包连接状态
    window.postMessage({ type: 'CHECK_WALLET_CONNECTION' }, '*');

    // 添加悬停效果
    button.onmouseover = () => button.style.backgroundColor = '#1991db';
    button.onmouseout = () => button.style.backgroundColor = '#1DA1F2';
    
    // 初始文本
    button.textContent = 'Connect Wallet';
    
    // 点击事件
    button.onclick = () => {
        window.postMessage({ type: 'CONNECT_ARWEAVE' }, '*');
    };
    
    return button;
}

// 创建Hello World按钮
function createHelloButton() {
    const button = document.createElement('button');
    button.style.cssText = `
        padding: 8px 16px;
        margin: 10px 0;
        border: none;
        border-radius: 20px;
        background-color: #28a745;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
    `;
    button.textContent = 'Anonymous comment';
    
    // 添加悬停效果
    button.onmouseover = () => button.style.backgroundColor = '#218838';
    button.onmouseout = () => button.style.backgroundColor = '#28a745';
    
    // 修改点击事件，添加文本验证
    button.onclick = () => {
        const textBox = document.getElementById('helloTextBox');
        const text = textBox ? textBox.textContent : '';
        
        // 检查文本是否为空或者是默认提示文本
        if (!text || text.trim() === '' || text === 'Write your anonymous comment...') {
            // 添加抖动动画效果
            textBox.style.animation = 'shake 0.5s';
            setTimeout(() => {
                textBox.style.animation = '';
            }, 500);
            
            // 将边框变红提示错误
            textBox.style.border = '1px solid #dc3545';
            setTimeout(() => {
                textBox.style.border = '1px solid #333';
            }, 2000);
            
            return;
        }

        const currentUrl = window.location.href;
        const lastSegment = currentUrl.split('/').pop();
        window.postMessage({ 
            type: 'SIGN_TEXT',
            text: text.trim(),  // 确保去除首尾空格
            tweetId: lastSegment,
            parent: "",
        }, '*');
        
        // 发送成功后清空输入框
        textBox.textContent = 'Write your anonymous comment...';
        textBox.style.color = '#71767b';
    };
    
    return button;
}

// 添加抖动动画的样式
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// 创建按钮容器
function createButtonContainer() {
    const container = document.createElement('div');
    container.style.cssText = `
        display: flex;
        gap: 10px;
    `;
    container.appendChild(createWalletButton());
    container.appendChild(createHelloButton());
    return container;
}

// 修改时间格式化函数
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    // 如果在一小时内，显示 Just now
    if (diffInMinutes < 60) {
        return 'Just now';
    }
    
    // 补零函数
    const pad = (num) => String(num).padStart(2, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 修改 createComment 函数来添加回复按钮和回复功能
function createComment(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    commentDiv.style.cssText = `
        padding: 12px;
        border-bottom: 1px solid #333;
        margin: 8px 0;
    `;

    // 头像和内容容器
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        display: flex;
        gap: 12px;
    `;

    // 头像 
    const avatar = document.createElement('div');
    avatar.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #1c1c1c;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    `;

    avatar.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
                  fill="#4A4A4A"/>
        </svg>
    `;

    // 右侧内容区
    const rightContent = document.createElement('div');
    rightContent.style.cssText = `
        flex-grow: 1;
    `;

    // 用户名和时间
    const userTime = document.createElement('div');
    userTime.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 4px;
    `;

    const username = document.createElement('span');
    username.style.cssText = `
        font-weight: bold;
        color: #fff;
    `;
    // 修改用户名显示格式：前6位 + ... + 后4位
    const formatUsername = (name) => {
        if (!name || name === 'Anonymous') return 'Anonymous';
        if (name.length <= 10) return name;
        return `${name.slice(0, 6)}...${name.slice(-4)}`;
    };
    username.textContent = formatUsername(comment.owner);

    const time = document.createElement('span');
    time.style.cssText = `
        color: #71767b;
        font-size: 14px;
        margin-left: 8px;
    `;
    time.textContent = formatTimestamp(comment.time);

    userTime.appendChild(username);
    userTime.appendChild(time);

    // 评论内容
    const content = document.createElement('div');
    content.style.cssText = `
        color: #fff;
        margin-bottom: 8px;
    `;
    content.textContent = comment.message;

    // 修改回复按钮，添加回复数量和展开/折叠功能
    const replyButton = document.createElement('div');
    replyButton.style.cssText = `
        display: flex;
        gap: 12px;
        align-items: center;
    `;

    const replyAction = document.createElement('button');
    replyAction.style.cssText = `
        background: none;
        border: none;
        color: #71767b;
        font-size: 14px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
    `;
    replyAction.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
        </svg>
        Reply
    `;

    // 如果有回复，添加展开/折叠按钮
    if (comment.replies && comment.replies.length > 0) {
        const toggleReplies = document.createElement('button');
        toggleReplies.style.cssText = `
            background: none;
            border: none;
            color: #1DA1F2;
            font-size: 14px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
        `;
        toggleReplies.textContent = `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`;
        
        toggleReplies.onclick = (e) => {
            e.stopPropagation();
            comment.isExpanded = !comment.isExpanded;
            
            // 获取该评论下的所有回复元素
            const replyElements = commentDiv.parentNode.querySelectorAll(
                `[data-parent-id="${comment.textid}"]`
            );
            
            replyElements.forEach(element => {
                element.style.display = comment.isExpanded ? 'block' : 'none';
            });
            
            toggleReplies.textContent = comment.isExpanded 
                ? `Hide ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`
                : `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`;
        };
        
        replyButton.appendChild(toggleReplies);
    }

    replyButton.appendChild(replyAction);

    // 回复输入框容器（默认隐藏）
    const replyContainer = document.createElement('div');
    replyContainer.style.cssText = `
        margin-top: 8px;
        display: none;
    `;

    const replyInput = createTextBox();  // 复用之前的 createTextBox 函
    replyInput.style.marginTop = '8px';

    const replySubmitButton = document.createElement('button');
    replySubmitButton.style.cssText = `
        padding: 6px 16px;
        margin: 8px 0;
        border: none;
        border-radius: 20px;
        background-color: #1DA1F2;
        color: white;
        font-weight: bold;
        cursor: pointer;
    `;
    replySubmitButton.textContent = 'Reply';

    replyContainer.appendChild(replyInput);
    replyContainer.appendChild(replySubmitButton);

    // 添加回复按钮点击事件
    replyButton.onclick = () => {
        replyContainer.style.display = replyContainer.style.display === 'none' ? 'block' : 'none';
    };

    // 添加回复提交事件
    replySubmitButton.onclick = () => {
        const replyText = replyInput.textContent;
        if (replyText && replyText !== 'Write your anonymous comment...') {
            // 发送回复消息
            const currentUrl = window.location.href;
            const lastSegment = currentUrl.split('/').pop();
            window.postMessage({ 
                type: 'SIGN_TEXT',
                text: replyText,  // 确保去除首尾空格
                tweetId: lastSegment,
                parent: comment.textid,
            }, '*');
            
            // 清空并隐藏回复框
            replyInput.textContent = 'Write your anonymous comment...';
            replyContainer.style.display = 'none';
        }
    };

    // 在回复按钮中添加回复数量
    if (comment.replies && comment.replies.length > 0) {
        const replyCount = document.createElement('span');
        replyCount.style.cssText = `
            color: #71767b;
            font-size: 13px;
            margin-left: 4px;
        `;
        replyCount.textContent = `${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`;
        replyButton.appendChild(replyCount);
    }

    // 组装评论结构
    rightContent.appendChild(userTime);
    rightContent.appendChild(content);
    rightContent.appendChild(replyButton);
    rightContent.appendChild(replyContainer);

    contentContainer.appendChild(avatar);
    contentContainer.appendChild(rightContent);

    commentDiv.appendChild(contentContainer);

    return commentDiv;
}

// 创建评论区
function createCommentSection(comments = []) {
    const section = document.createElement('div');
    section.className = 'comment-section';
    section.style.cssText = `
        margin-top: 16px;
        border: 1px solid #2f3336;
        border-radius: 16px;
        overflow: hidden;
    `;

    // 如果没有评论,显示提示信息
    if (comments.length === 0) {
        const noComments = document.createElement('div');
        noComments.style.cssText = `
            padding: 20px;
            text-align: center;
            color: #71767b;
        `;
        noComments.textContent = 'No comments yet';
        section.appendChild(noComments);
        return section;
    }

    // 创建评论列表
    comments.forEach(comment => {
        const commentEl = createComment({
            username: comment.owner || 'Anonymous',
            time: comment.time || 'Just now',
            text: comment.message || ''
        });
        section.appendChild(commentEl);
    });

    return section;
}

// 添加防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 添加获取���论的函数
const getComments = debounce((tweetId) => {
    console.log("getComments", tweetId);
    chrome.runtime.sendMessage({
        action: 'GetTwitterComments',
        tweetId: tweetId
      }, response => {
        if (response.success) {
            const _comments = response.data.Messages[0].Data;
            const comments = JSON.parse(_comments)
            if (comments && Array.isArray(comments)) {
                // const mockComments = [
                //     {
                //         textid: "comment_1",
                //         message: "This is the first comment! Really interesting thread.",
                //         time: Date.now() - 3600000 * 2, // 2小时前
                //         parent: "comment",
                //         username: "Anonymous"
                //     },
                //     {
                //         textid: "comment_2",
                //         message: "I totally agree with this point of view!",
                //         time: Date.now() - 1800000, // 30分钟前
                //         parent: "comment",
                //         username: "Anonymous"
                //     },
                //     {
                //         textid: "reply_1",
                //         message: "This is a reply to the first comment",
                //         time: Date.now() - 3000000, // 50分钟前
                //         parent: "comment_1",
                //         username: "Anonymous"
                //     },
                //     {
                //         textid: "comment_3",
                //         message: "Very insightful discussion here",
                //         time: Date.now() - 300000, // 5分钟前
                //         parent: "comment",
                //         username: "Anonymous"
                //     },
                //     {
                //         textid: "reply_2",
                //         message: "Interesting perspective!",
                //         time: Date.now() - 60000, // 1分钟前
                //         parent: "comment_1",
                //         username: "Anonymous"
                //     }
                // ];
                document.dispatchEvent(new CustomEvent('COMMENTS_IN_TWITTER', {
                    detail: {
                        success: true,
                        comments: comments
                    }
                }));
            }
        } else {
          console.error('Error:', response.error);
        }
      });
}, 1000); // 1秒的防抖时间

// 修改 createContainer 函数
function createContainer() {
    const container = document.createElement('div');
    container.className = 'custom-container';
    container.style.cssText = `
        background-color: #000;  // 添加黑色背景
        padding: 16px;
        border-radius: 16px;
        margin: 16px 0;
        border: 1px solid #2f3336;
    `;
    
    const textBox = createTextBox();
    const buttonContainer = createButtonContainer();
    
    container.appendChild(textBox);
    container.appendChild(buttonContainer);
    
    // 获取评论数据
    const currentUrl = window.location.href;
    const lastSegment = currentUrl.split('/').pop();
    getComments(lastSegment);
    
    return container;
}

// 修改事件监听器
function setupEventListeners() {
    // 监听来自页面的消息
    window.addEventListener('message', (event) => {
        if (event.data.type === 'CONNECT_ARWEAVE') {
            window.postMessage({ type: 'TRIGGER_ARCONNECT' }, '*');
        }
    });

    window.addEventListener('message', (event) => {
        if (event.data.type === 'SEND_HELLO') {
            window.postMessage({ type: 'SEND_HELLO_AO' }, '*');
        }
    });

    // 修改钱包连接成功事件监听器
    document.addEventListener('ARCONNECT_SUCCESS', (event) => {
        const address = event.detail.address;
        const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        
        // 更新按钮文本
        const walletButton = document.getElementById('wallet-connect-button');
        if (walletButton) {
            walletButton.textContent = formattedAddress;
            // 可选：添加已连接状态的样式
            walletButton.style.backgroundColor = '#28a745';
            walletButton.onmouseover = () => walletButton.style.backgroundColor = '#218838';
            walletButton.onmouseout = () => walletButton.style.backgroundColor = '#28a745';
        }
    });

    // 监听连接错误事件
    document.addEventListener('ARCONNECT_ERROR', (event) => {
        alert(`Connection failed: ${event.detail.error}`);
    });

    document.addEventListener('GET_SIGNER', (event) => {
        chrome.runtime.sendMessage({
            action: 'CreateTwitterComments',
            signedData: event.detail.signedData
        }, response => {
            console.log(response)
            if (response.success) {
                getComments(event.detail.tweetId);
            } else {
                console.error('Error:', response.error);
            }
        });
    });

    document.addEventListener('COMMENTS_IN_TWITTER', (event) => {
        console.log("Received comments event");
        const { success, comments } = event.detail;
        
        let container = document.querySelector('.custom-container');
        if (container) {
            const oldCommentSection = container.querySelector('.comment-section');
            if (oldCommentSection) {
                oldCommentSection.remove();
            }
            
            const commentSection = document.createElement('div');
            commentSection.className = 'comment-section';
            commentSection.style.cssText = `
                margin-top: 16px;
            `;

            // 创建评论树结构
            const commentTree = buildCommentTree(comments);
            
            // 渲染评论树
            renderCommentTree(commentTree, commentSection);
            
            container.appendChild(commentSection);
        }
    });

    // 添加钱包状态检查响应处理
    document.addEventListener('WALLET_STATUS', (event) => {
        console.log("WALLET_STATUS", event.detail)
        const { isConnected, address } = event.detail;
        const walletButton = document.getElementById('wallet-connect-button');
        
        if (walletButton && isConnected && address) {
            const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
            walletButton.textContent = formattedAddress;
            walletButton.style.backgroundColor = '#28a745';  // 已连接状态使用绿色
            walletButton.onmouseover = () => walletButton.style.backgroundColor = '#218838';
            walletButton.onmouseout = () => walletButton.style.backgroundColor = '#28a745';
        }
    });

}

// 主函数：查目标元素并插入内容
function insertElements() {
    const targetElement = document.querySelector('[data-testid="inline_reply_offscreen"]');
    
    if (targetElement && targetElement.parentNode) {  // 添加 parentNode 检查
        const existingContainer = document.querySelector('.custom-container');
        if (!existingContainer) {
            try {
                const container = createContainer();
                targetElement.parentNode.insertBefore(container, targetElement.nextSibling);
            } catch (error) {
                console.error('Error inserting container:', error);
                // 如果插入失败，可以尝试延迟重试
                setTimeout(() => {
                    const retryTarget = document.querySelector('[data-testid="inline_reply_offscreen"]');
                    if (retryTarget && retryTarget.parentNode && !document.querySelector('.custom-container')) {
                        const container = createContainer();
                        retryTarget.parentNode.insertBefore(container, retryTarget.nextSibling);
                    }
                }, 500);
            }
        }
    } else {
        // 如果目标元素不存在或没有父节点，等待一段时间后重试
        setTimeout(() => {
            const retryTarget = document.querySelector('[data-testid="inline_reply_offscreen"]');
            if (retryTarget && retryTarget.parentNode && !document.querySelector('.custom-container')) {
                const container = createContainer();
                retryTarget.parentNode.insertBefore(container, retryTarget.nextSibling);
            }
        }, 500);
    }
}

// 修改 URL 变化监听函数
function setupUrlChangeListener() {
    let lastUrl = location.href;
    
    const observer = new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            console.log('URL changed to:', currentUrl);
            
            // 清除旧的容器
            const existingContainer = document.querySelector('.custom-container');
            if (existingContainer) {
                existingContainer.remove();
            }
            
            // URL 变化后，等待目标元素出现
            const targetElement = document.querySelector('[data-testid="inline_reply_offscreen"]');
            if (targetElement) {
                insertElements();
            }
        }
    });

    observer.observe(document.body, {
        subtree: true,
        childList: true
    });
}

// 添加等待元素出现的函数
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 设置超时
        setTimeout(() => {
            observer.disconnect();
            reject('Timeout waiting for element');
        }, timeout);
    });
}

// 添加 MutationObserver 来监听 DOM 变化
function setupDOMObserver() {
    const observer = new MutationObserver(debounce((mutations) => {
        const targetElement = document.querySelector('[data-testid="inline_reply_offscreen"]');
        if (targetElement && targetElement.parentNode && !document.querySelector('.custom-container')) {
            try {
                insertElements();
            } catch (error) {
                console.error('Error in DOM observer:', error);
            }
        }
    }, 500));

    // 配置 observer
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true  // 添加属性监听
    });

    return observer;
}

// 修改初始化函数
function init() {
    chrome.storage.local.get(['extensionEnabled'], (result) => {
        const isEnabled = result.extensionEnabled !== false;
        if (!isEnabled) {
            return;
        }

        // 确保 DOM 已经加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                injectScript();
                setupEventListeners();
                setupUrlChangeListener();
                const domObserver = setupDOMObserver();
                
                // 初始检查
                setTimeout(() => {
                    const targetElement = document.querySelector('[data-testid="inline_reply_offscreen"]');
                    if (targetElement && targetElement.parentNode) {
                        insertElements();
                    }
                }, 500);
            });
        } else {
            injectScript();
            setupEventListeners();
            setupUrlChangeListener();
            const domObserver = setupDOMObserver();
            
            // 初始检查
            setTimeout(() => {
                const targetElement = document.querySelector('[data-testid="inline_reply_offscreen"]');
                if (targetElement && targetElement.parentNode) {
                    insertElements();
                }
            }, 500);
        }
    });
}

// 修改状态变化监听器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTENSION_STATE_CHANGED') {
        const isEnabled = message.enabled;
        
        // 获取容器
        const container = document.querySelector('.custom-container');
        if (container) {
            if (isEnabled) {
                container.style.display = 'block';
                // 重新初始化功能
                init();
            } else {
                container.style.display = 'none';
                // 可选：移除注入的脚本
                const injectedScript = document.querySelector('script[src*="inject.js"]');
                if (injectedScript) {
                    injectedScript.remove();
                }
            }
        } else if (isEnabled) {
            // 如果容器不存在但插件被启用，尝试初始化
            init();
        }
    }
});

// 启动初始化
init();

// 修改评论树构建和渲染逻辑
function buildCommentTree(comments) {
    // 首先按时间排序（最新的在前）
    const sortedComments = [...comments].sort((a, b) => b.time - a.time);
    
    const commentMap = new Map();
    const rootComments = [];

    // 将所有评论放入 Map 中
    sortedComments.forEach(comment => {
        comment.replies = [];
        comment.isExpanded = false; // 添加折叠状态
        commentMap.set(comment.textid, comment);
    });

    // 构建树结构
    sortedComments.forEach(comment => {
        if (comment.parent === 'comment') {
            rootComments.push(comment);
        } else {
            const parentComment = commentMap.get(comment.parent);
            if (parentComment) {
                parentComment.replies.push(comment);
            }
        }
    });

    // 对每个评论的回复也按时间排序
    rootComments.forEach(comment => {
        if (comment.replies.length > 0) {
            comment.replies.sort((a, b) => b.time - a.time);
        }
    });

    return rootComments;
}

// 修改渲染评论树的函数
function renderCommentTree(comments, container, level = 0) {
    comments.forEach(comment => {
        const commentElement = createComment(comment);
        
        // 为回复评论添加数据属性和样式
        if (level > 0) {
            commentElement.dataset.parentId = comment.parent;
            commentElement.style.marginLeft = `${level * 20}px`;
            commentElement.style.borderLeft = '2px solid #333';
            commentElement.style.paddingLeft = '20px';
            commentElement.style.display = 'none'; // 默认隐藏回复
        }

        container.appendChild(commentElement);

        // 递归渲染回复
        if (comment.replies && comment.replies.length > 0) {
            renderCommentTree(comment.replies, container, level + 1);
        }
    });
}

// 添加状态监听
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTENSION_STATE_CHANGED') {
    const isEnabled = message.enabled;
    
    // 获取容器
    const container = document.querySelector('.custom-container');
    if (container) {
      if (isEnabled) {
        container.style.display = 'block';
      } else {
        container.style.display = 'none';
      }
    }
  }
});

// 在初始化时检查状态
chrome.storage.local.get(['extensionEnabled'], (result) => {
  const isEnabled = result.extensionEnabled !== false;
  if (!isEnabled) {
    const container = document.querySelector('.custom-container');
    if (container) {
      container.style.display = 'none';
    }
  }
});