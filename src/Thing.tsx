import React from "react";

type ThingProps = {
  children: React.ReactNode;
};

export const Thing = ({ children }: ThingProps) => {
  return <div>{children}</div>;
};
