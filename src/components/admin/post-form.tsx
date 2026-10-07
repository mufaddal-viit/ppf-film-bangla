import { POST_STATUSES, POST_STATUS_LABELS, type PostStatus } from '@/lib/admin/constants';
import type { FormAction } from '@/lib/admin/form-state';
import { AdminForm } from './admin-form';
import { Field, Panel } from './ui';

type Translation = { title: string; excerpt: string; body: string; seoTitle?: string; seoDescription?: string };

type PostFormProps = {
  action: FormAction;
  covers: ReadonlyArray<{ src: string; label: string }>;
  limits: { title: number; excerpt: number; body: number; seoTitle: number; seoDescription: number };
  defaultAuthor: string;
  post?: {
    id: string;
    slug: string;
    status: PostStatus;
    publishedAt: Date | null;
    author: string;
    cover?: string;
    tags: string[];
    translations: { en: Translation; ar?: Translation };
  };
};

const MARKDOWN_HINT =
  'Start a line with ## for a heading, - for a list item, > for a quote. Use **bold**, *italic* and [link text](https://…).';

function LanguageFields({
  code,
  value,
  limits,
  required,
}: {
  code: 'en' | 'ar';
  value: Translation | undefined;
  limits: PostFormProps['limits'];
  required: boolean;
}) {
  const dir = code === 'ar' ? 'rtl' : 'ltr';
  return (
    <>
      <Field label="Title">
        <input
          className="c-input"
          name={`title_${code}`}
          dir={dir}
          defaultValue={value?.title}
          maxLength={limits.title}
          required={required}
        />
      </Field>
      <Field label="Summary" hint="One or two sentences. Shown in the article list and under the title.">
        <textarea
          className="c-input"
          name={`excerpt_${code}`}
          dir={dir}
          rows={2}
          defaultValue={value?.excerpt}
          maxLength={limits.excerpt}
          required={required}
        />
      </Field>
      <Field label="Article" hint={MARKDOWN_HINT}>
        <textarea
          className="c-input c-admin-editor-body"
          name={`body_${code}`}
          dir={dir}
          rows={18}
          defaultValue={value?.body}
          maxLength={limits.body}
          required={required}
        />
      </Field>
      <details className="c-admin-disclosure">
        <summary>Search result text (optional)</summary>
        <Field label="Search title" hint={`Up to ${limits.seoTitle} characters. Leave empty to use the title.`}>
          <input
            className="c-input"
            name={`seoTitle_${code}`}
            dir={dir}
            defaultValue={value?.seoTitle}
            maxLength={limits.seoTitle}
          />
        </Field>
        <Field
          label="Search description"
          hint={`Up to ${limits.seoDescription} characters. Leave empty to use the summary.`}
        >
          <textarea
            className="c-input"
            name={`seoDescription_${code}`}
            dir={dir}
            rows={2}
            defaultValue={value?.seoDescription}
            maxLength={limits.seoDescription}
          />
        </Field>
      </details>
    </>
  );
}

/** The whole post editor: both languages on the left, publishing settings on the right. */
export function PostForm({ action, covers, limits, defaultAuthor, post }: PostFormProps) {
  return (
    <AdminForm action={action} submitLabel={post ? 'Save post' : 'Create post'} className="c-admin-editor">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="c-admin-stack">
        <Panel title="English">
          <LanguageFields code="en" value={post?.translations.en} limits={limits} required />
        </Panel>
        <Panel title="Arabic">
          <p className="c-admin-muted">
            Optional. Leave all three fields empty and the post appears on the English site only.
          </p>
          <LanguageFields code="ar" value={post?.translations.ar} limits={limits} required={false} />
        </Panel>
      </div>

      <div className="c-admin-stack">
        <Panel title="Publishing">
          <Field label="Status" hint="Drafts are only visible here in the admin panel.">
            <select className="c-input" name="status" defaultValue={post?.status ?? 'draft'}>
              {POST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {POST_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Publish date" hint="Leave empty to publish now. A future date schedules the post.">
            <input
              className="c-input"
              type="date"
              name="publishedOn"
              defaultValue={post?.publishedAt?.toISOString().slice(0, 10) ?? ''}
            />
          </Field>
          <Field label="Author">
            <input
              className="c-input"
              name="author"
              defaultValue={post?.author ?? defaultAuthor}
              maxLength={80}
              required
            />
          </Field>
        </Panel>

        <Panel title="Presentation">
          <Field label="Cover image">
            <select className="c-input" name="cover" defaultValue={post?.cover ?? ''}>
              <option value="">No image</option>
              {covers.map((cover) => (
                <option key={cover.src} value={cover.src}>
                  {cover.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Topics" hint="Separate with commas, for example: ppf, maintenance.">
            <input className="c-input" name="tags" defaultValue={post?.tags.join(', ')} maxLength={200} />
          </Field>
          <Field
            label="Web address"
            hint="English letters, numbers and dashes. Leave empty to build it from the English title."
          >
            <input className="c-input" name="slug" defaultValue={post?.slug} maxLength={80} />
          </Field>
        </Panel>
      </div>
    </AdminForm>
  );
}
