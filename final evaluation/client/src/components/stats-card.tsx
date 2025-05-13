import { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  bgColor: string;
  textColor: string;
};

export function StatsCard({ title, value, icon, bgColor, textColor }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
          <div className={`h-6 w-6 ${textColor}`}>{icon}</div>
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-3xl font-semibold text-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
