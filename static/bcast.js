const activechannels = [],
      connections = {}

function broadcast(data) {
  activechannels.forEach(chan => chan.send(data))
}

window.addEventListener('load', () => {
  const signaler = io()

  signaler.emit('room', location.hash.slice(1))
  signaler.on('disconnects', addr => delete connections[addr])
  signaler.on('sdp from', async ({ sdp, addr }) => {
    console.log("wants to connect", addr, sdp)
    if (connections[addr])
      pc = connections[addr]
    else {
      pc = connections[addr] = new RTCPeerConnection({
        iceServers: [{ urls: [
          'stun:stun.stunprotocol.org:3478',
        ] }],
      })

      // set up handshake handlers
      pc.onicecandidate = ({ candidate }) => signaler.emit('candidate to', { candidate, addr })
      pc.onnegotiationneeded = async () => {
        console.log("negotiation needed")
        await pc.setLocalDescription()
        signaler.emit('sdp to', { sdp: pc.localDescription, addr })
      }

      // set up success handling
      pc.ondatachannel = ({ channel }) => {
        console.log("Got connection", channel)
        activechannels.push(channel)
        channel.send(picture.value)  // <==== access to picture
      }
    }

    // tell us who they are
    await pc.setRemoteDescription(sdp)
    if (pc.signalingState !== 'stable') {
      // tell them who we are
      await pc.setLocalDescription()
      signaler.emit('sdp to', { sdp: pc.localDescription, addr })
    }
  })
})
