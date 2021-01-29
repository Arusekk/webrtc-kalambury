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
  console.log('want new location', newLoc)
  location = newLoc  // TODO: maybe history.pushState
}

function setupGameIO() {
  signaler = io()

  setupChat()
  setupClock()
  signaler.on('new round', isNewOwner => {
    setLocation(`${isNewOwner ? 'draw' : 'view'}${location.hash}`)
  })
}

// vim: set et ts=2 sw=2: kate: replace-tabs on; indent-width 2; tab-width 2;
