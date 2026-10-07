/** Result of an admin form action, consumed by useActionState in the client form component. */
export type FormState = { ok: boolean; message: string; fieldErrors?: Record<string, string> } | null;

export type FormAction = (previous: FormState, formData: FormData) => Promise<FormState>;
