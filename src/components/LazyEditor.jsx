import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import PropTypes from 'prop-types';

function LazyEditor(props) {
  const { element, init, onEditorChange, plugins, toolbar, value } = props;

  return (
    <Editor
      init={init}
      value={value}
      onEditorChange={(e) => onEditorChange(e, element)}
      plugins={plugins}
      toolbar={toolbar}
    />
  );
}
LazyEditor.propTypes = {
  element: PropTypes.string.isRequired,
  init: PropTypes.object.isRequired,
  onEditorChange: PropTypes.func.isRequired,
  plugins: PropTypes.array.isRequired,
  toolbar: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
};
export default LazyEditor;
