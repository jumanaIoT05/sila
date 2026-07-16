// Gradient onboarding header with a step indicator, giving the
// banks/detect screens the same visual quality as the dashboard.
export function OnboardingHeader({
  step,
  total,
  title,
  subtitle,
}: {
  step: number;
  total: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="-mx-6 -mt-6 mb-6 rounded-b-3xl bg-gradient-navy px-6 pb-8 pt-10 text-white">
      <div className="mb-4 flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-white" : "bg-white/30"}`}
          />
        ))}
      </div>
      <p className="text-xs uppercase tracking-wide text-white/70">
        Step {step} of {total}
      </p>
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-white/80">{subtitle}</p>
    </div>
  );
}
