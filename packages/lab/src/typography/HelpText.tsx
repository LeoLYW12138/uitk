import { forwardRef, memo } from "react";

import { makePrefixer } from "@brandname/core";

import { Text, TextProps } from "./Text";

const withBaseName = makePrefixer("uitkText");

export const HelpText = memo(
  forwardRef<HTMLDivElement, Omit<TextProps, "elementType">>(function HelpText(
    { children, ...rest },
    ref
  ) {
    return (
      <Text className={withBaseName(`helpText`)} ref={ref} {...rest}>
        {children}
      </Text>
    );
  })
);
