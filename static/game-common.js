let signaler

function getRTCPeerConnection(addr) {
  // might depend on signaler

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: [
      'stun:stun.stunprotocol.org:3478',
    ] }],
  })

  // set up handshake handlers
  pc.onicecandidate = ({ candidate }) => signaler.emit('webrtc to', { candidate, addr })
  pc.onnegotiationneeded = async () => {
    console.log("negotiation needed")
    await pc.setLocalDescription()
    signaler.emit('webrtc to', { sdp: pc.localDescription, addr })
  }

  onsdp = async sdp => {
    // tell us who they are
    await pc.setRemoteDescription(sdp)
    if (pc.signalingState !== 'stable') {
      // tell them who we are
      await pc.setLocalDescription()
      signaler.emit('webrtc to', { sdp: pc.localDescription, addr })
    }
  }
  return { pc, onsdp }
}

function setLocation(newLoc) {
  if (location.pathname.slice(1) + location.hash === newLoc) {
    console.log('need reload')
    location.reload()
  }
  else {
    console.log('want new location', newLoc)
    location.href = newLoc  // TODO: maybe history.pushState
  }
}

function setupGameIO() {
  signaler = io()

  setupChat()
  setupClock()
  setupPlayerList()
  signaler.on('new round', isNewOwner => {
    setLocation(`${isNewOwner ? 'draw' : 'view'}${location.hash}`)
  })
}

function setNickname(name) {
  nickname.textContent = name;
  sessionStorage.setItem('nickname', name);
  signaler.emit('set nick', name);
}

// TODO: consider sending an initial nickname along with `room` instead
function postRoomJoin() {
  const nickname = sessionStorage.getItem('nickname') ||
    `Gracz${Math.floor(Math.random() * 1e4)}`;
  setNickname(nickname);
}


function nextRound() {
  signaler.emit('nextRound');
}
// vim: set et ts=2 sw=2: kate: replace-tabs on; indent-width 2; tab-width 2;
