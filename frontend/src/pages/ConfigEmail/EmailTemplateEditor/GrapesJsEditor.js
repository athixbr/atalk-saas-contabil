import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import grapesjs from "grapesjs/dist/grapes.min";
import gjsPresetNewsletter from "grapesjs-preset-newsletter";
import "grapesjs/dist/css/grapes.min.css";
import api from "../../../services/api";
import { registerCustomBlocks, VARIABLE_CSS } from "./blocks";

const GrapesJsEditor = forwardRef(({ initialHtml, initialProjectData }, ref) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const activeRteRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getHtml: () => {
      const editor = editorRef.current;
      if (!editor) return "";
      return `${editor.getHtml()}<style>${editor.getCss()}</style>`;
    },
    getProjectData: () => (editorRef.current ? editorRef.current.getProjectData() : null),
    insertVariable: (key) => {
      const editor = editorRef.current;
      if (!editor) return;
      const html = `<span class="gjs-var" data-var="{{${key}}}" contenteditable="false">{{${key}}}</span>`;
      if (activeRteRef.current) {
        activeRteRef.current.insertHTML(html);
      } else {
        editor.addComponents(html);
      }
    },
  }));

  useEffect(() => {
    const editor = grapesjs.init({
      container: containerRef.current,
      height: "100%",
      width: "auto",
      fromElement: false,
      storageManager: false,
      plugins: [gjsPresetNewsletter],
      pluginsOpts: {
        [gjsPresetNewsletter]: {},
      },
      assetManager: {
        upload: `${process.env.REACT_APP_BACKEND_URL}/email-templates/upload-image`,
        uploadName: "file",
        multiUpload: false,
        params: { typeArch: "email-templates" },
        headers: {
          Authorization: api.defaults.headers.Authorization,
        },
        autoAdd: true,
      },
    });

    registerCustomBlocks(editor);

    editor.on("load", () => {
      const doc = editor.Canvas.getDocument();
      const style = doc.createElement("style");
      style.innerHTML = VARIABLE_CSS;
      doc.head.appendChild(style);

      if (initialProjectData) {
        editor.loadProjectData(initialProjectData);
      } else if (initialHtml) {
        editor.setComponents(initialHtml);
      }
    });

    editor.on("rte:enable", (view, rte) => {
      activeRteRef.current = rte;
    });
    editor.on("rte:disable", () => {
      activeRteRef.current = null;
    });

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} style={{ height: "100%" }} />;
});

export default GrapesJsEditor;
