export default function AutoContainer(Modal) {
  if (!Modal.defaultProps) { Modal.defaultProps = {} }
  Object.assign(Modal.defaultProps, { getContainer: () => window.parent.document.body })
  return Modal
}
