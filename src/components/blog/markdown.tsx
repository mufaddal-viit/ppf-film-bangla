import type { ReactNode } from 'react';
import type { Block, Inline } from '@/lib/blog/markdown';

function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return node.value;
      case 'code':
        return <code key={index}>{node.value}</code>;
      case 'strong':
        return <strong key={index}>{renderInline(node.children)}</strong>;
      case 'em':
        return <em key={index}>{renderInline(node.children)}</em>;
      case 'link':
        return (
          <a key={index} href={node.href} {...(node.external && { target: '_blank', rel: 'noopener noreferrer' })}>
            {renderInline(node.children)}
          </a>
        );
    }
  });
}

/** Renders parsed post Markdown as elements. Styling comes from the .c-prose wrapper. */
export function Markdown({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case 'heading': {
        const Tag = block.level === 2 ? 'h2' : 'h3';
        return (
          <Tag key={index} id={block.id}>
            {renderInline(block.children)}
          </Tag>
        );
      }
      case 'paragraph':
        return <p key={index}>{renderInline(block.children)}</p>;
      case 'quote':
        return <blockquote key={index}>{renderInline(block.children)}</blockquote>;
      case 'list': {
        const Tag = block.ordered ? 'ol' : 'ul';
        return (
          <Tag key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item)}</li>
            ))}
          </Tag>
        );
      }
    }
  });
}
