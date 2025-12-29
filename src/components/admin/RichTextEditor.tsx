import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  height?: number;
  disabled?: boolean;
}

const toolbarOptions = [
  'undo redo | formatselect | bold italic underline | forecolor backcolor |',
  'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |',
  'link removeformat | code'
].join(' ');

export default function RichTextEditor({ value, onChange, id, height = 280, disabled = false }: RichTextEditorProps) {
  const apiKey = process.env.REACT_APP_TINYMCE_API_KEY || undefined;

  return (
    <Editor
      id={id}
      apiKey={apiKey}
      value={value}
      onEditorChange={(content) => onChange(content)}
      disabled={disabled}
      init={{
        height,
        menubar: false,
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'table',
          'help',
          'wordcount'
        ],
        toolbar: disabled ? false : toolbarOptions,
        branding: false,
        statusbar: false,
        content_style:
          'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size:14px }'
      }}
    />
  );
}