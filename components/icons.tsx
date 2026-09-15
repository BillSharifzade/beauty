/**
 * The icon set.
 *
 * Drawn here rather than pulled from an icon font, and drawn to one rule: a
 * 16-box, a 1.4px stroke, round caps. An icon set where one glyph is a
 * different weight is the detail that makes an interface look assembled
 * rather than designed. The composer's three (microphone, camera, stop) are
 * the exception — a 24-box at 1.5px, because they sit in 38px circles and the
 * 16-box drawings would float in them.
 */

type Props = { className?: string };
type Sized = { size?: number; className?: string };

function Glyph({
  size = 16,
  className,
  children,
}: Sized & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SparkIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        fill="currentColor"
      />
      <path
        d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 2.5v9M2.5 7h9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.5 1.5h1.8l1.6 8.2h7.3l1.4-6H4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.4" cy="13" r="1.1" fill="currentColor" />
      <circle cx="11.6" cy="13" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function CheckIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WarnIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 2.5 1.8 13h12.4L8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8 6.6v3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.4" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SyncIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13.6 1.9v3h-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SourceIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="8"
        cy="3.8"
        rx="5.2"
        ry="2.1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2.8 3.8v8.4c0 1.16 2.33 2.1 5.2 2.1s5.2-.94 5.2-2.1V3.8"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2.8 8c0 1.16 2.33 2.1 5.2 2.1s5.2-.94 5.2-2.1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function CatalogueIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2.5"
        width="12"
        height="11"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2 6.2h12M6.2 6.2v7.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/** One person. For the place a portrait or initials would go and there are
 *  neither — an account that has never given a name. */
export function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="5.4" r="2.7" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2.9 13.6c0-2.4 2.28-4.1 5.1-4.1s5.1 1.7 5.1 4.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6.2" cy="5.4" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M1.6 13.4c0-2.3 2.06-3.9 4.6-3.9s4.6 1.6 4.6 3.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M11.2 3.2a2.4 2.4 0 0 1 0 4.5M12.4 9.9c1.3.5 2.2 1.6 2.2 3.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BackIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.5 3.5L5 8l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.8 4.3h10.4M6.4 4.3V3.1c0-.4.33-.7.73-.7h1.74c.4 0 .73.3.73.7v1.2M4.2 4.3l.6 8.3c.03.5.44.9.94.9h4.52c.5 0 .91-.4.94-.9l.6-8.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparklesIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.4 1.8l1.1 3.1 3.1 1.1-3.1 1.1-1.1 3.1-1.1-3.1L2.2 6l3.1-1.1 1.1-3.1z"
        fill="currentColor"
      />
      <path
        d="M12.1 9.4l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7z"
        fill="currentColor"
        opacity="0.65"
      />
    </svg>
  );
}

/* ---- Navigation ---------------------------------------------------------- */

/** The overview: a house, because it is where the day starts. */
export function HomeIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M2.5 7.4 8 2.8l5.5 4.6v5.4a.9.9 0 0 1-.9.9H3.4a.9.9 0 0 1-.9-.9z" />
      <path d="M6.3 13.7V9.6h3.4v4.1" />
    </Glyph>
  );
}

/** Orders waiting for a decision: an in-tray. */
export function InboxIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M2.3 9.4V12a1.3 1.3 0 0 0 1.3 1.3h8.8A1.3 1.3 0 0 0 13.7 12V9.4" />
      <path d="M2.3 9.4 3.9 3.8h8.2l1.6 5.6" />
      <path d="M2.3 9.4h3.3l.9 1.8h3l.9-1.8h3.3" />
    </Glyph>
  );
}

/** Markdowns: a price tag. */
export function TagIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M2.3 8.2V3.1a.8.8 0 0 1 .8-.8h5.1l5.6 5.6-5.9 5.9z" />
      <circle cx="5.4" cy="5.4" r="0.9" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Demand: a line going up and to the right. */
export function TrendIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M2.4 12.4 6 8.4l2.6 2.4 4.9-5.4" />
      <path d="M10.4 5.4h3.1v3.1" />
    </Glyph>
  );
}

/** Returning customers: two arrows chasing each other. */
export function RepeatIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M3.1 6.6a5 5 0 0 1 8.6-2.2l1.2 1.3" />
      <path d="M13 2.6v3.1H9.9" />
      <path d="M12.9 9.4a5 5 0 0 1-8.6 2.2L3.1 10.3" />
      <path d="M3 13.4v-3.1h3.1" />
    </Glyph>
  );
}

