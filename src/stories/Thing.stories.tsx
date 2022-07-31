import React, { ComponentProps } from "react";
import { Meta, Story } from "@storybook/react";
import { Thing } from "..";

type ThingProps = ComponentProps<typeof Thing>;

export default {
  title: "Thing",
  component: Thing,
  parameters: {
    controls: { expanded: true },
  },
} as Meta;

export const thing = (args: ThingProps) => {
  return <Thing>the snozzberries taste like snozzberries</Thing>;
};
thing.argTypes = {};
thing.args = {};
thing.storyName = "Thing";
