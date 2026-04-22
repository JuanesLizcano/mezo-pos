const PASOS = ['Cuenta', 'Negocio', 'Plan', 'Mesas', '¡Listo!'];

export default function StepIndicator({ actual }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {PASOS.map((label, i) => {
        const num = i + 1;
        const completado = num < actual;
        const activo = num === actual;

        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${completado ? 'bg-mezo-gold text-mezo-ink' : ''}
                  ${activo ? 'bg-mezo-gold text-mezo-ink ring-4 ring-mezo-gold/20' : ''}
                  ${!completado && !activo ? 'bg-mezo-ink-muted text-mezo-stone' : ''}`}
              >
                {completado ? '✓' : num}
              </div>
              <span className={`text-xs font-medium hidden sm:block font-body
                ${activo ? 'text-mezo-gold' : 'text-mezo-stone'}`}>
                {label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div
                className={`w-12 sm:w-16 h-0.5 mx-1 mb-4 transition-all
                  ${completado ? 'bg-mezo-gold' : 'bg-mezo-ink-line'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
