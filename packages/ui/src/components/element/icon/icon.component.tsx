"use client";

import type { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Icon = (props: FontAwesomeIconProps) => (
  <FontAwesomeIcon data-slot="icon" {...props} />
);

type IconProps = FontAwesomeIconProps;

export { Icon };
export type { IconProps };
