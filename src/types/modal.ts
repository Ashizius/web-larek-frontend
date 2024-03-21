export interface IModalWindow {
  open: () => void;
  close: () => void;
  setContent(value: HTMLElement): IModalWindow;
}
