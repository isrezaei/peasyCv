/**
 * Single source of truth for every icon in the app. We standardize on the
 * Tabler set (`react-icons/tb`) so the toolbar, section gears, add/delete
 * affordances and contact glyphs all share one consistent, modern icon family.
 * Re-exporting under semantic names keeps call sites stable and lets us swap an
 * underlying glyph in exactly one place.
 */
export {
  TbPlus as PlusIcon,
  TbTrash as TrashIcon,
  TbSettings2 as GearIcon,
  TbCamera as CameraIcon,
  TbEye as EyeIcon,
  TbDownload as DownloadIcon,
  TbShare3 as ShareIcon,
  TbLogout as LogOutIcon,
  TbBold as BoldIcon,
  TbItalic as ItalicIcon,
  TbUnderline as UnderlineIcon,
  TbList as ListIcon,
  TbChevronDown as ChevronDownIcon,
  TbChevronRight as ChevronRightIcon,
  TbChevronLeft as ChevronLeftIcon,
  TbChevronsRight as ChevronsRightIcon,
  TbChevronsLeft as ChevronsLeftIcon,
  TbCheck as CheckIcon,
  TbGripVertical as GripIcon,
  TbDots as DotsIcon,
  TbX as CloseIcon,
  TbSparkles as SparklesIcon,
  TbWand as WandIcon,
  TbClipboardCheck as CheckTailorIcon,
  TbArrowsSort as RearrangeIcon,
  TbLayoutColumns as LayoutIcon,
  TbPalette as PaletteIcon,
  TbHome as HomeIcon,
  TbLink as LinkIcon,
  // Identity + contact glyphs.
  TbUser as UserIcon,
  TbPhone as PhoneIcon,
  TbMail as MailIcon,
  TbMapPin as MapPinIcon,
  TbCalendar as CalendarIcon,
  TbWorld as GlobeIcon,
  // Section glyphs — used by the icon-chip heading variant in the imported
  // templates. One per resume section type (see sectionIcon).
  TbFileText as SummaryIcon,
  TbBriefcase as ExperienceIcon,
  TbTools as SkillsIcon,
  TbSchool as EducationIcon,
  TbFolder as ProjectsIcon,
  TbLanguage as LanguagesIcon,
  TbCertificate as CertificationsIcon,
  // Design / layout controls.
  TbColorPicker as ColorPickerIcon,
  TbColorSwatch as ColorSwatchIcon,
  TbLayoutSidebarRightCollapse as SidebarCollapseIcon,
  TbLayoutSidebarRightExpand as SidebarExpandIcon,
  TbTextDirectionRtl as DirectionRtlIcon,
  TbTextDirectionLtr as DirectionLtrIcon,
} from "react-icons/tb";
