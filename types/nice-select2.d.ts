
declare module "nice-select2" {
  class NiceSelect {
    constructor(element: Element);
    unbind(): void;
  }
  export default NiceSelect;
}

interface HTMLSelectElement {
  _niceSelectInstance?: {
    unbind?: () => void;
  };
}
