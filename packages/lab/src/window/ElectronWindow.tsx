import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";

import {
  injectStyleIntoGivenDocument,
  ToolkitProvider,
  useTheme,
} from "@jpmorganchase/uitk-core";
import { Window as ToolkitWindow, windowType } from "./WindowContext";
import { useForkRef } from "../utils";

import styleBase from "./ElectronWindow.css";
import { useWindowParentContext, WindowParentContext } from "./desktop-utils";
import { isDesktop } from "./electron-utils";

const Window: windowType = forwardRef(function ElectronWindow(
  { className, children, id = "dialog", open = true, style = {}, ...rest },
  forwardedRef
) {
  const { top, left, position, ...styleRest } = style;

  const [mountNode, setMountNode] = useState<Element | null>(null);
  const [windowRef, setWindowRef] = useState<Window | null>(null);
  const windowRoot = useRef<HTMLDivElement>(null);

  const forkedRef = useForkRef(forwardedRef, windowRoot);

  const themes = new Set();

  for (const theme of useTheme()) {
    themes.add(theme.id);
  }

  if (!mountNode) {
    const win = window.open("", id);
    (win as Window).document.write(
      // eslint-disable-next-line no-restricted-globals
      `<html lang="en"><head><title>${id}</title><base href="${location.origin}"><style>body {margin: 0;}</style></head><body></body></html>`
    );
    document.head.querySelectorAll("style").forEach((htmlElement) => {
      if (
        Array.from(themes).some((v) =>
          // @ts-ignore
          htmlElement.textContent.includes(v)
        )
      )
        (win as Window).document.head.appendChild(htmlElement.cloneNode(true));
    });
    const bodyElement = (win as Window).document.body;
    setMountNode(bodyElement);
    setWindowRef(win);
  }

  injectStyleIntoGivenDocument(styleBase, windowRef?.document);

  const parentWindow = useWindowParentContext();

  const closeWindow = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      ipcRenderer.send("window-close", { id: id });
    }
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
      if (windowRoot.current) {
        // @ts-ignore
        const { scrollHeight: height, scrollWidth: width } = windowRoot.current;
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { ipcRenderer } = global as any;
        if (ipcRenderer) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          ipcRenderer.send("window-size", {
            id: id,
            height: Math.ceil(height + 1),
            width: Math.ceil(width + 1),
          });
        }
      }
    }, 70);
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        ipcRenderer.send("window-ready", { id: id });
      }, 100);
    }

    return () => {
      closeWindow();
    };
  }, [closeWindow, windowRef, id]);

  useLayoutEffect(() => {
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { ipcRenderer } = global as any;
      if (ipcRenderer) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        ipcRenderer.send("window-position", {
          id: id,
          parentWindowID: parentWindow.id,
          left: style.left,
          top: style.top,
        });
      }
    }, 80);
  }, [style]);

  return mountNode
    ? ReactDOM.createPortal(
        <ToolkitProvider currentDocument={windowRef?.document}>
          <WindowParentContext.Provider
            value={{
              top: (style.top as number) + parentWindow.top,
              left: (style.left as number) + parentWindow.left,
              id: id,
            }}
          >
            <div className="uitkWindow" ref={forkedRef}>
              <div className={className} style={{ ...styleRest }} {...rest}>
                {children}
              </div>
            </div>
          </WindowParentContext.Provider>
        </ToolkitProvider>,
        mountNode
      )
    : null;
});

export const ElectronWindow = isDesktop ? Window : ToolkitWindow;
