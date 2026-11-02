export default function Stars({ value, max = 5 }) {
  return (
    <span className="stars" aria-label={value + ' из ' + max}>
      {' '.repeat(Math.round(value))}
      <span className="stars-off">{' '.repeat(max - Math.round(value))}</span>
    </span>
  )
}
