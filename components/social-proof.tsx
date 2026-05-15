export function SocialProof() {
  const proofs = [
    {
      icon: "🎀",
      text: "Trending now",
    },
    {
      icon: "🌸",
      text: "Loved by aesthetic girls",
    },
    {
      icon: "☀️",
      text: "Made for your everyday style",
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {proofs.map((proof, index) => (
          <div key={index} className="text-center flex flex-col items-center gap-3">
            <span className="text-4xl">{proof.icon}</span>
            <p className="text-foreground/80 font-medium text-lg">{proof.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
