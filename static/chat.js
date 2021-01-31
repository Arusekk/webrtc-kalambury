function chat(chatInput) {
  const val = chatInput.value.trim();
  if (val)
    signaler.emit('chat', val);
  chatInput.value = '';
}

const messages = {
    win: 'wygrywa!'
}

function addChatMessage({ name, msg, type }, isDrawing) {
  const item = document.createElement('div');
  item.className = type === 'msg' ? 'chatMessage' : 'serverMessage';

  if (isDrawing && type === 'msg' && name !== sessionStorage.getItem('nickname')) {
    const acceptButton = document.createElement('button');
    acceptButton.textContent = '✓';
    acceptButton.onclick = () => signaler.emit('add point', name);

    item.appendChild(acceptButton);
  }

  const chatName = document.createElement('span');
  chatName.className = 'chatName';
  chatName.textContent = name;

  const chatText = document.createElement('span');
  chatText.textContent = type === 'msg' ? msg : messages[type];

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

function setupChat(isDrawing) {
  signaler.on('chat', msg => addChatMessage(msg, isDrawing));
}
