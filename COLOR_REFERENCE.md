# Theme Colors Reference Card

## 🎨 Quick Color Palette

### Default Theme
```
Primary:              #3f51b5 (Indigo)
Primary Light:        #5f6fbf
Primary Dark:         #2c3aa3
Secondary:            #f50057 (Pink)
Secondary Light:      #f73378
Secondary Dark:       #ab003c
Background:           #fafafa (Light Gray)
Paper/Card:           #ffffff (White)
Text Primary:         rgba(0, 0, 0, 0.87)
Text Secondary:       rgba(0, 0, 0, 0.60)
```

### Black & Yellow Theme (Logo)
```
Primary:              #FFC107 (Yellow)
Primary Light:        #FFD54F
Primary Dark:         #FFA000
Secondary:            #000000 (Black)
Secondary Light:      #424242
Secondary Dark:       #000000
Background:           #FFFEF5 (Very Light Yellow)
Paper/Card:           #FFFFFF (White)
Text Primary:         #000000 (Black)
Text Secondary:       rgba(0, 0, 0, 0.70)
```

### Semantic Colors (Both Themes)
```
Success:              #4caf50 (Green)
Warning:              #ff9800 (Orange)
Error:                #f44336 (Red)
Info:                 #2196f3 (Blue)
```

---

## 🎯 Where Each Color Is Used

### Primary Color (#3f51b5 or #FFC107)
- Buttons (primary variant)
- Links
- Active states
- Highlights
- Focus indicators

### Secondary Color (#f50057 or #000000)
- Secondary buttons
- Accents
- Emphasis text
- Hover states

### Background (Page)
- Page background
- Body background
- Overall app background

### Paper/Card Background
- Cards
- Dialogs
- Modals
- Panels

### Text Primary
- Body text
- Headings
- Main content

### Text Secondary
- Helper text
- Disabled text
- Labels
- Captions

---

## 🖌️ CSS Usage Examples

### In Tailwind Classes
```html
<!-- Using primary color -->
<button class="bg-indigo-600">Default</button>
<button class="bg-yellow-400">Logo Theme</button>

<!-- Using text colors -->
<p class="text-gray-900">Default</p>
<p class="text-black">Logo Theme</p>
```

### In MUI sx Prop
```javascript
<Box sx={{
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.text.primary,
  padding: theme.spacing(2)
}}>
  Content
</Box>
```

### In Inline Styles
```javascript
const style = {
  backgroundColor: muiTheme.palette.background.default,
  color: muiTheme.palette.text.primary,
  borderColor: muiTheme.palette.primary.main,
};
```

### In CSS Variables (Optional)
```css
:root {
  --color-primary: #3f51b5;
  --color-secondary: #f50057;
  --color-bg: #fafafa;
  --color-text: rgba(0, 0, 0, 0.87);
}

.my-button {
  background-color: var(--color-primary);
  color: var(--color-text);
}
```

---

## 📊 Color Contrast Analysis

### Default Theme
- Dark text on light background: ✅ Good contrast (WCAG AA)
- White button text on indigo: ✅ Good contrast (WCAG AAA)
- Gray text on white: ✅ Good contrast (WCAG AA)

### Black & Yellow Theme
- Black text on yellow: ✅ Excellent contrast (WCAG AAA)
- Yellow button on black: ✅ Excellent contrast (WCAG AAA)
- Black text on white: ✅ Perfect contrast (WCAG AAA)

---

## 🎨 RGB/HSL Conversions

### Default Theme
```
#3f51b5 = rgb(63, 81, 181) = hsl(225, 48%, 48%)
#f50057 = rgb(245, 0, 87) = hsl(327, 100%, 48%)
#fafafa = rgb(250, 250, 250) = hsl(0, 0%, 98%)
```

### Black & Yellow Theme
```
#FFC107 = rgb(255, 193, 7) = hsl(44, 100%, 51%)
#000000 = rgb(0, 0, 0) = hsl(0, 0%, 0%)
#FFFEF5 = rgb(255, 254, 245) = hsl(36, 100%, 98%)
```

---

## 🌙 Dark Mode Consideration

If dark mode is added in future:

```javascript
// Suggested dark theme colors
const darkTheme = {
  primary: '#90CAF9',      // Light blue
  secondary: '#F48FB1',    // Light pink
  background: '#121212',   // Very dark gray
  paper: '#1E1E1E',        // Dark gray
  text_primary: '#FFFFFF', // White
  text_secondary: '#B0BEC5' // Light gray
};
```

---

## 🔄 Accessibility Considerations

✅ **Color Contrast Ratios**
- All text meets WCAG AA standards minimum
- Black & Yellow theme: WCAG AAA (excellent)
- Default theme: WCAG AA (good)

✅ **Color Blindness**
- Themes work for protanopia (red-blind)
- Themes work for deuteranopia (green-blind)
- Themes work for tritanopia (blue-yellow blind)

✅ **Recommendations**
- Don't rely solely on color for important info
- Use icons and text labels alongside colors
- Ensure sufficient brightness difference

---

## 📐 Material Design Compliance

Both themes follow Material Design 3 guidelines:

- ✅ Color accessibility standards
- ✅ Consistent tonal system
- ✅ Semantic color usage
- ✅ Touch target sizes
- ✅ Typography hierarchy

---

## 💡 Tips for Custom Themes

When adding new themes:

1. **Maintain contrast ratios** - 4.5:1 minimum for text
2. **Use semantic colors** - Consistent across themes
3. **Consider mood** - Colors should align with brand
4. **Test accessibility** - Use WCAG checkers
5. **Check colorblind** - Use tools like ColorBrewer

---

## 🔗 References

- Material Design: https://m3.material.io/
- WCAG Contrast Checker: https://webaim.org/resources/contrastchecker/
- Color Blindness Simulator: https://www.color-blindness.com/coblis-color-blindness-simulator/

---

## 📝 Notes

- All hex colors are case-insensitive (#FFC107 = #ffc107)
- RGB values go 0-255
- HSL: H=0-360°, S=0-100%, L=0-100%
- Opacity uses rgba() format in MUI
- Save this file as bookmark for quick reference!

Last Updated: 2024-12-17
