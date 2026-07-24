"use client";

import { memo } from "react";
import { Box, chakra, IconButton, Link, Stack, VStack } from "@chakra-ui/react";
import { LinkIcon, TrashIcon } from "@/components/ui/icons";
import { useAtsMode } from "@/hooks/store/useAtsMode";
import { useProjects } from "@/hooks/store/useProjects";
import { t } from "@/lib/i18n";
import { shouldRenderProjectLink } from "@/lib/resume/projectLink";
import { sanitizeProjectUrl } from "@/lib/resume/sanitizeUrl";
import type { Direction, ProjectItem } from "@/types";
import { EditableText, SIZE_EM } from "./EditableText";
import { ITEM_HOVER_OUTLINE, itemRemoveButtonProps } from "./HoverFrame";
import { SectionOptionsGear } from "./SectionOptionsGear";

interface ProjectItemBlockProps {
  item: ProjectItem;
  direction: Direction;
  accentColor: string;
  /**
   * 2-up sub-grid CELL composition (the timeline-panel design, exclusive to
   * it): name / plain muted link / description at the reference's pinned type
   * (12.5px/700 name, 10.5px link, 11px description — the `PROJECT_CELL_*`
   * paint↔reserve constants), with no bottom padding (the grid's row gap owns
   * the rhythm). Must match the flow's `LayoutMetrics.projectsGrid`.
   */
  gridCell?: boolean;
  /** Prose line-height for the grid cell's description, when a design pins it
   *  (the reference's 1.6). Mirrors `LayoutMetrics.proseLineHeights.body`. */
  proseLineHeight?: string;
}

