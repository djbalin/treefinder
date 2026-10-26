// Gives `useTranslations`/`getTranslations` autocomplete and compile-time
// checking against the Danish catalog, which is the source of truth.
type Messages = typeof import("./messages/da.json");

declare interface IntlMessages extends Messages {}
