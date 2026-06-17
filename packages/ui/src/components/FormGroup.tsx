import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

interface FormGroupProps {
  label: string;
  children: ReactNode;
}

export function FormGroup({ label, children }: FormGroupProps) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select {...props} />;
}