export const ProjectItemBlock = memo(function ProjectItemBlock({
  item,
  direction,
  accentColor,
  gridCell = false,
  proseLineHeight,
}: ProjectItemBlockProps) {
  const { updateProject, removeProject } = useProjects();
  // ATS Friendly mode drops the inline link glyph but keeps the URL text.
  const ats = useAtsMode();
  const accent = `var(--rz-secondary, ${accentColor})`;
  // Every rendered field of a visible section validates (see ExperienceItemBlock).
  const validate = true;

  if (gridCell) {
    return (
      <Box className="group" position="relative" dir={direction} borderRadius="md" _hover={ITEM_HOVER_OUTLINE}>
        <VStack align="stretch" gap="0" pe="6">
          <EditableText
            value={item.name}
            onChange={(value) => updateProject(item.id, { name: value })}
            placeholder={t.projects.namePlaceholder}
            validate={validate}
            fontWeight="700"
            fontSize="0.8333em"
            color={accent}
          />
          {shouldRenderProjectLink(item) ? (
            <Stack direction="row" gap="1" align="center" mt="1px">
              {ats ? null : item.link.trim().length > 0 ? (
                <Link
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  fontSize="0.7em"
                  color="fg.muted"
                  flexShrink={0}
                  textDecoration="none"
                  _hover={{ textDecoration: "underline" }}
                >
                  <LinkIcon />
                </Link>
              ) : (
                <chakra.span fontSize="0.7em" color="fg.muted" display="inline-flex" flexShrink={0}>
                  <LinkIcon />
                </chakra.span>
              )}
              <Box minWidth="0" fontSize="0.7em">
                <chakra.span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
                  <EditableText
                    value={item.link}
                    onChange={(value) => updateProject(item.id, { link: sanitizeProjectUrl(value) })}
                    placeholder={t.projects.linkPlaceholder}
                    validate={validate}
                    fontSize="1em"
                    color="fg.muted"
                    autoWidth
                  />
                </chakra.span>
              </Box>
            </Stack>
          ) : null}
          <Box mt="3px" lineHeight={proseLineHeight}>
            <EditableText
              value={item.description}
              onChange={(value) => updateProject(item.id, { description: value })}
              placeholder={t.projects.descriptionPlaceholder}
              validate={validate}
              multiline
              fontSize="0.7333em"
              color="var(--rz-body, #3f3f46)"
            />
          </Box>
        </VStack>

        <Box className="no-print" display="flex" position="absolute" insetInlineEnd="0" top="0">
          <SectionOptionsGear sectionType="projects" item={item} />
          <IconButton
            aria-label={t.projects.removeEntry}
            {...itemRemoveButtonProps}
            onClick={() => removeProject(item.id)}
          >
            <TrashIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="group"
      position="relative"
      dir={direction}
      pb="2"
      borderRadius="md"
      _hover={ITEM_HOVER_OUTLINE}
    >
      <VStack align="stretch" gap="0.5" pe="6">
        {/* No align="baseline" here: in a column flex container Chrome resolves
            baseline alignment to the physical LEFT edge, ignoring dir="rtl" — a
            shrink-wrapped child (the link row) then sits detached from the
            inline-start edge under RTL. Default stretch keeps every child
            full-width and flush, exactly like the name field. */}
        <Stack gap={0.5} mb={1.5}>
          <EditableText
            value={item.name}
            onChange={(value) => updateProject(item.id, { name: value })}
            placeholder={t.projects.namePlaceholder}
            validate={validate}
            fontWeight="bold"
            fontSize="sm"
            color={accent}
          />
          {/* The link ROW exists iff the shared predicate says so — lib/pagination
              counts this row with the same call, so the editor, /print and the
              estimate agree. The URL text is ALWAYS the editable field (the only
              way to type or change a link); the icon carries the external anchor,
              so a filled link stays a real, clickable href on /print and /share.
              The row inherits the ambient direction — only the URL characters are
              bidi-isolated LTR — so under RTL its inline-start edge stays flush
              with the name and description rows. */}
          {shouldRenderProjectLink(item) ? (
            <Stack direction="row" gap="1" align="center">
              {ats ? null : item.link.trim().length > 0 ? (
                <Link
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  // The SAME em value as the editable field beside it (and as the
                  // estimator's EM_BODY) so the icon tracks the font-scale slider;
                  // a rem token would stop scaling with the résumé text.
                  fontSize={SIZE_EM.xs}
                  color={accent}
                  flexShrink={0}
                  textDecoration="none"
                  _hover={{ textDecoration: "underline" }}
                >
                  <LinkIcon />
                </Link>
              ) : (
                // No stored URL yet: the icon is inert (never <a href=""> or
                // <a href="#">) and the field shows its placeholder.
                <chakra.span
                  fontSize={SIZE_EM.xs}
                  color={accent}
                  display="inline-flex"
                  flexShrink={0}
                >
                  <LinkIcon />
                </chakra.span>
              )}
              {/* The URL text's flex item. `minWidth="0"` lets it shrink so a long
                  URL scrolls inside the field instead of forcing the row past one
                  line — a WIDTH concern only, deliberately kept OFF the isolation
                  element below. Carries NO dir/direction: it inherits the section's
                  direction, exactly like the name and description rows. (A direct
                  flex child is blockified, so the isolation cannot live here and
                  stay inline.) */}
              {/* The row's line box is struck by THIS block container's own font
                  metrics, so it carries the field's body size itself (0.8em →
                  an 18px line at defaults) — at the inherited 1em the strut was
                  22.5px, 4.5px taller than the estimator's EM_BODY row. The
                  field then takes "1em" of this box so its glyphs are unchanged. */}
              <Box minWidth="0" fontSize={SIZE_EM.xs}>
                {/* Bidi isolation on THIS pure inline element — its parent is a
                    block, not the flex row, so it is not blockified. direction:ltr
                    + unicode-bidi:isolate is the <bdi> mechanism: it orders only
                    the Latin URL glyphs and adds no alignment, width, or margin. */}
                <chakra.span style={{ direction: "ltr", unicodeBidi: "isolate" }}>
                  <EditableText
                    value={item.link}
                    onChange={(value) => updateProject(item.id, { link: sanitizeProjectUrl(value) })}
                    placeholder={t.projects.linkPlaceholder}
                    validate={validate}
                    fontSize="1em"
                    color={accent}
                    autoWidth
                  />
                </chakra.span>
              </Box>
            </Stack>
          ) : null}
        </Stack>

        <EditableText
          value={item.description}
          onChange={(value) => updateProject(item.id, { description: value })}
          placeholder={t.projects.descriptionPlaceholder}
          validate={validate}
          multiline
          fontSize="xs"
          color="var(--rz-body, #3f3f46)"
        />
      </VStack>

      {/* Item chrome overlay — off the layout flow (content clears it via the
          pre-existing pe="6"). DOM order gear→trash keeps the trash flush at
          the inline-end corner it has always occupied. */}
      <Box
        className="no-print"
        display="flex"
        position="absolute"
        insetInlineEnd="0"
        top="0"
      >
        <SectionOptionsGear sectionType="projects" item={item} />
        <IconButton
          aria-label={t.projects.removeEntry}
          {...itemRemoveButtonProps}
          onClick={() => removeProject(item.id)}
        >
          <TrashIcon />
        </IconButton>
      </Box>
    </Box>
  );
});
