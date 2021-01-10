const pc = new RTCPeerConnection();
let signaler;

pc.onnegotiationneeded = async () => {
  console.log('Negotiation needed')
  await pc.setLocalDescription()
  signaler.emit('sdp', pc.localDescription)
}
pc.onicecandidate = ({ candidate }) => signaler.emit('candidate', candidate)

// prepare for successful connection
const chan = pc.createDataChannel('sendDataChannel')
chan.onopen = () => console.log('Connection successful!', chan)
chan.onmessage = ({ data }) => {
  console.log('Got msg!', data)
  krzyk.innerText = data;
}

// interface
window.addEventListener('load', async () => {
  signaler = io();

  // set up WebRTC handlers
  signaler.on('sdp', async sdp => {
    console.log('got sdp', sdp)
    await pc.setRemoteDescription(sdp)
    if (pc.signalingState !== 'stable') {
      await pc.setLocalDescription()
      signaler.emit('sdp', pc.localDescription)
      console.log('sent sdp', sdp)
    }
  })
  signaler.on('candidate', async candidate => await pc.addIceCandidate(candidate))

  // we want the creator to connect to us
  await pc.setLocalDescription()
  signaler.emit('join', { name: location.hash.slice(1), sdp: pc.localDescription })
})
