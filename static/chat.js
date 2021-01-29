function chat(chatInput) {
  signaler.emit('chat', chatInput.value);
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
  signaler.on('chat', msg => addChatMessage('placeholder', msg));
}
