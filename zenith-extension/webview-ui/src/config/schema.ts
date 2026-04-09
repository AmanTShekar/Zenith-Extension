export interface PropertyDefinition {
  label: string;
  type: 'text' | 'number' | 'select' | 'color' | 'slider' | 'radio';
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  unit?: string;
  /** Show this field only when a sibling field matches a specific value */
  showWhen?: { field: string; value: string };
}

export interface SectionDefinition {
  title: string;
  properties: Record<string, PropertyDefinition>;
}

export const DESIGN_SCHEMA: Record<string, SectionDefinition> = {
  layout: {
    title: 'Layout',
    properties: {
      display: {
        label: 'Display',
        type: 'radio',
        options: [
          { label: 'Block', value: 'block' },
          { label: 'Flex', value: 'flex' },
          { label: 'Grid', value: 'grid' },
          { label: 'None', value: 'none' },
        ],
      },
      position: {
        label: 'Position',
        type: 'radio',
        options: [
          { label: 'Relative', value: 'relative' },
          { label: 'Absolute', value: 'absolute' },
          { label: 'Fixed', value: 'fixed' },
          { label: 'Sticky', value: 'sticky' },
        ],
      },
      flexDirection: {
        label: 'Direction',
        type: 'radio',
        options: [
          { label: 'Row', value: 'row' },
          { label: 'Col', value: 'column' },
        ],
        showWhen: { field: 'display', value: 'flex' },
      },
      alignItems: {
        label: 'Align',
        type: 'select',
        options: [
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'flex-end' },
          { label: 'Stretch', value: 'stretch' },
          { label: 'Baseline', value: 'baseline' },
        ],
        showWhen: { field: 'display', value: 'flex' },
      },
      justifyContent: {
        label: 'Justify',
        type: 'select',
        options: [
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'flex-end' },
          { label: 'Between', value: 'space-between' },
          { label: 'Around', value: 'space-around' },
        ],
        showWhen: { field: 'display', value: 'flex' },
      },
      flexWrap: {
        label: 'Wrap',
        type: 'radio',
        options: [
          { label: 'No Wrap', value: 'nowrap' },
          { label: 'Wrap', value: 'wrap' },
        ],
        showWhen: { field: 'display', value: 'flex' },
      },
      gap: { label: 'Gap', type: 'text', unit: 'px' },
      gridTemplateColumns: {
        label: 'Grid Cols',
        type: 'text',
        showWhen: { field: 'display', value: 'grid' },
      },
      gridTemplateRows: {
        label: 'Grid Rows',
        type: 'text',
        showWhen: { field: 'display', value: 'grid' },
      },
    },
  },

  // ── Dimension ────────────────────────────────────────────────────────────
  dimensions: {
    title: 'Dimensions',
    properties: {
      width: { label: 'Width', type: 'text' },
      height: { label: 'Height', type: 'text' },
      minWidth: { label: 'Min W', type: 'text' },
      maxWidth: { label: 'Max W', type: 'text' },
      minHeight: { label: 'Min H', type: 'text' },
      maxHeight: { label: 'Max H', type: 'text' },
      overflow: {
        label: 'Overflow',
        type: 'select',
        options: [
          { label: 'Visible', value: 'visible' },
          { label: 'Hidden', value: 'hidden' },
          { label: 'Scroll', value: 'scroll' },
          { label: 'Auto', value: 'auto' },
        ],
      },
    },
  },

  // ── Spacing ───────────────────────────────────────────────────────────────
  spacing: {
    title: 'Spacing',
    properties: {
      paddingTop:    { label: 'Padding T',  type: 'text' },
      paddingRight:  { label: 'Padding R',  type: 'text' },
      paddingBottom: { label: 'Padding B',  type: 'text' },
      paddingLeft:   { label: 'Padding L',  type: 'text' },
      marginTop:     { label: 'Margin T',   type: 'text' },
      marginRight:   { label: 'Margin R',   type: 'text' },
      marginBottom:  { label: 'Margin B',   type: 'text' },
      marginLeft:    { label: 'Margin L',   type: 'text' },
    },
  },

  // ── Typography ────────────────────────────────────────────────────────────
  typography: {
    title: 'Typography',
    properties: {
      fontFamily: {
        label: 'Font',
        type: 'select',
        options: [
          { label: 'Inter',    value: 'Inter, sans-serif' },
          { label: 'Roboto',   value: 'Roboto, sans-serif' },
          { label: 'System',   value: 'system-ui' },
          { label: 'Mono',     value: 'monospace' },
          { label: 'Serif',    value: 'Georgia, serif' },
        ],
      },
      fontSize:    { label: 'Size',    type: 'text' },
      fontWeight: {
        label: 'Weight',
        type: 'select',
        options: [
          { label: 'Thin',   value: '100' },
          { label: 'Normal', value: '400' },
          { label: 'Medium', value: '500' },
          { label: 'SemiBold', value: '600' },
          { label: 'Bold',   value: '700' },
          { label: 'Black',  value: '900' },
        ],
      },
      lineHeight:   { label: 'Line H',   type: 'text' },
      letterSpacing: { label: 'Tracking', type: 'text' },
      color:        { label: 'Color',    type: 'color' },
      textAlign: {
        label: 'Align',
        type: 'radio',
        options: [
          { label: 'L',  value: 'left' },
          { label: 'C',  value: 'center' },
          { label: 'R',  value: 'right' },
          { label: 'J',  value: 'justify' },
        ],
      },
      textDecoration: {
        label: 'Decoration',
        type: 'select',
        options: [
          { label: 'None',      value: 'none' },
          { label: 'Underline', value: 'underline' },
          { label: 'Line Through', value: 'line-through' },
          { label: 'Overline',  value: 'overline' },
        ],
      },
      textTransform: {
        label: 'Transform',
        type: 'select',
        options: [
          { label: 'None',        value: 'none' },
          { label: 'Uppercase',   value: 'uppercase' },
          { label: 'Lowercase',   value: 'lowercase' },
          { label: 'Capitalize',  value: 'capitalize' },
        ],
      },
    },
  },

  // ── Appearance ────────────────────────────────────────────────────────────
  effects: {
    title: 'Appearance',
    properties: {
      backgroundColor: { label: 'Background', type: 'color' },
      opacity:         { label: 'Opacity',    type: 'slider', min: 0, max: 1 },
      borderRadius:    { label: 'Radius',     type: 'text' },
      borderWidth:     { label: 'Border W',   type: 'text' },
      borderColor:     { label: 'Border C',   type: 'color' },
      borderStyle: {
        label: 'Border S',
        type: 'select',
        options: [
          { label: 'Solid',  value: 'solid' },
          { label: 'Dashed', value: 'dashed' },
          { label: 'Dotted', value: 'dotted' },
          { label: 'None',   value: 'none' },
        ],
      },
      boxShadow:       { label: 'Shadow',     type: 'text' },
      backdropFilter:  { label: 'Blur',       type: 'text' },
    },
  },

  // ── Transform ─────────────────────────────────────────────────────────────
  transform: {
    title: 'Transform',
    properties: {
      transform:       { label: 'Transform',  type: 'text' },
      transformOrigin: { label: 'Origin',     type: 'text' },
      transition:      { label: 'Transition', type: 'text' },
      zIndex:          { label: 'Z-Index',    type: 'number' },
    },
  },
};
