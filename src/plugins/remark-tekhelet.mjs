/**
 * Custom remark plugin for tekhelet content directives.
 * Transforms :::directive syntax into the correct HTML structures.
 *
 * Supported directives:
 *
 *   :::aramaic
 *   Hebrew text here
 *   ---
 *   Translation text here
 *   :::
 *
 *   :::callout[gold]
 *   Content here
 *   :::
 *
 *   :::term[Word]
 *   Definition here
 *   :::
 *
 *   :::diagram{num="Diagram 5" title="..." caption="..."}
 *   ![alt text](/path/to/image.svg)
 *   :::
 *
 *   ::subhead[Text here]
 */
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

export default function remarkTekhelet() {
  return (tree) => {
    visit(tree, (node) => {
      // Container directives (:::)
      if (node.type === 'containerDirective') {
        handleContainer(node);
      }
      // Leaf directives (::)
      if (node.type === 'leafDirective') {
        handleLeaf(node);
      }
    });
  };
}

function handleContainer(node) {
  const name = node.name;

  if (name === 'aramaic') {
    handleAramaic(node);
  } else if (name === 'callout') {
    handleCallout(node);
  } else if (name === 'term') {
    handleTerm(node);
  } else if (name === 'diagram') {
    handleDiagram(node);
  }
}

function handleLeaf(node) {
  if (node.name === 'subhead') {
    const text = getDirectiveLabel(node);
    const data = node.data || (node.data = {});
    data.hName = 'div';
    data.hProperties = { class: 'sub-head' };
    node.children = [{ type: 'text', value: text }];
  }
}

function handleAramaic(node) {
  const data = node.data || (node.data = {});

  // Split children on thematicBreak (---) to get segments
  const segments = [];
  let current = [];

  for (const child of node.children) {
    if (child.data?.directiveLabel) continue; // skip [label] if present
    if (child.type === 'thematicBreak') {
      segments.push(current);
      current = [];
    } else {
      current.push(child);
    }
  }
  segments.push(current);

  // Build the aramaic block structure
  // Segments come in pairs: hebrew, translation
  // Or if there's only one segment, it's hebrew-only
  const newChildren = [];

  if (segments.length === 1) {
    // Just hebrew, no translation
    newChildren.push({
      type: 'html',
      value: '<div class="aramaic-block"><div class="heb-block">'
    });
    newChildren.push(...segments[0]);
    newChildren.push({ type: 'html', value: '</div></div>' });
  } else if (segments.length === 2) {
    // Hebrew + translation
    newChildren.push({
      type: 'html',
      value: '<div class="aramaic-block"><div class="heb-block">'
    });
    newChildren.push(...segments[0]);
    newChildren.push({
      type: 'html',
      value: '</div><div class="heb-trans">'
    });
    newChildren.push(...segments[1]);
    newChildren.push({ type: 'html', value: '</div></div>' });
  } else {
    // Multiple segment pairs (for multi-part citations)
    // Every pair of segments is hebrew + translation
    // Odd segment at the end is hebrew-only (e.g. styled Rashi gloss)
    newChildren.push({ type: 'html', value: '<div class="aramaic-block">' });
    for (let i = 0; i < segments.length; i += 2) {
      if (i > 0) {
        newChildren.push({ type: 'html', value: '<hr class="aram-sep" />' });
      }
      // Check for style attribute on the directive
      const style = (i > 0 && node.attributes?.style2) ? node.attributes.style2 : null;
      const styleAttr = style ? ` style="${style}"` : '';

      newChildren.push({
        type: 'html',
        value: `<div class="heb-block"${styleAttr}>`
      });
      newChildren.push(...segments[i]);
      newChildren.push({ type: 'html', value: '</div>' });

      if (i + 1 < segments.length) {
        newChildren.push({
          type: 'html',
          value: '<div class="heb-trans">'
        });
        newChildren.push(...segments[i + 1]);
        newChildren.push({ type: 'html', value: '</div>' });
      }
    }
    newChildren.push({ type: 'html', value: '</div>' });
  }

  // Replace the node in-place
  data.hName = 'div';
  data.hProperties = {};
  node.children = newChildren;
  // Override: just output raw HTML
  node.type = 'html';
  node.value = buildAramaicHtml(node, segments);
  node.children = undefined;
}

