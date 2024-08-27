import { ReactNode } from 'react';

export type FeatureCardProps = {
  title: string;
  content: ReactNode;
};

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, content }) => {
  return (
    <div className="flex gap-3 rounded-md bg-white p-6 shadow-md transition duration-300 ease-in-out hover:scale-105">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-12 w-12 text-purple-800"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <div className="flex flex-col">
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <div>{content}</div>
      </div>
    </div>
  );
};
