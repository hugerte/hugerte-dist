/**
 * HugeRTE version 1.0.6 (2024-12-20)
 * Copyright (c) 2022 Ephox Corporation DBA Tiny Technologies, Inc.
 * Copyright (c) 2024 HugeRTE contributors
 * Licensed under the MIT license (https://github.com/hugerte/hugerte/blob/main/LICENSE.TXT)
 * This file bundles the code of DOMPurify, which is dual-licensed under the Mozilla Public License v2.0 and the Apache License, Version 2.0, meaning you can use it under either one of those licenses.
 * Copyright 2024 Dr.-Ing. Mario Heiderich, Cure53
 * The code of DOMPurify included in this file has been modified. The latest original code of DOMPurify can be found at https://github.com/cure53/DOMPurify.
 */

(function () {
    'use strict';

    var global = hugerte.util.Tools.resolve('hugerte.PluginManager');

    const setContent = (editor, html) => {
      editor.focus();
      editor.undoManager.transact(() => {
        editor.setContent(html);
      });
      editor.selection.setCursorLocation();
      editor.nodeChanged();
    };
    const getContent = editor => {
      return editor.getContent({ source_view: true });
    };

    const open = editor => {
      const editorContent = getContent(editor);
      editor.windowManager.open({
        title: 'Source Code',
        size: 'large',
        body: {
          type: 'panel',
          items: [{
              type: 'textarea',
              name: 'code'
            }]
        },
        buttons: [
          {
            type: 'cancel',
            name: 'cancel',
            text: 'Cancel'
          },
          {
            type: 'submit',
            name: 'save',
            text: 'Save',
            primary: true
          }
        ],
        initialData: { code: editorContent },
        onSubmit: api => {
          setContent(editor, api.getData().code);
          api.close();
        }
      });
    };

    const register$1 = editor => {
      editor.addCommand('mceCodeEditor', () => {
        open(editor);
      });
    };

    const register = editor => {
      const onAction = () => editor.execCommand('mceCodeEditor');
      editor.ui.registry.addButton('code', {
        icon: 'sourcecode',
        tooltip: 'Source code',
        onAction
      });
      editor.ui.registry.addMenuItem('code', {
        icon: 'sourcecode',
        text: 'Source code',
        onAction
      });
    };

    var Plugin = () => {
      global.add('code', editor => {
        register$1(editor);
        register(editor);
        return {};
      });
    };

    Plugin();

})();