function buildAramaicHtml(node, segments) {
  let html = '<div class="aramaic-block">';

  if (segments.length === 1) {
    html += '<div class="heb-block">' + childrenToText(segments[0]) + '</div>';
  } else if (segments.length === 2) {
    html += '<div class="heb-block">' + childrenToText(segments[0]) + '</div>';
    html += '<div class="heb-trans">' + childrenToText(segments[1]) + '</div>';
  } else {
    for (let i = 0; i < segments.length; i += 2) {
      if (i > 0) html += '<hr class="aram-sep" />';
      html += '<div class="heb-block">' + childrenToText(segments[i]) + '</div>';
      if (i + 1 < segments.length) {
        html += '<div class="heb-trans">' + childrenToText(segments[i + 1]) + '</div>';
      }
    }
  }

  html += '</div>';
  return html;
}

function handleCallout(node) {
  const { label, content } = extractLabelAndContent(node);
  const type = label || 'gold';
  node.type = 'html';
  node.value = `<div class="callout ${type}">${childrenToHtml(content)}</div>`;
  node.children = undefined;
}

function handleTerm(node) {
  const { label, content } = extractLabelAndContent(node);
  const word = label || '';
  node.type = 'html';
  node.value = `<div class="term"><div class="term-w">${word}</div><div class="term-d">${childrenToHtml(content)}</div></div>`;
  node.children = undefined;
}

function handleDiagram(node) {
  const attrs = node.attributes || {};
  const num = attrs.num || '';
  const title = attrs.title || '';
  const caption = attrs.caption || '';

  const { content } = extractLabelAndContent(node);
  let inner = childrenToHtml(content);

  let html = '<div class="dp">';
  if (num) html += `<div class="dp-num">${num}</div>`;
  if (title) html += `<div class="dp-title">${title}</div>`;
  html += `<div class="svg-wrap">${inner}</div>`;
  if (caption) html += `<div class="dp-cap">${caption}</div>`;
  html += '</div>';

  node.type = 'html';
  node.value = html;
  node.children = undefined;
}

// Helper: separate the [label] paragraph from content children
function extractLabelAndContent(node) {
  let label = '';
  const content = [];
  for (const child of (node.children || [])) {
    if (child.data?.directiveLabel) {
      label = childrenToText(child.children || [child]);
    } else {
      content.push(child);
    }
  }
  return { label, content };
}

// Helper: get the label text from a directive (the part in [brackets])
function getDirectiveLabel(node) {
  if (node.children && node.children.length > 0) {
    // For leaf directives, the label is in the children
    if (node.type === 'leafDirective') {
      return childrenToText(node.children);
    }
  }
  // For container directives, check the label property
  if (node.attributes && node.attributes.label) {
    return node.attributes.label;
  }
  // The label might be the first child's value for container directives
  // In remark-directive, the [label] part becomes the directive's "label"
  // which is stored differently depending on version
  if (node.children?.[0]?.data?.directiveLabel) {
    return childrenToText(node.children[0].children);
  }
  return '';
}

// Helper: convert AST children to plain text
function childrenToText(children) {
  if (!children) return '';
  return children.map(child => {
    if (child.type === 'text') return child.value;
    if (child.type === 'paragraph') return childrenToText(child.children);
    if (child.type === 'html') return child.value;
    if (child.children) return childrenToText(child.children);
    return '';
  }).join('');
}

// Helper: convert AST children to HTML string
function childrenToHtml(children) {
  if (!children) return '';
  return children.map(child => {
    if (child.type === 'text') return escapeHtml(child.value);
    if (child.type === 'html') return child.value;
    if (child.type === 'paragraph') return childrenToHtml(child.children);
    if (child.type === 'strong') return '<b>' + childrenToHtml(child.children) + '</b>';
    if (child.type === 'emphasis') return '<em>' + childrenToHtml(child.children) + '</em>';
    if (child.type === 'inlineCode') return '<code>' + escapeHtml(child.value) + '</code>';
    if (child.type === 'image') {
      return `<img src="${child.url}" alt="${child.alt || ''}" style="width:100%;display:block;border-radius:6px" />`;
    }
    if (child.children) return childrenToHtml(child.children);
    return '';
  }).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
