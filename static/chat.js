function chat(text_input) {
  var text_input_value = text_input.value;
  text_input.value = "";
  signaler.emit('chat', text_input_value);
}
