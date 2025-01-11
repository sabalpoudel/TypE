// DOM Elements
const elements = {
  titleOutput: document.getElementById("title"),
  codeInput: document.getElementById("code-input"),
  titleInput: document.getElementById("title-input"),
  codeOutput: document.getElementById("code-output"),
  fontSizeInput: document.getElementById("font-size"),
  actionButton: document.getElementById("action-button"),
  generateButton: document.getElementById("generate-button"),
  fontSizeDisplay: document.getElementById("font-size-display"),
};

// Syntax highlighting map
const syntaxMap = {
  comments: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, // Matches single-line and multiline comments
  strings: /(["'])(?:(?=(\\?))\2.)*?\1/g, // Matches strings enclosed in quotes
  keywords: /\b(function|return|const|let|var|if|else|for|while)\b/g, // Keywords
  numbers: /\b\d+\b/g, // Matches numbers
  functions: /\b\w+(?=\()/g, // Matches function names before parentheses
};

// State Variables
const state = {
  delay: 50,
  isTyping: false,
  isPaused: false,
  currentIndex: 0,
  typingTimeout: null,
  displayedCode: "",
  highlightedCode: "",
};

/**
 * Escapes HTML special characters.
 * @param {string} code - The code to escape.
 * @returns {string} Escaped code.
 */
function escapeHTML(code) {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
/**
 * Decodes Escaped HTML special characters.
 * @param {string} code - The code to Decode.
 * @returns {string} Decode code.
 */
function decodeHTML(code) {
  return code
    .replace(/&lt;/g, "<") // Decode <
    .replace(/&gt;/g, ">") // Decode >
    .replace(/&quot;/g, '"') // Decode double quotes
    .replace(/&amp;/g, "&"); // Decode &
}

/**
 * Applies syntax highlighting to the given code.
 * @param {string} code - The code to highlight.
 * @returns {string} Highlighted code.
 */
function highlightSyntax(code) {
  return decodeHTML(
    escapeHTML(code)
      .replace(syntaxMap.strings, '<span class="token string">$&</span>')
      .replace(syntaxMap.keywords, '<span class="token keyword">$&</span>')
      .replace(syntaxMap.functions, '<span class="token function">$&</span>')
      .replace(syntaxMap.numbers, '<span class="token number">$&</span>')
      .replace(syntaxMap.comments, '<span class="token comment">$&</span>')
  );
}

/**
 * Types the next character in the highlighted code.
 */
function typeNextChar() {
  if (state.isPaused || state.currentIndex >= state.highlightedCode.length)
    return;

  state.displayedCode += state.highlightedCode[state.currentIndex];
  elements.codeOutput.innerHTML =
    state.displayedCode + `<span class="cursor"></span>`;

  // Handle HTML tags in highlighted code
  if (state.highlightedCode[state.currentIndex] === "<") {
    while (state.highlightedCode[++state.currentIndex] !== ">") {
      state.displayedCode += state.highlightedCode[state.currentIndex];
    }
    state.displayedCode += state.highlightedCode[state.currentIndex];
  }

  state.currentIndex++;
  if (state.currentIndex < state.highlightedCode.length) {
    state.typingTimeout = setTimeout(typeNextChar, state.delay);
  } else {
    resetTyping(false);
    elements.actionButton.textContent = "Clear";
  }
}

/**
 * Initiates the typing effect for the provided code.
 * @param {string} code - The code to type.
 */
function typeCode(code) {
  state.highlightedCode = highlightSyntax(code);
  state.isTyping = true;
  typeNextChar();
}

/**
 * Updates the font size dynamically based on user input.
 */
function updateFontSize() {
  const newSize = elements.fontSizeInput.value;
  elements.fontSizeDisplay.textContent = newSize;
  elements.codeOutput.style.fontSize = `${newSize}px`;
}

/**
 * Clears the current displayed and highlighted code.
 */
function clearValues() {
  state.displayedCode = "";
  state.highlightedCode = "";
  elements.codeOutput.innerHTML = "";
}

/**
 * Resets the typing state.
 * @param {boolean} clearHTML - Whether to clear the HTML output.
 */
function resetTyping(clearHTML = true) {
  state.currentIndex = 0;
  state.isTyping = false;
  state.isPaused = false;
  clearTimeout(state.typingTimeout);
  if (clearHTML) elements.codeOutput.innerHTML = "";
}

// Event Listeners
elements.fontSizeInput.addEventListener("input", updateFontSize);

elements.generateButton.addEventListener("click", () => {
  const title = elements.titleInput.value.trim();
  const codeSnippet = elements.codeInput.value;

  if (state.isTyping) resetTyping();
  clearValues();

  if (title) elements.titleOutput.textContent = title;
  if (codeSnippet) typeCode(codeSnippet);
});

elements.actionButton.addEventListener("click", () => {
  if (state.isTyping) {
    state.isTyping = false;
    state.isPaused = true;
    clearTimeout(state.typingTimeout);
    elements.actionButton.textContent = "Resume";
  } else if (state.isPaused) {
    state.isPaused = false;
    state.isTyping = true;
    typeNextChar();
    elements.actionButton.textContent = "Stop";
  } else if (elements.actionButton.textContent === "Clear") {
    clearValues();
    elements.actionButton.textContent = "Stop";
  }
});
