export default function findColor(phase: string) {
  if (phase === 'Running' || phase === 'Doing') { return '#65bc2c' }
  if (phase === 'Waiting') { return '#ffa000'}
  if (phase === 'Pending' || phase === 'Deploying') { return '#0b9eeb'}
  if (phase === 'Stopped') { return '#df582c' }
  if (phase === 'Stopping') { return '#df582c'  }
  if (phase === 'Terminating') { return '#ffa000' }
  if (phase === 'ScrollRelease' || phase === 'RollingUpdate') { return '#ffa000' }
}
