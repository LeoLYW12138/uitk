import { forwardRef, HTMLAttributes, useEffect, useState } from "react";
import cx from "classnames";

import { makePrefixer } from "@brandname/core";

import "./LayerLayout.css";
import { Scrim, ScrimProps } from "../../scrim";
import { State } from "./useDelayedUnmounting";

export const LAYER_POSITION = [
  "center",
  "left",
  "top",
  "right",
  "bottom",
] as const;

export type LayerPosition = typeof LAYER_POSITION[number];

export interface LayerLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Display or hide the scrim.
   */
  displayScrim?: boolean;
  /**
   * Defines the component's width.
   */
  width?: string | number;
  /**
   * Defines the component's z-index.
   */
  zIndex?: number;
  /**
   * Defines the layer position within.
   */
  position?: LayerPosition;
  /**
   * Breakpoint at which the layer will become fullscreen.
   */
  fullScreenAtBreakpoint?: number;
  /**
   * Disable all animations.
   */
  disableAnimations?: boolean;
  /**
   * Props to be passed to the Scrim component.
   */
  scrimProps?: ScrimProps;
  state?: State;
}

const withBaseName = makePrefixer("uitkLayerLayout");

export const LayerLayout = forwardRef<HTMLDivElement, LayerLayoutProps>(
  function LayerLayout(props, ref) {
    const {
      children,
      className,
      displayScrim = true,
      width,
      zIndex,
      position = "center",
      fullScreenAtBreakpoint = 600,
      disableAnimations = false,
      scrimProps,
      style,
      state,
      ...rest
    } = props;

    const [fullScreen, setFullScreen] = useState(
      () => window.innerWidth <= fullScreenAtBreakpoint
    );

    useEffect(() => {
      const listener = () => {
        setFullScreen(window.innerWidth <= fullScreenAtBreakpoint);
      };

      window.addEventListener("resize", listener);

      return () => window.removeEventListener("resize", listener);
    }, [fullScreenAtBreakpoint]);

    const anchored = position !== "center" && !fullScreen;

    const layerStyles = { ...(!fullScreen && { width }), zIndex, ...style };

    const layerLayout = (
      <div
        ref={ref}
        className={cx(withBaseName(), className, {
          [withBaseName("anchor")]: anchored,
          [withBaseName("fullScreen")]: fullScreen,
          [withBaseName(position)]: !fullScreen,
          [withBaseName("animate")]: !disableAnimations,
          [withBaseName("exit-animation")]: state === State.UNMOUNTING,
        })}
        style={layerStyles}
        {...rest}
      >
        {children}
      </div>
    );

    return displayScrim ? (
      <Scrim open={true} {...scrimProps}>
        {layerLayout}
      </Scrim>
    ) : (
      layerLayout
    );
  }
);
