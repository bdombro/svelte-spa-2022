export default function goto(to: string) {
  history.pushState(Date.now(), '', to)
}
