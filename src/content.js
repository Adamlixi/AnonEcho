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
    button.textContent = 'Connect Wallet';
    
    // 添加悬停效果
    button.onmouseover = () => button.style.backgroundColor = '#1991db';
    button.onmouseout = () => button.style.backgroundColor = '#1DA1F2';
    
    // 添加点击事件
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
            type: 'SEND_TEXT',
            text: text.trim(),  // 确保去除首尾空格
            tweetId: lastSegment
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

// 修改 createComment 函数中显示时间的部分
function createComment(comment) {
    const commentEl = document.createElement('div');
    commentEl.style.cssText = `
        padding: 12px;
        border-bottom: 1px solid #2f3336;
        background-color: black;
        color: white;
    `;

    // 评论主体
    const mainContent = document.createElement('div');
    mainContent.style.cssText = `
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

    // 添加匿名者SVG图标
    avatar.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
                  fill="#4A4A4A"/>
        </svg>
    `;

    // 评论内容区
    const content = document.createElement('div');
    content.style.cssText = `
        flex-grow: 1;
    `;

    // 用户名
    const username = document.createElement('span');
    username.style.cssText = `
        font-weight: bold;
        margin-right: 8px;
    `;
    // 修改用户名显示格式：前6位 + ... + 后4位
    const formatUsername = (name) => {
        if (!name || name === 'Anonymous') return 'Anonymous';
        if (name.length <= 10) return name;
        return `${name.slice(0, 6)}...${name.slice(-4)}`;
    };
    username.textContent = formatUsername(comment.username);

    // 时间
    const time = document.createElement('span');
    time.style.cssText = `
        color: #71767b;
        font-size: 14px;
        margin-left: 8px;
    `;
    time.textContent = formatTimestamp(comment.time);

    // 评论文本
    const text = document.createElement('div');
    text.style.cssText = `
        margin-top: 4px;
        line-height: 1.3;
    `;
    text.textContent = comment.text;

    // 组装内容
    content.appendChild(username);
    content.appendChild(time);
    content.appendChild(text);
    mainContent.appendChild(avatar);
    mainContent.appendChild(content);
    commentEl.appendChild(mainContent);

    return commentEl;
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

// 添加获取评论的函数
const getComments = debounce((tweetId) => {
    window.postMessage({ 
        type: 'GET_COMMENTS',
        tweetId: tweetId
    }, '*');
}, 1000); // 1秒的防抖时间

// 修改 createContainer 函数
function createContainer() {
    const container = document.createElement('div');
    container.className = 'custom-container';
    
    const textBox = createTextBox();
    const buttonContainer = createButtonContainer();
    
    container.appendChild(textBox);
    container.appendChild(buttonContainer);
    
    // 获取评论数据
    const currentUrl = window.location.href;
    const lastSegment = currentUrl.split('/').pop();
    getComments(lastSegment);  // 使用防抖函数
    
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

    // 修改评论事件监听器
    document.addEventListener('COMMENTS_IN_TWITTER', (event) => {
        const _comments = event.detail.comments;
        console.log("Received comments:", _comments);
        console.log("comments type:", typeof _comments)
        const comments = JSON.parse(_comments)
        if (comments && Array.isArray(comments)) {
            // 按时间戳降序排序（最新的在前面）
            comments.sort((a, b) => {
                const timeA = new Date(a.time).getTime();
                const timeB = new Date(b.time).getTime();
                return timeB - timeA;  // 降序排序
            });

            console.log("Creating comment section")
            // 获取容器
            let container = document.querySelector('.custom-container');
            if (container) {
                // 移除旧的评论区
                const oldCommentSection = container.querySelector('.comment-section');
                if (oldCommentSection) {
                    oldCommentSection.remove();
                }
                
                // 创建并添加新的评论区
                const commentSection = createCommentSection(comments);
                container.appendChild(commentSection);
            }
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

    document.addEventListener('COMMENT_CREATED', (event) => {
        console.log("Comment created:", event.detail);
        getComments(event.detail.tweetId);  // 使用防抖函数
    });

}

// 主函数：查目标元素并插入内容
function insertElements() {
    const targetElement = document.querySelector('[data-testid="inline_reply_offscreen"]');
    
    if (targetElement) {
        const existingContainer = document.querySelector('.custom-container');
        if (!existingContainer) {
            const container = createContainer();
            targetElement.parentNode.insertBefore(container, targetElement.nextSibling);
        }
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
            
            // 等待页面加载完成后执行 insertElements
            waitForElement('[data-testid="inline_reply_offscreen"]')
                .then(() => {
                    insertElements();
                })
                .catch(() => {
                    console.log('Target element not found after timeout');
                });
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

// 修改初始化函数
function init() {
    // 注入脚本
    injectScript();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 设置 URL 变化监听
    setupUrlChangeListener();
    
    // 等待页面加载完成后执行 insertElements
    waitForElement('[data-testid="inline_reply_offscreen"]')
        .then(() => {
            insertElements();
        })
        .catch(() => {
            console.log('Target element not found after timeout');
        });
}

// 启动初始化
init();