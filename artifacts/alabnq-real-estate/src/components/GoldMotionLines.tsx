/** Decorative lines shared by the home page sections. */
export function GoldMotionLines() {
  return <div aria-hidden="true" className="home-motion-lines pointer-events-none absolute inset-0 z-0 overflow-hidden">
    <span className="home-motion-line home-motion-line--first" />
    <span className="home-motion-line home-motion-line--second" />
    <span className="home-motion-line home-motion-line--third" />
  </div>;
}