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

function setNickname(name, mode) {
  var username = sessionStorage.getItem('username');
  if (username == null || mode == 1) {
    nickname.textContent = name;
    sessionStorage.setItem('username', name);
    signaler.emit('set_nick', name);
  } else {
    nickname.textContent = username;
    signaler.emit('set_nick', username);
  }
}

function setupChat() {
  setNickname(`Gracz${Math.floor(Math.random() * 1e4)}`, 0);
  signaler.on('chat', (sender, msg) => addChatMessage(sender, msg));
}
