import { MouseEvent } from "react";
import cn from "classnames";
import { makePrefixer, Button, ButtonProps } from "@jpmorganchase/uitk-core";
import { CloseSmallIcon } from "@jpmorganchase/uitk-icons";

import { pillBaseName } from "../constants";

export interface DeleteButtonProps extends ButtonProps {
  /**
   * Active state.
   */
  active?: boolean;
}

const withBaseName = makePrefixer(pillBaseName);

export const DeleteButton = (props: DeleteButtonProps) => {
  const { disabled, active, className, ...restProps } = props;
  return (
    <Button
      aria-hidden="true"
      className={cn(
        withBaseName("deleteButton"),
        {
          [withBaseName("deleteButton-disabled")]: disabled,
          [withBaseName("deleteButton-active")]: active,
        },
        className
      )}
      data-testid="pill-delete-button"
      disabled={disabled}
      onMouseEnter={(event: MouseEvent<HTMLButtonElement>) =>
        event.stopPropagation()
      }
      tabIndex={-1}
      variant="secondary"
      {...restProps}
    >
      <CloseSmallIcon className={withBaseName("deleteIcon")} />
    </Button>
  );
};
