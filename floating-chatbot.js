// Floating chatbot that appears at bottom right of webpage
(function () {
  "use strict";

  // Check if chatbot already exists
  if (document.getElementById("ask-the-page-chatbot")) return;

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
      <div id="chat-window" style="position: absolute; bottom: 70px; right: 0; width: 350px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: none; overflow: hidden; border: 1px solid #e5e7eb;">
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
      transform: scale(1.1) !important;
    }
    #chat-input:focus {
      border-color: #3b82f6 !important;
    }
    #chat-send:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(59,130,246,0.4);
    }
  `;
  document.head.appendChild(style);

  // Insert chatbot into page
  document.body.insertAdjacentHTML("beforeend", chatbotHTML);

  // Get elements
  const chatToggle = document.getElementById("chat-toggle");
  const chatWindow = document.getElementById("chat-window");
  const chatClose = document.getElementById("chat-close");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");
  const chatMessages = document.getElementById("chat-messages");

  // Toggle chat window
  function toggleChat() {
    if (isOpen) {
      chatWindow.style.animation = "chatSlideOut 0.3s ease-out";
      setTimeout(() => {
        chatWindow.style.display = "none";
        isOpen = false;
      }, 300);
    } else {
      chatWindow.style.display = "block";
      chatWindow.style.animation = "chatSlideIn 0.3s ease-out";
      isOpen = true;
      chatInput.focus();
    }
  }

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
        <div style="max-width: 280px; padding: 12px 16px; border-radius: 18px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; box-shadow: 0 2px 8px rgba(59,130,246,0.3); font-size: 14px;">
          ${text}
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div style="max-width: 280px; padding: 12px 16px; border-radius: 18px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
            <span style="font-size: 11px; font-weight: 500; color: #6b7280;">AI Assistant</span>
          </div>
          <div style="font-size: 14px; color: #374151;">${text}</div>
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
      <div style="max-width: 280px; padding: 12px 16px; border-radius: 18px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
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
      // Get page content
      const pageContent = document.body.innerText || "";

      const response = await fetch("http://localhost:5001/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message, pageContent }),
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
  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !isLoading) sendMessage();
  });

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
