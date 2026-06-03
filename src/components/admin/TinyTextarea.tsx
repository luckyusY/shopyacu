"use client";

import { useEffect, useId, useRef, useState } from "react";

const tinyMceSrc =
  "https://cdn.tiny.cloud/1/wp1cro1p0yeuzcvdwyejs4pfm061yj4mzoflk6yak9z6obef/tinymce/8/tinymce.min.js";

type TinyMCEEditor = {
  getContent: () => string;
  setContent: (value: string) => void;
  remove: () => void;
  on: (event: string, callback: () => void) => void;
};

type TinyMCEGlobal = {
  init: (options: Record<string, unknown>) => Promise<TinyMCEEditor[]>;
  get: (id: string) => TinyMCEEditor | null;
};

declare global {
  interface Window {
    tinymce?: TinyMCEGlobal;
  }
}

let tinyMcePromise: Promise<void> | null = null;

function loadTinyMce() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.tinymce) return Promise.resolve();
  if (tinyMcePromise) return tinyMcePromise;

  tinyMcePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${tinyMceSrc}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load TinyMCE.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = tinyMceSrc;
    script.referrerPolicy = "origin";
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load TinyMCE."));
    document.head.appendChild(script);
  });

  return tinyMcePromise;
}

export function TinyTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = `tiny-${generatedId}`;
  const latestValue = useRef(value);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    latestValue.current = value;
    const editor = window.tinymce?.get(id);
    if (editor && editor.getContent() !== value) {
      editor.setContent(value || "");
    }
  }, [id, value]);

  useEffect(() => {
    let cancelled = false;

    loadTinyMce()
      .then(async () => {
        if (cancelled || !window.tinymce) return;

        const [editor] = await window.tinymce.init({
          selector: `#${id}`,
          height: 260,
          menubar: false,
          branding: false,
          promotion: false,
          plugins: "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
          toolbar:
            "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
          setup: (instance: TinyMCEEditor) => {
            instance.on("init", () => {
              instance.setContent(latestValue.current || "");
              setReady(true);
            });
            instance.on("change keyup undo redo input", () => onChangeRef.current(instance.getContent()));
          },
        });

        if (cancelled) editor?.remove();
      })
      .catch(() => setReady(false));

    return () => {
      cancelled = true;
      window.tinymce?.get(id)?.remove();
    };
  }, [id]);

  return (
    <textarea
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${className || ""} ${ready ? "opacity-0" : ""}`}
    />
  );
}
