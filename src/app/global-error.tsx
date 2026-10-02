'use client';

/**
 * Last-resort error UI when the root layout itself fails. It replaces the whole document,
 * so it cannot use translations or theme tokens; keep it plain and bilingual.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Something went wrong / حدث خطأ ما</h1>
          <button type="button" onClick={() => retry()}>
            Try again / حاول مجدداً
          </button>
        </main>
      </body>
    </html>
  );
}
