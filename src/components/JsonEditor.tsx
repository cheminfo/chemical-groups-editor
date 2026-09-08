import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';

interface JsonEditorProps {
  value: string;
  /** @default false */
  readOnly?: boolean;
  /** @default '100%' */
  height?: string;
  onChange?: (value: string) => void;
}

/**
 * JSON editor with syntax colors and foldable blocks.
 * @param props - Text to show, its height and the change callback.
 * @returns The CodeMirror editor showing the JSON.
 */
export function JsonEditor(props: JsonEditorProps) {
  const { value, readOnly = false, height = '100%', onChange } = props;
  return (
    <CodeMirror
      value={value}
      height={height}
      readOnly={readOnly}
      extensions={[json()]}
      basicSetup={{ foldGutter: true, highlightActiveLine: !readOnly }}
      onChange={onChange}
    />
  );
}
