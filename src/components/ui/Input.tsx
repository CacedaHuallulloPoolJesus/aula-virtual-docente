import { clsx } from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export function Input({ label, className, icon, rightElement, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {icon}
          </span>
        )}
        <input
          className={clsx(
            "h-10 w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
            icon ? "pl-10" : "pl-4",
            rightElement ? "pr-10" : "pr-4",
            className,
          )}
          {...props}
        />
        {rightElement && <span className="absolute inset-y-0 right-3 flex items-center">{rightElement}</span>}
      </div>
    </label>
  );
}
