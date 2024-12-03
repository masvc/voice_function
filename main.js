// 定数定義
const MESSAGES = {
  BROWSER_NOT_SUPPORTED:
    "お使いのブラウザ（Safari等）は音声入力を完全にはサポートしていません。\n" +
    "Google Chrome での使用を強く推奨します。",
  ERROR: "エラーが発生しました。ページを更新してください。",
};

const ELEMENTS = {
  START: "startButton",
  STOP: "stopButton",
  CLEAR: "clearButton",
  STATUS: "status",
};

class VoiceInputApp {
  constructor() {
    this.speechInput = null;
    this.initialized = false;
  }

  // アプリケーションの初期化
  initialize() {
    if (this.initialized) return;

    // ブラウザの互換性チェック
    if (!this.checkBrowserSupport()) {
      this.handleBrowserNotSupported();
      return;
    }

    this.speechInput = new SpeechInput();
    this.setupEventListeners();
    this.setupErrorHandling();

    this.initialized = true;
  }

  // ブラウザサポートのチェック
  checkBrowserSupport() {
    return "webkitSpeechRecognition" in window;
  }

  // ブラウザ非対応時の処理
  handleBrowserNotSupported() {
    alert(MESSAGES.BROWSER_NOT_SUPPORTED);
    this.disableButtons();
  }

  // ボタンの無効化
  disableButtons() {
    document.getElementById(ELEMENTS.START).disabled = true;
    document.getElementById(ELEMENTS.STOP).disabled = true;
  }

  // イベントリスナーの設定
  setupEventListeners() {
    const buttons = {
      [ELEMENTS.START]: () => this.speechInput.start(),
      [ELEMENTS.STOP]: () => this.speechInput.stop(),
      [ELEMENTS.CLEAR]: () => this.speechInput.clear(),
    };

    Object.entries(buttons).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("click", handler);
      }
    });
  }

  // エラーハンドリングの設定
  setupErrorHandling() {
    window.addEventListener("error", (e) => {
      console.error("アプリケーションエラー:", e.error);
      document.getElementById(ELEMENTS.STATUS).textContent = MESSAGES.ERROR;
    });
  }
}

// アプリケーションの起動
document.addEventListener("DOMContentLoaded", () => {
  const app = new VoiceInputApp();
  app.initialize();
});
