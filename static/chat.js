function chat(chatInput) {
  signaler.emit('chat', chatInput.value);
  chatInput.value = '';
}

function addChatMessage(name, msg) {
  let item = document.createElement('div');
  item.className = 'chatMessage';

  let chatName = document.createElement('span');
  chatName.className = 'chatName';
  chatName.textContent = name;

  let chatText = document.createElement('span');
  chatText.textContent = msg;

  item.appendChild(chatName);
  item.appendChild(chatText);

  chatHistory.appendChild(item);
}

function setupChat() {
  signaler.on('chat', msg => addChatMessage('placeholder', msg));
}
