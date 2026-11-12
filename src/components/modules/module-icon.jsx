import {
  ArchiveIcon,
  BarChart3Icon,
  BoxIcon,
  BuildingIcon,
  CheckSquareIcon,
  ClipboardCheckIcon,
  DatabaseIcon,
  FileTextIcon,
  GitBranchIcon,
  InboxIcon,
  KeyIcon,
  LockIcon,
  ScaleIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"

/** Icons a module can use (stored as these names). Unknown names show a box. */
export const MODULE_ICONS = {
  search: SearchIcon,
  database: DatabaseIcon,
  "check-square": CheckSquareIcon,
  inbox: InboxIcon,
  building: BuildingIcon,
  "shield-alert": ShieldAlertIcon,
  archive: ArchiveIcon,
  "bar-chart-3": BarChart3Icon,
  "clipboard-check": ClipboardCheckIcon,
  "git-branch": GitBranchIcon,
  "file-text": FileTextIcon,
  "shield-check": ShieldCheckIcon,
  lock: LockIcon,
  key: KeyIcon,
  users: UsersIcon,
  scale: ScaleIcon,
}

export function ModuleIcon({ name, className = "size-4" }) {
  const Icon = MODULE_ICONS[name] ?? BoxIcon
  return <Icon className={className} aria-hidden="true" />
}
