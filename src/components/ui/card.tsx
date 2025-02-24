import React from "react";

// 🔷 Card Wrapper Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`rounded-2xl shadow-lg border border-gray-200 bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// 🔷 Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  ...props
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200" {...props}>
      {children}
    </div>
  );
};

// 🔷 Card Title
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  ...props
}) => {
  return (
    <h2 className="text-lg font-semibold text-gray-800" {...props}>
      {children}
    </h2>
  );
};

// 🔷 Card Content
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  ...props
}) => {
  return <div className="p-6" {...props}>{children}</div>;
};

// 🔷 Card Footer
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  ...props
}) => {
  return (
    <div className="px-6 py-4 border-t border-gray-200" {...props}>
      {children}
    </div>
  );
};
