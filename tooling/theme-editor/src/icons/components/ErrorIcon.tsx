import { SVGProps, Ref, forwardRef } from "react";

import { Icon, IconProps } from "@jpmorganchase/uitk-core";

function SvgComponent(
  props: SVGProps<SVGSVGElement>,
  svgRef?: Ref<SVGSVGElement>
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      data-testid="ErrorIcon"
      ref={svgRef}
      {...props}
    >
      <path
        d="M9.005 0l2.995 3v6l-3 3h-6l-3-3v-6l3-3h6.005zM6.013 7.5c-0.286 0-0.526 0.095-0.721 0.285s-0.292 0.428-0.292 0.715c0 0.287 0.097 0.525 0.292 0.715s0.435 0.285 0.721 0.285c0.286 0 0.522-0.1 0.708-0.299s0.279-0.433 0.279-0.701c0-0.269-0.093-0.502-0.279-0.701s-0.422-0.299-0.708-0.299zM7 2h-2v5h2v-5z"
        fill="#4C505B"
        fillOpacity="0.4"
        width="12"
        height="12"
      />
    </svg>
  );
}

export const ErrorIconSVG = forwardRef(SvgComponent);
export const ErrorIcon = forwardRef<HTMLSpanElement, IconProps>(
  function ErrorIcon(props, ref) {
    return (
      <Icon aria-label="error" role="img" {...props} ref={ref}>
        <ErrorIconSVG />
      </Icon>
    );
  }
);
