function chat(chatInput) {
  signaler.emit('chat', chatInput.value);
  chatInput.value = '';
}

function addChatMessage(name, msg, isDrawing) {
  const item = document.createElement('div');
  item.className = 'chatMessage';

  if (isDrawing) {
    const acceptButton = document.createElement('button');
    acceptButton.textContent = '✓';
    acceptButton.onclick = () => signaler.emit('accept', { name, msg });
  }

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

function setupChat(isDrawing) {
  signaler.on('chat', (sender, msg) => addChatMessage(sender, msg, isDrawing));
}
