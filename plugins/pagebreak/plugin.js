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

    var global$1 = hugerte.util.Tools.resolve('hugerte.PluginManager');

    var global = hugerte.util.Tools.resolve('hugerte.Env');

    const option = name => editor => editor.options.get(name);
    const register$2 = editor => {
      const registerOption = editor.options.register;
      registerOption('pagebreak_separator', {
        processor: 'string',
        default: '<!-- pagebreak -->'
      });
      registerOption('pagebreak_split_block', {
        processor: 'boolean',
        default: false
      });
    };
    const getSeparatorHtml = option('pagebreak_separator');
    const shouldSplitBlock = option('pagebreak_split_block');

    const pageBreakClass = 'mce-pagebreak';
    const getPlaceholderHtml = shouldSplitBlock => {
      const html = `<img src="${ global.transparentSrc }" class="${ pageBreakClass }" data-mce-resize="false" data-mce-placeholder />`;
      return shouldSplitBlock ? `<p>${ html }</p>` : html;
    };
    const setup$1 = editor => {
      const separatorHtml = getSeparatorHtml(editor);
      const shouldSplitBlock$1 = () => shouldSplitBlock(editor);
      const pageBreakSeparatorRegExp = new RegExp(separatorHtml.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, a => {
        return '\\' + a;
      }), 'gi');
      editor.on('BeforeSetContent', e => {
        e.content = e.content.replace(pageBreakSeparatorRegExp, getPlaceholderHtml(shouldSplitBlock$1()));
      });
      editor.on('PreInit', () => {
        editor.serializer.addNodeFilter('img', nodes => {
          let i = nodes.length, node, className;
          while (i--) {
            node = nodes[i];
            className = node.attr('class');
            if (className && className.indexOf(pageBreakClass) !== -1) {
              const parentNode = node.parent;
              if (parentNode && editor.schema.getBlockElements()[parentNode.name] && shouldSplitBlock$1()) {
                parentNode.type = 3;
                parentNode.value = separatorHtml;
                parentNode.raw = true;
                node.remove();
                continue;
              }
              node.type = 3;
              node.value = separatorHtml;
              node.raw = true;
            }
          }
        });
      });
    };

    const register$1 = editor => {
      editor.addCommand('mcePageBreak', () => {
        editor.insertContent(getPlaceholderHtml(shouldSplitBlock(editor)));
      });
    };

    const setup = editor => {
      editor.on('ResolveName', e => {
        if (e.target.nodeName === 'IMG' && editor.dom.hasClass(e.target, pageBreakClass)) {
          e.name = 'pagebreak';
        }
      });
    };

    const onSetupEditable = editor => api => {
      const nodeChanged = () => {
        api.setEnabled(editor.selection.isEditable());
      };
      editor.on('NodeChange', nodeChanged);
      nodeChanged();
      return () => {
        editor.off('NodeChange', nodeChanged);
      };
    };
    const register = editor => {
      const onAction = () => editor.execCommand('mcePageBreak');
      editor.ui.registry.addButton('pagebreak', {
        icon: 'page-break',
        tooltip: 'Page break',
        onAction,
        onSetup: onSetupEditable(editor)
      });
      editor.ui.registry.addMenuItem('pagebreak', {
        text: 'Page break',
        icon: 'page-break',
        onAction,
        onSetup: onSetupEditable(editor)
      });
    };

    var Plugin = () => {
      global$1.add('pagebreak', editor => {
        register$2(editor);
        register$1(editor);
        register(editor);
        setup$1(editor);
        setup(editor);
      });
    };

    Plugin();

})();
