declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module "*.jsx" {
  var _: () => any;
  export default _;
}

declare module "*.module.css";
declare module "*.module.scss";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.png";
declare module "*.json";
