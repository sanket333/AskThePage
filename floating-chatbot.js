// Floating chatbot that appears at bottom right of webpage
(function () {
  "use strict";

  // Check if chatbot already exists
  if (document.getElementById("ask-the-page-chatbot")) return;

  // Simple markdown parser (inline to avoid CSP issues)
  function parseMarkdown(text) {
    return (
      text
        // Code blocks FIRST (before inline code to avoid conflicts)
        .replace(
          /```(\w+)?\n?([\s\S]*?)```/g,
          '<pre><code class="language-$1">$2</code></pre>'
        )

        // Headers
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")

        // Bold text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

        // Italic text
        .replace(/\*(.*?)\*/g, "<em>$1</em>")

        // Inline code (after code blocks)
        .replace(/`(.*?)`/g, "<code>$1</code>")

        // Blockquotes
        .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")

        // Lists - convert lines starting with - or * to list items
        .replace(/^[-*] (.*)$/gm, "<li>$1</li>")

        // Numbered lists
        .replace(/^\d+\. (.*)$/gm, "<li>$1</li>")

        // Line breaks
        .replace(/\n/g, "<br>")
    );
  }

  // Post-process to wrap consecutive <li> elements in <ul> and clean up code blocks
  function wrapLists(html) {
    // First, protect code blocks from line break processing
    let codeBlocks = [];
    let codeBlockIndex = 0;

    // Extract code blocks and replace with placeholders
    html = html.replace(
      /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
      (match, content) => {
        codeBlocks[codeBlockIndex] = match.replace(/<br>/g, "\n"); // Replace <br> with \n in code blocks
        return `__CODEBLOCK_${codeBlockIndex++}__`;
      }
    );

    // Wrap consecutive <li> elements in <ul>
    html = html
      .replace(/(<li>.*?<\/li>(?:\s*<br>\s*<li>.*?<\/li>)*)/gs, "<ul>$1</ul>")
      .replace(/<br>\s*(<\/?(?:li|ul)>)/g, "$1")
      .replace(/(<\/(?:li|ul)>)\s*<br>/g, "$1");

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
      html = html.replace(`__CODEBLOCK_${index}__`, block);
    });

    return html;
  }

  let isOpen = false;
  let isLoading = false;

  // Create chatbot HTML
  const chatbotHTML = `
    <div id="ask-the-page-chatbot" style="position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Floating Button -->
      <div id="chat-toggle" style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: all 0.3s ease; transform: scale(1);">
        <svg width="20" height="20" fill="white" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
        </svg>
      </div>

      <!-- Chat Window -->
      <div id="chat-window" style="position: absolute; bottom: 70px; right: 0; width: 350px; height: 538px; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: none; overflow: hidden; border: 1px solid #e5e7eb;">
        <!-- Minimize/Maximize Button -->
        <button id="chat-toggle-size" style="position: absolute; top: 16px; right: 60px; background: rgba(0,0,0,0.1); border: none; border-radius: 6px; padding: 6px 8px; font-size: 14px; cursor: pointer; color: white; z-index: 10002; transition: background 0.2s;" title="Maximize">⛶</button>
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: bold; font-size: 16px;">Ask The Page</div>
              <div style="font-size: 12px; opacity: 0.8;">AI Assistant</div>
            </div>
          </div>
          <div id="chat-close" style="cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s;">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <!-- Messages -->
        <div id="chat-messages" style="height: 360px; overflow-y: auto; padding: 16px; background: linear-gradient(to bottom, #f9fafb, white);">
          <div style="display: flex; justify-content: flex-start; margin-bottom: 12px;">
            <div style="max-width: 280px; padding: 12px 16px; border-radius: 18px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                <span style="font-size: 11px; font-weight: 500; color: #6b7280;">AI Assistant</span>
              </div>
              <div style="font-size: 14px; color: #374151;">Hi! I'm your AI assistant. Ask me anything about this page! 🤖</div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div style="padding: 16px; border-top: 1px solid #e5e7eb; background: white;">
          <div style="display: flex; gap: 8px;">
            <input id="chat-input" type="text" placeholder="Type your question here..." style="flex: 1; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 25px; outline: none; font-size: 14px; transition: border-color 0.2s;" />
            <button id="chat-send" style="padding: 10px 14px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; border-radius: 25px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(59,130,246,0.3);">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add CSS animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes chatSlideIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes chatSlideOut {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(20px) scale(0.95); }
    }
    @keyframes messageSlideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    #chat-toggle:hover {
      transform: scale(1.05) !important;
      transition: transform 0.2s ease;
    }
    #chat-toggle:active {
      transform: scale(0.98) !important;
    }
    #chat-toggle-size:hover {
      background: rgba(0,0,0,0.2) !important;
    }
    #chat-toggle-size:active {
      background: rgba(0,0,0,0.3) !important;
    }
    #chat-input:focus {
      border-color: #3b82f6 !important;
    }
    #chat-send:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(59,130,246,0.4);
    }
    
    /* Markdown styling for chat messages */
    #chat-messages h1, #chat-messages h2, #chat-messages h3,
    .chat-message-content h1, .chat-message-content h2, .chat-message-content h3 {
      margin: 8px 0 4px 0;
      color: #374151;
      font-weight: 600;
    }
    #chat-messages h1, .chat-message-content h1 { font-size: 16px; }
    #chat-messages h2, .chat-message-content h2 { font-size: 15px; }
    #chat-messages h3, .chat-message-content h3 { font-size: 14px; }
    
    #chat-messages p, .chat-message-content p {
      margin: 6px 0;
      line-height: 1.4;
    }
    
    #chat-messages ul, #chat-messages ol,
    .chat-message-content ul, .chat-message-content ol {
      margin: 8px 0;
      padding-left: 18px;
    }
    
    #chat-messages li, .chat-message-content li {
      margin: 2px 0;
    }
    
    #chat-messages code, .chat-message-content code {
      background: #f3f4f6;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
    }
    
    #chat-messages pre, .chat-message-content pre {
      background: #f4f4f4;
      border-radius: 6px;
      padding: 8px 10px;
      margin: 8px 0;
      overflow-x: auto;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
      line-height: 1.4;
      white-space: pre;
    }
    
    #chat-messages pre code, .chat-message-content pre code {
      background: transparent;
      padding: 0;
      font-size: inherit;
      line-height: inherit;
    }
    
    #chat-messages blockquote, .chat-message-content blockquote {
      border-left: 3px solid #10b981;
      margin: 8px 0;
      padding-left: 12px;
      color: #6b7280;
      font-style: italic;
    }
    
    #chat-messages strong, .chat-message-content strong {
      font-weight: 600;
      color: #374151;
    }
    
    #chat-messages em, .chat-message-content em {
      font-style: italic;
      color: #6b7280;
    }
    
    /* Responsive message bubbles */
    .chat-message-bubble {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    /* When chat is minimized (normal size) */
    #chat-window[style*="width: 350px"] .chat-message-bubble {
      max-width: 280px !important;
    }
    
    /* When chat is maximized */
    #chat-window[style*="width: min(70vw"] .chat-message-bubble,
    #chat-window[style*="width: 70vw"] .chat-message-bubble {
      max-width: 75% !important;
    }
    
    .user-message {
      margin-left: auto;
    }
    
    .bot-message, .typing-message {
      margin-right: auto;
    }
  `;
  document.head.appendChild(style);

  // Insert chatbot into page
  document.body.insertAdjacentHTML("beforeend", chatbotHTML);

  // Send page context to backend on page load
  async function sendPageContext() {
    const pageContent = document.body.innerHTML || "";
    try {
      await fetch("http://localhost:5001/api/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_content: pageContent }),
      });
    } catch (err) {
      console.error("Failed to send page context to backend", err);
    }
  }
  sendPageContext();

  // Get elements
  const chatToggle = document.getElementById("chat-toggle");
  const chatWindow = document.getElementById("chat-window");
  const chatClose = document.getElementById("chat-close");
  const chatToggleSize = document.getElementById("chat-toggle-size");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");
  const chatMessages = document.getElementById("chat-messages");

  // State for chat size and toggle
  let isMaximized = false;
  let isToggling = false;

  // Toggle chat window width between normal and maximized
  function toggleChatSize() {
    if (isToggling) return;
    isToggling = true;
    chatWindow.style.transition = "all 0.3s ease";
    if (isMaximized) {
      // Restore to normal size (minimize)
      chatWindow.style.width = "350px";
      chatWindow.style.height = "538px";
      chatWindow.style.position = "absolute";
      chatWindow.style.bottom = "70px";
      chatWindow.style.right = "0";
      chatWindow.style.borderRadius = "20px";
      chatToggleSize.innerHTML = "⛶";
      chatToggleSize.title = "Maximize";
      isMaximized = false;
    } else {
      // Maximize to full width
      chatWindow.style.width = "min(70vw, 800px)";
      chatWindow.style.height = "min(80vh, 538px)";
      chatWindow.style.position = "fixed";
      chatWindow.style.bottom = "20px";
      chatWindow.style.right = "20px";
      chatWindow.style.borderRadius = "12px";
      chatToggleSize.innerHTML = "⤢";
      chatToggleSize.title = "Minimize";
      isMaximized = true;
    }
    setTimeout(() => {
      isToggling = false;
      chatWindow.style.transition = "";
    }, 300);
  }

  // Toggle chat window open/close
  function toggleChat() {
    if (isToggling) return;
    isToggling = true;
    if (isOpen) {
      chatWindow.style.animation = "chatSlideOut 0.3s ease-out";
      setTimeout(() => {
        chatWindow.style.display = "none";
        isOpen = false;
        isToggling = false;
      }, 300);
    } else {
      // Always open in minimized (normal) state
      chatWindow.style.width = "350px";
      chatWindow.style.height = "538px";
      chatWindow.style.position = "absolute";
      chatWindow.style.bottom = "70px";
      chatWindow.style.right = "0";
      chatWindow.style.borderRadius = "20px";
      chatToggleSize.innerHTML = "⛶";
      chatToggleSize.title = "Maximize";
      isMaximized = false;
      chatWindow.style.display = "block";
      chatWindow.style.animation = "chatSlideIn 0.3s ease-out";
      isOpen = true;
      setTimeout(() => {
        if (chatInput) chatInput.focus();
        isToggling = false;
        // Show markdown test on first open (for testing)
        //   if (!window.markdownTestShown) {
        //     showMarkdownTest();
        //     window.markdownTestShown = true;
        //   }
      }, 300);
    }
  }

  // Test function to demonstrate markdown rendering
  //   function showMarkdownTest() {
  //     console.log("Showing markdown test with inline parser");
  //     const testMarkdown = `**🧪 Markdown Test Response**

  // Here are the supported formatting features:

  // ### Text Formatting
  // - **Bold text** for emphasis
  // - *Italic text* for styling
  // - \`inline code\` for technical terms

  // ### Lists
  // 1. **Numbered lists** work great
  // 2. **Bullet points** are supported
  // 3. **Nested items** display properly

  // ### Code Blocks
  // \`\`\`javascript
  // function greet(name) {
  //   console.log("Hello, " + name + "!");
  //   return "Welcome!";
  // }
  // \`\`\`

  // ### Blockquotes
  // > This is a blockquote example
  // > Perfect for highlighting important information

  // ### Headers
  // Different header levels are styled appropriately.

  // **Try asking me a question to see real responses!** 🚀`;

  //     // Add the test message immediately
  //     addMessage(testMarkdown, "bot");
  //   }

  // Add message to chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.style.cssText = `
      display: flex; 
      justify-content: ${sender === "user" ? "flex-end" : "flex-start"}; 
      margin-bottom: 12px;
      animation: messageSlideIn 0.3s ease-out;
    `;

    if (sender === "user") {
      messageDiv.innerHTML = `
        <div class="chat-message-bubble user-message" style="max-width: 80%; padding: 12px 16px; border-radius: 18px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; box-shadow: 0 2px 8px rgba(59,130,246,0.3); font-size: 14px;">
          ${text}
        </div>
      `;
    } else {
      // Use inline markdown parser (CSP-friendly)
      let parsedText = parseMarkdown(text);
      parsedText = wrapLists(parsedText);

      console.log("Using inline markdown parser");
      console.log("Input:", text.substring(0, 50) + "...");
      console.log("Parsed result:", parsedText.substring(0, 100) + "...");

      messageDiv.innerHTML = `
        <div class="chat-message-bubble bot-message" style="max-width: 85%; padding: 12px 16px; border-radius: 18px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border-left: 4px solid #10b981;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
            <span style="font-size: 11px; font-weight: 500; color: #6b7280;">AI Assistant</span>
          </div>
          <div class="chat-message-content" style="font-size: 14px; color: #374151; background: #fff; border-radius: 8px; padding: 8px 10px; margin-top: 6px;">${parsedText}</div>
        </div>
      `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.style.cssText =
      "display: flex; justify-content: flex-start; margin-bottom: 12px; animation: messageSlideIn 0.3s ease-out;";
    typingDiv.innerHTML = `
      <div class="chat-message-bubble typing-message" style="max-width: 85%; padding: 12px 16px; border-radius: 18px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
          <span style="font-size: 11px; font-weight: 500; color: #6b7280;">AI is thinking...</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: bounce 1.4s infinite;"></div>
          <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: bounce 1.4s infinite; animation-delay: 0.1s;"></div>
          <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: bounce 1.4s infinite; animation-delay: 0.2s;"></div>
        </div>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
  }

  // Send message
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || isLoading) return;

    addMessage(message, "user");
    chatInput.value = "";
    isLoading = true;
    chatSend.disabled = true;
    showTyping();

    try {
      // Only send question to backend
      const response = await fetch("http://localhost:5001/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message }),
      });

      const data = await response.json();
      hideTyping();
      addMessage(
        data.answer || "Sorry, I couldn't process your request.",
        "bot"
      );
    } catch (error) {
      hideTyping();
      addMessage("Sorry, something went wrong. Please try again.", "bot");
    } finally {
      isLoading = false;
      chatSend.disabled = false;
      chatInput.focus();
    }
  }

  // Event listeners
  chatToggle.addEventListener("click", toggleChat);
  chatClose.addEventListener("click", toggleChat);
  chatToggleSize.addEventListener("click", toggleChatSize);
  if (chatSend) chatSend.addEventListener("click", sendMessage);
  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !isLoading) sendMessage();
    });
  }

  // Close chat when clicking outside
  document.addEventListener("click", (e) => {
    if (
      isOpen &&
      !document.getElementById("ask-the-page-chatbot").contains(e.target)
    ) {
      toggleChat();
    }
  });
})();
