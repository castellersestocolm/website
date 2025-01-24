declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.jsx' {
    var _: () => any;
    export default _;
}

declare module "*.module.css";
declare module "*.module.scss";
