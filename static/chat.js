var username = prompt("What is your name?");

function chat(chatInput) {
  signaler.emit('chat', username, chatInput.value);
  chatInput.value = '';
}

function addChatMessage(name, msg) {
  const item = document.createElement('div');
  item.className = 'chatMessage';

  const chatName = document.createElement('span');
  chatName.className = 'chatName';
  chatName.textContent = name;

  const chatText = document.createElement('span');
  chatText.textContent = msg;

  item.appendChild(chatName);
  item.appendChild(chatText);

  const scrollToEnd =
    chatHistory.scrollHeight - chatHistory.scrollTop ===
    chatHistory.clientHeight;

  chatHistory.appendChild(item);

  if (scrollToEnd) {
    item.scrollIntoView();
  }
}

function setupChat() {
  signaler.on('chat', (sender, msg) => addChatMessage(sender, msg));
}
