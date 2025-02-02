import { FC } from "react";
import { CompactInput } from "./CompactInput";
import { withBaseName } from "./utils";
import { PageButton } from "./PageButton";
import { FormFieldProps } from "../form-field";

export interface CompactControlsProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  FormFieldProps?: Partial<FormFieldProps>;
}

export const CompactControls: FC<CompactControlsProps> = ({
  page,
  count,
  onPageChange,
  FormFieldProps,
}) => {
  return (
    <>
      <CompactInput
        page={page}
        count={count}
        onPageChange={onPageChange}
        FormFieldProps={FormFieldProps}
      />
      <span className={withBaseName("compactSeparator")}>of</span>
      <PageButton
        page={count}
        onPageChange={onPageChange}
        disabled={page === count}
      />
    </>
  );
};
