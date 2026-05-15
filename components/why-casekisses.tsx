export function WhyCaseKisses() {
  const reasons = [
    {
      icon: "🎨",
      text: "Unique girly designs",
    },
    {
      icon: "✨",
      text: "Perfect fit for your phone",
    },
    {
      icon: "💫",
      text: "Trendy & aesthetic styles",
    },
    {
      icon: "🌍",
      text: "Worldwide shipping",
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground text-balance">
          Why CaseKisses?
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reasons.map((reason, index) => (
          <div key={index} className="bg-secondary/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">{reason.icon}</span>
            <p className="text-foreground font-medium">{reason.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
