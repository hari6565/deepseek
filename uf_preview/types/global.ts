export type Theme = "light" | "dark" | "light-hc" | "dark-hc";
export type Language = "English" | "Tamil" | "Arabic" | "Russian" | "French";
export type Direction = "LTR" | "RTL";
export type FontSize = string;
export type BorderRadiusSize = "xs" | "s" | "m" | "l" | "xl" | "none";

export interface ActionDetails {
  lock: {
    lockMode: string;
    name: string;
    ttl: string;
  };
  stateTransition: {
    sourceQueue: string;
    sourceStatus: string;
    targetQueue: string;
    targetStatus: string;
  };
  pagination: {
    page: string;
    count: number | string;
  };
  encryption: {
    isEnabled: boolean;
    selectedDpd: string;
    encryptionMethod: string;
  };
  events: Record<string, unknown>;
}

export interface AllowedGroupNode {
  groupName: string;
  security: string;
}


export interface PaginationData {
  count: number;
  page: number;
}

export interface EncryptionFlagPageData {
  flag: boolean;
  dpd: string;
  method: string;
}

export interface PrimaryTableData {
  primaryKey: string;
  value: string;
  compName: string;
}

export interface SecurityDataRole {
  blockedGroups: string[];
}

export interface SecurityData {
  [key: string]: SecurityDataRole;
}

export interface ScreenDetail {
  screenName:string;
  ufKey: string;
  screensName: string;
}

export interface DecodedToken {
  loginId: string;
  isAppAdmin: boolean;
  tenant: string;
  type: string;
  ag: string;
  app: string;
  userCode: string;

  orgGrpCode: string;
  orgGrpName: string;

  selectedAccessProfile: string;
  dap: string;

  orgCode: string;
  orgName: string;

  subOrgGrpCode: string;
  subOrgGrpName: string;
  subOrgCode: string;
  subOrgName: string;

  psGrpCode: string;
  psGrpName: string;
  psCode: string;
  psName: string;

  roleGrpCode: string;
  roleGrpName: string;
  roleCode: string;
  roleName: string;

  sid: string;
  iat: number;
  exp: number;
}

export interface Typography {
  bodyFont: string;
  headerFont: string;
  displayFont: string;
}

export interface Branding {
  fontSize: FontSize;
  brandColor: string;
  selectionColor: string;
  hoverColor: string;
  borderRadius: BorderRadiusSize;
}

export interface GlobalProps {
  token: string;
  theme: Theme;
  language: Language;
  direction: Direction;
  branding: Branding;
  typography: Typography;
  displayFormat:any;
}

export type ButtonView =
  | "normal"
  | "action"
  | "outlined"
  | "outlined-info"
  | "outlined-success"
  | "outlined-warning"
  | "outlined-danger"
  | "outlined-utility"
  | "outlined-action"
  | "raised"
  | "flat"
  | "flat-secondary"
  | "flat-info"
  | "flat-success"
  | "flat-warning"
  | "flat-danger"
  | "flat-utility"
  | "flat-action"
  | "normal-contrast"
  | "outlined-contrast"
  | "flat-contrast";

export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";

export type ComponentSize = "xs" | "s" | "m" | "l" | "xl";

export type ButtonPin =
  | "round-round"
  | "brick-brick"
  | "clear-clear"
  | "circle-circle"
  | "round-brick"
  | "brick-round"
  | "round-clear"
  | "clear-round"
  | "brick-clear"
  | "clear-brick"
  | "circle-brick"
  | "brick-circle"
  | "circle-clear"
  | "clear-circle";

export type TextAreaPin =
  | "round-round"
  | "brick-brick"
  | "clear-clear"
  | "round-brick"
  | "brick-round"
  | "round-clear"
  | "clear-round"
  | "brick-clear"
  | "clear-brick";

export type IconDisplay = "Icon only" | "start with icon" | "end with icon";

export type TooltipPlacement =
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "right-start"
  | "right-end"
  | "left-start"
  | "left-end";

export type HeaderPosition = "left" | "right" | "top" | "bottom";

export type CheckboxSize = "m" | "l";

export type SwitchSize = "m" | "l";

export type RadioSize = "s" | "m" | "l" | "xl";

export type TextInputType = "email" | "number" | "password" | "search" | "tel" | "text" | "url";

export type TextInputView = "normal" | "clear";

export type AvatarSize = "xs" | "s" | "m" | "l" | "xl";

export type AvatarView = "filled" | "outlined";

export type AvatarTheme = "normal" | "brand";

export type AvatarShape = "circle" | "square";

export type CardSize = "m" | "l";

export type CardTheme = "normal" | "info" | "success" | "warning" | "danger" | "utility";

export type CardView = "outlined" | "clear" | "filled" | "raised";

export type LabelSize = "xs" | "s" | "m";

export type LabelTheme = "normal" | "info" | "danger" | "warning" | "success" | "utility" | "unknown" | "clear";

export type ProgressTheme = "default" | "info" | "danger" | "warning" | "success" | "misc";

export type ProgressSize = "xs" | "s" | "m";

export type TabsSize = "m" | "l" | "xl";

export type TabsDirection = "horizontal" | "vertical";

export type TimePickerSize = "s" | "m" | "l";

export type TimeType = "normal" | "railway";

export type TimeSettings = "hh-mm" | "hh-mm-sec";

export type TextVariant =
  | "display-4"
  | "display-3"
  | "display-2"
  | "display-1"
  | "header-2"
  | "header-1"
  | "subheader-3"
  | "subheader-2"
  | "subheader-1"
  | "body-3"
  | "body-2"
  | "body-1"
  | "body-short"
  | "caption-2"
  | "caption-1"
  | "code-3"
  | "code-inline-3"
  | "code-2"
  | "code-inline-2"
  | "code-1"
  | "code-inline-1";

export type TextColor =
  | "primary"
  | "complementary"
  | "secondary"
  | "hint"
  | "info"
  | "info-heavy"
  | "positive"
  | "positive-heavy"
  | "warning"
  | "warning-heavy"
  | "danger"
  | "danger-heavy"
  | "utility"
  | "utility-heavy"
  | "misc"
  | "misc-heavy"
  | "brand"
  | "link"
  | "link-hover"
  | "link-visited"
  | "link-visited-hover"
  | "dark-primary"
  | "dark-complementary"
  | "dark-secondary"
  | "light-primary"
  | "light-complementary"
  | "light-secondary"
  | "light-hint"
  | "inverted-primary"
  | "inverted-complementary"
  | "inverted-secondary"
  | "inverted-hint";

export type WordBreak = "break-all" | "break-word";

export type Whitespace = "nowrap" | "break-spaces";

export interface TooltipProps {
  title: string;
  placement: TooltipPlacement;
}

// Event System Types
export type ListenerType = "type1" | "type2";

export interface EventConfig {
  key: string;
  label: string;
  listenerType: ListenerType;
}

export interface ComponentEvents {
  name: string;
  rise?: EventConfig[];
  riseListen?: EventConfig[];
  self?: EventConfig[];
  enabled: boolean;
}