/** Reports: a page with a folded corner. */
export function ReportIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M4 1.9h5.3l3.2 3.2v8.2a.8.8 0 0 1-.8.8H4a.8.8 0 0 1-.8-.8V2.7a.8.8 0 0 1 .8-.8z" />
      <path d="M9.1 1.9v3.3h3.3" />
      <path d="M5.7 8.3h4.6M5.7 10.8h4.6" />
    </Glyph>
  );
}

/** Setup: three sliders. */
export function SettingsIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M2.5 4.4h11M2.5 8h11M2.5 11.6h11" />
      <circle cx="5.6" cy="4.4" r="1.5" fill="var(--surface, #fff)" />
      <circle cx="10.6" cy="8" r="1.5" fill="var(--surface, #fff)" />
      <circle cx="6.8" cy="11.6" r="1.5" fill="var(--surface, #fff)" />
    </Glyph>
  );
}

/** The skin diary: a notebook. */
export function DiaryIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M3.3 2.6h6.4a2.8 2.8 0 0 1 2.8 2.8v8.1H5.3a2 2 0 0 0-2 2z" />
      <path d="M3.3 13.5a2 2 0 0 1 2-2h7.2" />
      <path d="M6.1 5.8h3.4" />
    </Glyph>
  );
}

/** The chat: a speech bubble. */
export function ChatIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M2.5 3.9a1.4 1.4 0 0 1 1.4-1.4h8.2a1.4 1.4 0 0 1 1.4 1.4v5.8a1.4 1.4 0 0 1-1.4 1.4H6.6l-2.9 2.6a.6.6 0 0 1-1.2-.4z" />
    </Glyph>
  );
}

/** The shop: an awning over a door. */
export function StoreIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M2.5 6.6 3.6 2.9h8.8l1.1 3.7" />
      <path d="M2.5 6.6v6a.9.9 0 0 0 .9.9h9.2a.9.9 0 0 0 .9-.9v-6" />
      <path d="M2.5 6.6a1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.6 0 1.85 1.85 0 0 0 3.7 0" />
      <path d="M6.4 13.5V9.7h3.2v3.8" />
    </Glyph>
  );
}

export function RecycleIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M13.2 2.6C7.6 2.4 3.4 5.6 2.7 12.9c7.2.4 10.7-3.2 10.5-10.3Z" />
      <path d="M2.7 12.9 8.6 7" />
    </Glyph>
  );
}

export function ShareIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M8 9.6V2.4" />
      <path d="M5.4 5 8 2.4 10.6 5" />
      <path d="M4.2 8.2v4.6a1 1 0 0 0 1 1h5.6a1 1 0 0 0 1-1V8.2" />
    </Glyph>
  );
}

export function SunIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <circle cx="8" cy="8" r="2.7" />
      <path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1" />
    </Glyph>
  );
}

export function MoonIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M13.3 9.7A5.6 5.6 0 0 1 6.3 2.7a5.6 5.6 0 1 0 7 7z" />
    </Glyph>
  );
}

export function LogoutIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M6.6 13.5H3.3a.8.8 0 0 1-.8-.8V3.3a.8.8 0 0 1 .8-.8h3.3" />
      <path d="M10.2 11.2 13.4 8l-3.2-3.2M13.4 8H6.3" />
    </Glyph>
  );
}

export function DownloadIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M8 2.5v8M4.8 7.3 8 10.5l3.2-3.2" />
      <path d="M2.8 11.2v1.3a1 1 0 0 0 1 1h8.4a1 1 0 0 0 1-1v-1.3" />
    </Glyph>
  );
}

export function InfoIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <circle cx="8" cy="8" r="5.8" />
      <path d="M8 7.2v3.6" />
      <circle cx="8" cy="5.1" r="0.55" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

export function ArrowRightIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M3 8h10M9.2 4.2 13 8l-3.8 3.8" />
    </Glyph>
  );
}

export function ChevronDownIcon(props: Sized) {
  return (
    <Glyph {...props}>
      <path d="M4 6.3 8 10.3l4-4" />
    </Glyph>
  );
}

/**
 * Microphone and camera.
 *
 * Drawn at a 24-box and 1.5px stroke: these sit in 38px circles in the
 * composer, where the 16-box drawings above would float.
 */
export function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.9a1 1 0 0 0 .83-.45l.94-1.4A1 1 0 0 1 10 3.7h4a1 1 0 0 1 .83.45l.94 1.4a1 1 0 0 0 .83.45h1.9A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function StopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  );
}
