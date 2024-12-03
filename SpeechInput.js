// 定数の外部化
const SPEECH_CONFIG = {
  LANG: "ja-JP",
  STATUS: {
    RECORDING: "録音中...",
    STOPPED: "停止済み",
    CLEARED: "クリアしました",
    ERROR: "エラーが発生しました",
  },
};

class SpeechInput {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.transcriptText = "";
    this.elements = this.initializeElements();
  }

  // HTML要素の取得を分離
  initializeElements() {
    return {
      startButton: document.getElementById("startButton"),
      stopButton: document.getElementById("stopButton"),
      outputArea: document.getElementById("outputArea"),
      status: document.getElementById("status"),
    };
  }

  initialize() {
    if (!this.recognition) {
      try {
        this.recognition = new webkitSpeechRecognition();
        this.configureRecognition();
        this.setupRecognitionEventHandlers();
      } catch (error) {
        this.handleError("音声認識の初期化に失敗しました", error);
      }
    }
  }

  // 認識の設定を分離
  configureRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = SPEECH_CONFIG.LANG;
  }

  // イベントハンドラの設定を分離
  setupRecognitionEventHandlers() {
    this.recognition.onstart = () => this.handleStart();
    this.recognition.onend = () => this.handleEnd();
    this.recognition.onresult = (event) => this.handleResult(event);
    this.recognition.onerror = (error) =>
      this.handleError("音声認識エラー", error);
  }

  handleStart() {
    this.isRecording = true;
    this.updateStatus(SPEECH_CONFIG.STATUS.RECORDING);
  }

  handleEnd() {
    if (this.isRecording) {
      this.recognition.start();
    } else {
      this.updateStatus(SPEECH_CONFIG.STATUS.STOPPED);
    }
  }

  handleResult(event) {
    const { interimText, finalText } = this.processRecognitionResults(event);

    if (finalText) {
      this.transcriptText += finalText;
    }
    this.updateOutput(interimText);
  }

  // 認識結果の処理を分離
  processRecognitionResults(event) {
    let interimText = "";
    let finalText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript + "\n";
      } else {
        interimText += transcript;
      }
    }

    return { interimText, finalText };
  }

  handleError(message, error) {
    console.error(message, error);
    this.updateStatus(`${SPEECH_CONFIG.STATUS.ERROR}: ${message}`);
  }

  start() {
    try {
      this.initialize();
      this.recognition.start();
    } catch (error) {
      this.handleError("録音の開始に失敗しました", error);
    }
  }

  stop() {
    try {
      this.isRecording = false;
      if (this.recognition) {
        this.recognition.stop();
      }
    } catch (error) {
      this.handleError("録音の停止に失敗しました", error);
    }
  }

  clear() {
    this.transcriptText = "";
    this.updateOutput();
    this.updateStatus(SPEECH_CONFIG.STATUS.CLEARED);
  }

  updateStatus(message) {
    this.elements.status.textContent = message;
    this.elements.startButton.disabled =
      message === SPEECH_CONFIG.STATUS.RECORDING;
    this.elements.stopButton.disabled =
      message !== SPEECH_CONFIG.STATUS.RECORDING;
  }

  updateOutput(interimText = "") {
    const displayText = this.formatDisplayText(interimText);
    this.elements.outputArea.value = displayText;
    this.elements.outputArea.scrollTop = this.elements.outputArea.scrollHeight;
  }

  // テキスト整形を分離
  formatDisplayText(interimText) {
    return (
      this.transcriptText + (interimText ? `(認識中: ${interimText})` : "")
    );
  }
}
