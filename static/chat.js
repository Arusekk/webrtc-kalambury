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

function setNickname(name) {
  nickname.textContent = name;
  signaler.emit('set_nick', name);
}

function setupChat() {
  setNickname(`Gracz${Math.floor(Math.random() * 1e4)}`);
  signaler.on('chat', (sender, msg) => addChatMessage(sender, msg));
}
