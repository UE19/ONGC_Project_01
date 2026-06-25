(function() {
    // --- CONFIGURATION ---
    // add this line to the website's HTML to include the chatbot widget:
    //* <script src="/scripts/chatbot-widget.js" async></script>
    // Change these values to match your deployment environment
    const CONFIG = {
      apiBaseUrl: "http://localhost",
      token: "vanna_s9p36bNEmQ8GzE7BMcB2kS4N05_7y_4Dgod83RTF4XAbPIEgXuv55w"
    };

    class VannaChatWidget extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
        this.isDark = false;
        this.isTokenValid = null;
      }

      connectedCallback() {
        this.render();
        this.initElements();
        this.addEventListeners();
        this.validateToken(); // Validate the token silently on load
      }

      render() {
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              --primary-color: #2563eb;
              --primary-hover: #1d4ed8;
              --bg-light: #ffffff;
              --bg-dark: #1e293b;
              --chat-bg-light: #f8fafc;
              --chat-bg-dark: #0f172a;
              --text-light: #1e293b;
              --text-dark: #f8fafc;
              --border-light: #e2e8f0;
              --border-dark: #334155;

              /* Current theme variables defaulted to Light */
              --bg: var(--bg-light);
              --chat-bg: var(--chat-bg-light);
              --text: var(--text-light);
              --border: var(--border-light);
              --msg-user: var(--primary-color);
              --msg-bot-light: #e2e8f0;
              --msg-bot-dark: #334155;
              --msg-bot: var(--msg-bot-light);
              --msg-bot-text: var(--text-light);

              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 999999;
            }

            :host([theme="dark"]) {
              --bg: var(--bg-dark);
              --chat-bg: var(--chat-bg-dark);
              --text: var(--text-dark);
              --border: var(--border-dark);
              --msg-bot: var(--msg-bot-dark);
              --msg-bot-text: var(--text-dark);
            }

            /* Floating Launcher Button */
            .launcher {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: var(--primary-color);
              color: white;
              border: none;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: transform 0.2s, background-color 0.2s;
            }
            .launcher:hover {
              transform: scale(1.05);
              background: var(--primary-hover);
            }
            .launcher svg {
              width: 28px;
              height: 28px;
              fill: currentColor;
            }

            /* Chat Window Card */
            .chat-window {
              display: none;
              width: 380px;
              height: 520px;
              background: var(--bg);
              color: var(--text);
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.2);
              border: 1px solid var(--border);
              position: absolute;
              bottom: 80px;
              right: 0;
              flex-direction: column;
              overflow: hidden;
              transition: opacity 0.2s transform 0.2s;
            }
            .chat-window.open {
              display: flex;
            }

            /* Header Styling */
            .header {
              padding: 16px;
              background: var(--primary-color);
              color: white;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .header-title { font-weight: 600; font-size: 16px; }
            .header-actions { display: flex; gap: 8px; }
            .header-btn {
              background: transparent;
              border: none;
              color: white;
              cursor: pointer;
              opacity: 0.8;
              padding: 4px;
            }
            .header-btn:hover { opacity: 1; }

            /* Message Panel */
            .messages {
              flex: 1;
              padding: 16px;
              background: var(--chat-bg);
              overflow-y: auto;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .msg {
              max-width: 80%;
              padding: 10px 14px;
              border-radius: 14px;
              font-size: 14px;
              line-height: 1.4;
              word-wrap: break-word;
            }
            .msg.user {
              background: var(--msg-user);
              color: white;
              align-self: flex-end;
              border-bottom-right-radius: 2px;
            }
            .msg.bot {
              background: var(--msg-bot);
              color: var(--msg-bot-text);
              align-self: flex-start;
              border-bottom-left-radius: 2px;
            }
            .msg.system {
              background: #fef08a;
              color: #854d0e;
              align-self: center;
              font-size: 12px;
              border-radius: 6px;
            }

            /* Input Footer Area */
            .footer {
              padding: 12px;
              border-top: 1px solid var(--border);
              display: flex;
              gap: 8px;
              background: var(--bg);
            }
            .input-field {
              flex: 1;
              padding: 10px 14px;
              border-radius: 20px;
              border: 1px solid var(--border);
              background: var(--chat-bg);
              color: var(--text);
              font-size: 14px;
              outline: none;
            }
            .input-field:focus {
              border-color: var(--primary-color);
            }
            .send-btn {
              background: var(--primary-color);
              color: white;
              border: none;
              border-radius: 50%;
              width: 38px;
              height: 38px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .send-btn:hover { background: var(--primary-hover); }
            .send-btn disabled { background: var(--border); cursor: not-allowed; }

            /* Loading Dot Animation */
            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 4px 0;
            }
            .dot {
              width: 8px;
              height: 8px;
              background: currentColor;
              border-radius: 50%;
              opacity: 0.4;
              animation: bounce 1s infinite alternate;
            }
            .dot:nth-child(2) { animation-delay: 0.2s; }
            .dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes bounce { to { transform: translateY(-4px); opacity: 1; } }
          </style>

          <button class="launcher" id="launcherBtn">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
          </button>

          <div class="chat-window" id="chatWindow">
            <div class="header">
              <span class="header-title">Assistant</span>
              <div class="header-actions">
                <button class="header-btn" id="themeBtn" title="Toggle Theme">☀️</button>
                <button class="header-btn" id="closeBtn" title="Close">❌</button>
              </div>
            </div>
            <div class="messages" id="msgContainer">
              <div class="msg bot">Hello! How can I help you today?</div>
            </div>
            <div class="footer">
              <input type="text" class="input-field" id="inputField" placeholder="Type your question..." autocomplete="off">
              <button class="send-btn" id="sendBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        `;
      }

      initElements() {
        this.launcherBtn = this.shadowRoot.getElementById('launcherBtn');
        this.chatWindow = this.shadowRoot.getElementById('chatWindow');
        this.closeBtn = this.shadowRoot.getElementById('closeBtn');
        this.themeBtn = this.shadowRoot.getElementById('themeBtn');
        this.sendBtn = this.shadowRoot.getElementById('sendBtn');
        this.inputField = this.shadowRoot.getElementById('inputField');
        this.msgContainer = this.shadowRoot.getElementById('msgContainer');
      }

      addEventListeners() {
        this.launcherBtn.addEventListener('click', () => this.toggleWidget());
        this.closeBtn.addEventListener('click', () => this.toggleWidget());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.inputField.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.handleSend();
        });
      }

      toggleWidget() {
        this.isOpen = !this.isOpen;
        this.chatWindow.classList.toggle('open', this.isOpen);
        if (this.isOpen) {
          this.inputField.focus();
          this.scrollToBottom();
        }
      }

      toggleTheme() {
        this.isDark = !this.isDark;
        if (this.isDark) {
          this.setAttribute('theme', 'dark');
          this.themeBtn.textContent = '🌙';
        } else {
          this.removeAttribute('theme');
          this.themeBtn.textContent = '☀️';
        }
      }

      appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('msg', sender);
        msgDiv.innerHTML = text;
        this.msgContainer.appendChild(msgDiv);
        this.scrollToBottom();
        return msgDiv;
      }

      showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.classList.add('msg', 'bot', 'indicator-wrapper');
        indicator.innerHTML = `
          <div class="typing-indicator">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
          </div>`;
        this.msgContainer.appendChild(indicator);
        this.scrollToBottom();
        return indicator;
      }

      scrollToBottom() {
        this.msgContainer.scrollTop = this.msgContainer.scrollHeight;
      }

      // --- API OPERATIONS ---

      async validateToken() {
        try {
          const response = await fetch(`${CONFIG.apiBaseUrl}/api/v1/tokens/validate`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${CONFIG.token}`
            }
          });
          this.isTokenValid = response.ok;
          if (!this.isTokenValid) {
            this.appendMessage("System Configuration Error: Invalid Token Initialization.", "system");
          }
        } catch (error) {
          this.isTokenValid = false;
          console.error("Token validation failure:", error);
        }
      }

      async handleSend() {
        const question = this.inputField.value.trim();
        if (!question) return;

        // Clear input quickly
        this.inputField.value = '';
        this.appendMessage(question, 'user');

        // Guard check for validation failures
        if (this.isTokenValid === false) {
          this.appendMessage("Cannot send query. Token authorization validation failed.", "system");
          return;
        }

        const typingIndicator = this.showTypingIndicator();

        try {
          const response = await fetch(`${CONFIG.apiBaseUrl}/api/query`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CONFIG.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              question: question,
              page: 1,
              page_size: 10,
              explain: false
            })
          });

          typingIndicator.remove();

          if (!response.ok) {
            throw new Error(`Query failed with status code ${response.status}`);
          }

          const data = await response.json();

          if (data && data.summary) {
            this.appendMessage(data.summary, 'bot');
          } else {
            this.appendMessage("Received successful response, but no readable summary text payload was returned.", 'bot');
          }

        } catch (error) {
          typingIndicator.remove();
          this.appendMessage("An error occurred while connecting to the answering service. Please try again.", 'bot');
          console.error("Query Execution Error:", error);
        }
      }
    }

    // Define custom element to the window registry
    customElements.define('vanna-chat-widget', VannaChatWidget);

    // Inject element automatically into host DOM
    const widgetInstance = document.createElement('vanna-chat-widget');
    document.body.appendChild(widgetInstance);
  })();